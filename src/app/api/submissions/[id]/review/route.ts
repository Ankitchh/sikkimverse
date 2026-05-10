import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/generated/prisma'

// ─── Roles that can moderate ──────────────────────────────────────────────────

const MODERATOR_ROLES: UserRole[] = [
  'MODERATOR',
  'COMMUNITY_PRESIDENT',
  'ADMIN',
  'SUPER_ADMIN',
]

// ─── Validation schema ────────────────────────────────────────────────────────

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().min(10).max(1000).trim().optional(),
}).refine(
  (data) => data.status !== 'REJECTED' || !!data.rejectionReason,
  { message: 'A rejection reason is required when rejecting a submission.', path: ['rejectionReason'] },
)

// ─── PATCH /api/submissions/[id]/review ───────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const userRole = session.user.role as UserRole
    if (!MODERATOR_ROLES.includes(userRole)) {
      return NextResponse.json(
        { error: 'Moderator role or above is required to review submissions.' },
        { status: 403 },
      )
    }

    const { id } = await params
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid submission ID.' }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
    }

    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    const { status, rejectionReason } = parsed.data

    // Fetch the submission
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        contributor: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    if (submission.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Submission has already been ${submission.status.toLowerCase()}.` },
        { status: 409 },
      )
    }

    // Community-scoped moderators can only review their community's submissions
    if (
      userRole === 'MODERATOR' &&
      session.user.communityId &&
      submission.communityId !== session.user.communityId
    ) {
      return NextResponse.json(
        { error: 'You can only review submissions from your own community.' },
        { status: 403 },
      )
    }

    const moderatorId = session.user.id
    const now = new Date()

    // Run update in a transaction: update submission + content record + notification
    const result = await prisma.$transaction(async (tx) => {
      // Update the submission record
      const updatedSubmission = await tx.submission.update({
        where: { id },
        data: {
          status,
          moderatorId,
          rejectionReason: status === 'REJECTED' ? (rejectionReason ?? null) : null,
          reviewedAt: now,
        },
      })

      // Update the actual content record status — use contentId when available for precision
      const contentStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED'
      const cid = submission.contentId

      if (submission.type === 'WORD') {
        if (cid) {
          await tx.word.update({ where: { id: cid }, data: { status: contentStatus } }).catch(() => null)
        } else {
          await tx.word.updateMany({
            where: { communityId: submission.communityId, contributorId: submission.contributorId, status: 'PENDING', createdAt: { gte: new Date(submission.submittedAt.getTime() - 60_000) } },
            data: { status: contentStatus },
          })
        }
      } else if (submission.type === 'STORY') {
        if (cid) {
          await tx.story.update({ where: { id: cid }, data: { status: contentStatus } }).catch(() => null)
        } else {
          await tx.story.updateMany({
            where: { communityId: submission.communityId, contributorId: submission.contributorId, status: 'PENDING', createdAt: { gte: new Date(submission.submittedAt.getTime() - 60_000) } },
            data: { status: contentStatus },
          })
        }
      } else if (submission.type === 'SONG') {
        if (cid) {
          await tx.song.update({ where: { id: cid }, data: { status: contentStatus } }).catch(() => null)
        } else {
          await tx.song.updateMany({
            where: { communityId: submission.communityId, contributorId: submission.contributorId, status: 'PENDING', createdAt: { gte: new Date(submission.submittedAt.getTime() - 60_000) } },
            data: { status: contentStatus },
          })
        }
      } else if (submission.type === 'RECORDING') {
        if (cid) {
          await tx.recording.update({ where: { id: cid }, data: { status: contentStatus } }).catch(() => null)
        } else {
          await tx.recording.updateMany({
            where: { communityId: submission.communityId, contributorId: submission.contributorId, status: 'PENDING', createdAt: { gte: new Date(submission.submittedAt.getTime() - 60_000) } },
            data: { status: contentStatus },
          })
        }
      } else if (submission.type === 'VIDEO') {
        if (cid) {
          await tx.video.update({ where: { id: cid }, data: { status: contentStatus } }).catch(() => null)
        } else {
          await tx.video.updateMany({
            where: { communityId: submission.communityId, contributorId: submission.contributorId, status: 'PENDING', createdAt: { gte: new Date(submission.submittedAt.getTime() - 60_000) } },
            data: { status: contentStatus },
          })
        }
      }

      // Award XP if approved
      if (status === 'APPROVED') {
        const XP_REWARDS: Record<string, number> = {
          WORD: 20,
          STORY: 50,
          SONG: 40,
          RECORDING: 30,
          VIDEO: 45,
        }
        const xpAmount = XP_REWARDS[submission.type] ?? 20

        await tx.user.update({
          where: { id: submission.contributorId },
          data: { xp: { increment: xpAmount } },
        })
      }

      // Create notification for contributor
      const notificationTitle =
        status === 'APPROVED'
          ? `Your ${submission.type.toLowerCase()} was approved!`
          : `Your ${submission.type.toLowerCase()} was not approved`

      const notificationMessage =
        status === 'APPROVED'
          ? `Your ${submission.type.toLowerCase()} submission to ${submission.community.name} has been approved by a moderator and is now published.`
          : `Your ${submission.type.toLowerCase()} submission to ${submission.community.name} was rejected. Reason: ${rejectionReason ?? 'No reason provided.'}`

      await tx.notification.create({
        data: {
          userId: submission.contributorId,
          type: status === 'APPROVED' ? 'SUBMISSION_APPROVED' : 'SUBMISSION_REJECTED',
          title: notificationTitle,
          message: notificationMessage,
          link: '/dashboard/submissions',
        },
      })

      return updatedSubmission
    })

    return NextResponse.json({
      message: `Submission ${status.toLowerCase()} successfully.`,
      submission: {
        id: result.id,
        status: result.status,
        reviewedAt: result.reviewedAt,
        moderatorId: result.moderatorId,
        rejectionReason: result.rejectionReason,
      },
    })
  } catch (error) {
    console.error('[PATCH /api/submissions/[id]/review]', error)
    return NextResponse.json({ error: 'Failed to review submission.' }, { status: 500 })
  }
}
