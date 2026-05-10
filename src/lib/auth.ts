import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/generated/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            role: true,
            communityId: true,
            xp: true,
            streak: true,
            emailVerified: true,
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash)
        if (!passwordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
          communityId: user.communityId ?? undefined,
          xp: user.xp,
          streak: user.streak,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/onboarding',
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: attach user fields to token
      if (user) {
        token.id = user.id
        token.role = (user as { role?: UserRole }).role ?? 'PUBLIC_USER'
        token.communityId = (user as { communityId?: string | null }).communityId ?? null
        token.xp = (user as { xp?: number }).xp ?? 0
        token.streak = (user as { streak?: number }).streak ?? 0

        // Load subscription status at sign-in so middleware can gate routes without a DB call
        try {
          const sub = await prisma.userSubscription.findUnique({
            where: { userId: user.id as string },
            select: { status: true, currentPeriodEnd: true },
          })
          token.subscriptionStatus = sub?.status ?? null
          token.subscriptionEnd = sub?.currentPeriodEnd?.toISOString() ?? null
        } catch {
          token.subscriptionStatus = null
          token.subscriptionEnd = null
        }
      }

      // Handle session update calls (e.g. after profile changes)
      if (trigger === 'update' && session) {
        if (session.role) token.role = session.role
        if (session.communityId !== undefined) token.communityId = session.communityId
        if (typeof session.xp === 'number') token.xp = session.xp
        if (typeof session.streak === 'number') token.streak = session.streak
        if (session.subscriptionStatus !== undefined) token.subscriptionStatus = session.subscriptionStatus
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.communityId = (token.communityId as string | null) ?? null
        session.user.xp = (token.xp as number) ?? 0
        session.user.streak = (token.streak as number) ?? 0
        session.user.subscriptionStatus = (token.subscriptionStatus as string | null) ?? null
      }
      return session
    },

    async signIn({ user, account }) {
      // Allow all OAuth sign-ins
      if (account?.provider !== 'credentials') {
        return true
      }
      // For credentials, user must have been resolved by `authorize`
      return !!user
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.id) {
        // Award first-login XP
        await prisma.user.update({
          where: { id: user.id },
          data: { xp: { increment: 50 } },
        })
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'WELCOME',
            title: 'Welcome to SIKKIMVERSE!',
            message:
              'Thank you for joining our platform dedicated to preserving indigenous languages and culture. You have been awarded 50 XP for joining!',
            link: '/learn',
          },
        })
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
})
