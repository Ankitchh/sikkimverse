import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── GET /api/communities/[slug] ──────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await params

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid community slug.' }, { status: 400 })
    }

    const community = await prisma.community.findUnique({
      where: { slug },
      include: {
        languages: {
          select: {
            id: true,
            name: true,
            code: true,
            scriptType: true,
            description: true,
            speakerCount: true,
            endangermentLevel: true,
            createdAt: true,
          },
          orderBy: { name: 'asc' },
        },
        stories: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            summary: true,
            type: true,
            language: true,
            audioUrl: true,
            imageUrl: true,
            viewCount: true,
            createdAt: true,
            contributor: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        songs: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            occasion: true,
            language: true,
            audioUrl: true,
            imageUrl: true,
            viewCount: true,
            createdAt: true,
            contributor: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: {
            users: true,
            languages: true,
            courses: { where: { isPublished: true } },
            stories: { where: { status: 'APPROVED' } },
            songs: { where: { status: 'APPROVED' } },
            videos: { where: { status: 'APPROVED' } },
            words: { where: { status: 'APPROVED' } },
          },
        },
      },
    })

    if (!community) {
      return NextResponse.json({ error: 'Community not found.' }, { status: 404 })
    }

    // Count distinct contributors
    const contributorCount = await prisma.user.count({
      where: {
        communityId: community.id,
        role: { in: ['CONTRIBUTOR', 'MODERATOR', 'COMMUNITY_PRESIDENT'] },
      },
    })

    return NextResponse.json({
      data: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        coverImage: community.coverImage,
        logoImage: community.logoImage,
        colorPrimary: community.colorPrimary,
        colorSecondary: community.colorSecondary,
        region: community.region,
        totalSpeakers: community.totalSpeakers,
        preservationScore: community.preservationScore,
        isActive: community.isActive,
        createdAt: community.createdAt,
        languages: community.languages,
        recentStories: community.stories,
        recentSongs: community.songs,
        stats: {
          memberCount: community._count.users,
          languageCount: community._count.languages,
          courseCount: community._count.courses,
          storyCount: community._count.stories,
          songCount: community._count.songs,
          videoCount: community._count.videos,
          wordCount: community._count.words,
          contributorCount,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/communities/[slug]]', error)
    return NextResponse.json({ error: 'Failed to fetch community.' }, { status: 500 })
  }
}
