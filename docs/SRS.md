# Software Requirements Specification (SRS)
## SIKKIMVERSE — Indigenous Heritage & Language Learning Platform
**Version:** 1.0  
**Date:** May 2026  
**Status:** Production-Ready  
**Prepared for:** Engineering Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [User Roles & Access Control](#5-user-roles--access-control)
6. [Functional Requirements](#6-functional-requirements)
7. [API Reference](#7-api-reference)
8. [Data Models](#8-data-models)
9. [Environment Variables](#9-environment-variables)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Security Requirements](#11-security-requirements)
12. [Deployment Notes](#12-deployment-notes)

---

## 1. Introduction

### 1.1 Purpose
SIKKIMVERSE is a production web platform for preserving and teaching the indigenous languages and cultures of Sikkim, India. It combines a **community-owned cultural archive**, a **gamified language learning system** (Duolingo-style), and a **revenue-sharing model** that directs 45% of subscription income to indigenous communities.

### 1.2 Scope
The platform serves:
- **Learners** — study Lepcha, Bhutia, Limbu, Tamang, Rai, Gurung, Sherpa, Magar, Newari, Sunwar languages
- **Contributors** — upload vocabulary, stories, songs, recordings, and videos
- **Community Presidents** — manage submissions, view revenue dashboards
- **Moderators** — review and approve/reject content
- **Government Officers** — monitor preservation metrics and platform health
- **Admins** — full platform management

### 1.3 Definitions
| Term | Meaning |
|------|---------|
| Community | An indigenous ethnic group (e.g. Lepcha, Bhutia) with its own page, languages, and data |
| Preservation Score | 0–100 score indicating language/culture vitality for a community |
| XP | Experience points earned by learners for completing lessons and practice |
| Streak | Consecutive days of learning activity |
| Submission | A piece of user-contributed content awaiting moderation |
| cuid | Collision-resistant unique identifier used as all DB primary keys |

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       SIKKIMVERSE                           │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   Learners   │   │ Contributors │   │  Moderators  │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                  │                  │            │
│  ┌──────▼──────────────────▼──────────────────▼───────┐   │
│  │              Next.js 16 App Router (SSR/CSR)        │   │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                              │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │              REST API Layer (/api/*)                  │  │
│  │  • Rate limiting (middleware)  • Role-based guards    │  │
│  └──────────────────────────┬───────────────────────────┘  │
│                             │                              │
│  ┌───────────────┐   ┌──────▼───────┐   ┌──────────────┐ │
│  │  OpenAI API   │   │   Prisma 7   │   │  Razorpay    │ │
│  │  (AI Tutor)   │   │  (ORM/DB)    │   │  (Payments)  │ │
│  └───────────────┘   └──────┬───────┘   └──────────────┘ │
│                             │                              │
│                    ┌────────▼────────┐                    │
│                    │   PostgreSQL    │                    │
│                    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | 5.x |
| ORM | Prisma with PrismaAdapter (pg) | 7.8.x |
| Database | PostgreSQL | 15+ |
| Auth | NextAuth v5 (beta.31) | JWT + Prisma adapter |
| Styling | Tailwind CSS v4 | Latest |
| Animation | Framer Motion | Latest |
| Charts | Recharts | Latest |
| Icons | Lucide React | Latest |
| UI Primitives | Radix UI | Latest |
| AI | OpenAI API (gpt-4o-mini, SSE streaming) | Latest |
| Payments | Razorpay (subscription API) | Latest |
| Email | Resend | Latest |
| Forms | React Hook Form + Zod | Latest |
| State | React useState/useEffect + Zustand | Latest |
| Real-time | Server-Sent Events (SSE) | Native |

---

## 4. Architecture

### 4.1 Directory Structure

```
src/
├── app/
│   ├── api/                    # All REST API routes
│   │   ├── achievements/
│   │   ├── admin/keyboards/    # Keyboard layout CRUD
│   │   ├── ai/tutor/           # OpenAI SSE streaming
│   │   ├── auth/               # NextAuth + custom auth flows
│   │   ├── communities/        # Community CRUD
│   │   ├── courses/            # Course + lesson system
│   │   ├── dashboard/stats/    # Admin/gov analytics
│   │   ├── festivals/
│   │   ├── health/             # DB ping + config check
│   │   ├── languages/          # Language lookup
│   │   ├── leaderboard/
│   │   ├── lessons/
│   │   ├── notifications/
│   │   ├── progress/           # Lesson progress recording
│   │   ├── pronunciation/score/# Levenshtein scoring + DB persist
│   │   ├── realtime/activity/  # SSE live feed
│   │   ├── revenue/community/
│   │   ├── scripts/characters/ # Script alphabet API
│   │   ├── search/semantic/
│   │   ├── songs/ stories/ videos/ recordings/ words/
│   │   ├── submissions/        # Moderation queue
│   │   ├── subscriptions/      # Razorpay integration
│   │   ├── upload/             # File upload
│   │   └── users/me/           # User profile CRUD
│   ├── (pages)
│   │   ├── communities/[slug]/ # Community detail (dynamic theme)
│   │   ├── learn/[courseId]/   # Course detail page
│   │   ├── learn/lesson/[lessonId]/ # Lesson player (Duolingo-style)
│   │   ├── practice/voice/     # Pronunciation practice
│   │   ├── practice/writing/   # Handwriting practice
│   │   ├── ai-tutor/           # AI chat interface
│   │   ├── contribute/         # Content submission form
│   │   ├── settings/           # User settings + billing
│   │   └── dashboard/          # Role-specific dashboards
├── lib/
│   ├── prisma.ts               # PrismaClient singleton (PrismaPg adapter)
│   ├── auth.ts                 # NextAuth config
│   ├── rate-limit.ts           # In-memory rate limiting helpers
│   └── utils.ts                # cn() and shared utils
├── generated/prisma/           # Auto-generated Prisma client
└── middleware.ts               # Route protection + rate limiting
```

### 4.2 Rendering Model
- **SSR / RSC**: Community landing pages, homepage, archive pages (SEO-critical)
- **CSR (`'use client'`)**: All interactive pages — lesson player, dashboards, AI tutor, practice pages
- **SSE**: Homepage live activity feed (`/api/realtime/activity`), AI tutor streaming response

### 4.3 Database Connection
```typescript
// lib/prisma.ts — singleton pattern for Next.js edge-safe connection
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma'
```
Uses `@prisma/adapter-pg` for native PostgreSQL connection pooling. The `DATABASE_URL` env var must be a valid PostgreSQL connection string.

---

## 5. User Roles & Access Control

Roles are stored on the `User.role` field (enum `UserRole`).

| Role | Access Level |
|------|-------------|
| `PUBLIC_USER` | Browse communities, learn from published courses, use AI tutor, voice/writing practice (subscription required for voice+writing) |
| `CONTRIBUTOR` | All of above + submit content (words, stories, songs, videos, recordings) |
| `MODERATOR` | All of above + approve/reject submissions in their community |
| `COMMUNITY_PRESIDENT` | All moderator access + view community revenue dashboard + manage keyboard layouts |
| `GOVERNMENT_OFFICER` | Read-only access to full platform analytics dashboard |
| `ADMIN` | Full platform management — all dashboards, keyboard CRUD for any community, all stats |
| `SUPER_ADMIN` | Superset of ADMIN |

### 5.1 Route Protection (middleware.ts)
Protected routes requiring auth:
- `/dashboard/**` — any dashboard
- `/profile`, `/settings/billing`
- `/learn/lesson/**` — lesson player
- `/practice/**` — voice and writing
- `/contribute`

Subscription-gated routes:
- `/practice/voice/**`
- `/practice/writing/**`

Dashboard role guards (minimum roles per dashboard):
```
/dashboard/admin        → ADMIN, SUPER_ADMIN
/dashboard/government   → GOVERNMENT_OFFICER, ADMIN, SUPER_ADMIN
/dashboard/community    → COMMUNITY_PRESIDENT, ADMIN, SUPER_ADMIN
/dashboard/moderator    → MODERATOR, COMMUNITY_PRESIDENT, ADMIN, SUPER_ADMIN
/dashboard/contributor  → CONTRIBUTOR and above
```

---

## 6. Functional Requirements

### 6.1 Authentication System
- **Email/password** with bcrypt hashing
- **Google OAuth** (NextAuth Google provider)
- Email verification flow (token-based, via Resend)
- Password reset via email (token-based)
- JWT session strategy, token stored in HttpOnly cookie

### 6.2 Community System
- Each community has: name, slug, description, region, preservation score (0–100), cover/logo images, primary/secondary brand colors
- Community pages are dynamically themed via `getCommunityTheme(slug)` which returns gradient, pattern, and accent colors
- Community isolation enforced: each community's page only shows its own DB content (stories, songs, languages, stats)
- Community president has read/write access only to their own `communityId`

### 6.3 Language Learning System
- **Courses**: Beginner/Intermediate/Advanced levels, published to a specific community + language
- **Lessons**: Ordered within a course. Content stored as JSON:
  ```json
  {
    "sections": [{"id": "s1", "type": "text|image|audio", "content": "..."}],
    "vocabulary": [{"word": "...", "meaning": "...", "pronunciation": "...", "exampleSentence": "..."}],
    "culturalNotes": "..."
  }
  ```
- **Lesson Player**: Duolingo-style step engine built from content JSON:
  - `text` → reading step
  - `vocab` → flip-card animation step
  - `cultural` → cultural context step
  - `quiz` → multiple-choice from DB quizzes
  - `complete` → XP award + progress recording
- **Progress**: Stored per `(userId, lessonId)` in `UserProgress`. Status: `completed | current | locked` (locked = previous lesson not completed)
- **XP system**: Earned on lesson completion (`lesson.xpReward`), quiz correct answers (10 XP), pronunciation perfect score (20 XP)

### 6.4 Script Learning & Writing Practice
- `ScriptCharacter` model stores individual script characters with Unicode codepoints, phonetic hints, stroke count, group (Velars/Palatals/etc.)
- Writing practice page loads characters from `/api/scripts/characters?communitySlug=lepcha`
- Falls back to 16 built-in Lepcha characters if DB is empty
- Handwriting attempts stored in `HandwritingAttempt` (graded A+ through NEEDS_PRACTICE)
- Keyboard layouts stored in `KeyboardLayout` + `KeyboardKey` tables; managed via admin UI + `/api/admin/keyboards`

### 6.5 Voice Pronunciation Practice
- Loads real vocabulary from `/api/words?limit=30`
- Uses browser `SpeechRecognition` API (webkit or standard)
- Scoring: Levenshtein-based phonetic similarity (60%) + SpeechRecognition confidence (40%)
- Attempts persisted to `PronunciationAttempt` via `POST /api/pronunciation/score`
- Fallback scoring (no mic/API): difficulty-weighted random for non-disruptive UX

### 6.6 AI Cultural Tutor
- Chat interface sending messages to `POST /api/ai/tutor`
- Response streamed via SSE (`text/event-stream`) from OpenAI `gpt-4o-mini`
- System prompt includes: community-specific vocabulary, stories, songs pulled live from DB when `communityId` is provided
- Rate limited: 20 messages per user per hour
- Graceful offline fallback if `OPENAI_API_KEY` not configured (returns JSON with `isOffline: true`)
- `conversationHistory` sent with each request (last 10 messages for context)

### 6.7 Content Submission & Moderation
- Contributors submit content via `/contribute` form → `POST /api/submissions`
- Supported types: `WORD`, `STORY`, `SONG`, `VIDEO`, `RECORDING`
- All submissions start with `status: PENDING`
- Moderators/Presidents review via dashboard → `PATCH /api/submissions/[id]/review`
- On approval, content becomes visible with `status: APPROVED`

### 6.8 Subscription System (Razorpay)
- Plans stored in `SubscriptionPlan` table (seeded with Heritage Monthly + Annual plans)
- Subscription flow: `POST /api/subscriptions/create` → Razorpay checkout → webhook confirms payment
- Dev mode: if `RAZORPAY_KEY_ID` not set, subscription is created locally without gateway
- Cancel: `POST /api/subscriptions/cancel` (at period end or immediately)
- Status check: `GET /api/subscriptions/status` — used by billing page and middleware gate

### 6.9 Revenue Sharing
- 45% of subscription revenue allocated to communities in `RevenueShare` + `CommunityEarning` tables
- Community presidents view earnings via `GET /api/revenue/community`

### 6.10 Real-time Activity Feed
- Homepage shows live community activity (submissions, completions) via SSE
- `GET /api/realtime/activity` — streams JSON events every 30s
- Fallback to static events if DB is empty

---

## 7. API Reference

All API routes live under `/api/`. Authentication via NextAuth session cookie. Unauthorized requests return `401`. Role violations return `403`. Validation failures return `422` with Zod error details.

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Email registration |
| POST | `/api/auth/forgot-password` | None | Send reset email |
| POST | `/api/auth/reset-password` | None | Confirm reset |
| POST | `/api/auth/verify-email` | None | Verify email token |
| POST | `/api/auth/resend-verification` | None | Resend verification |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | User | Get own profile |
| PATCH | `/api/users/me` | User | Update name, communityId |

### Communities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/communities` | None | List with pagination, search, filters |
| GET | `/api/communities/[slug]` | None | Community detail + stats |

### Languages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/languages` | None | List languages; `?communityId=` filter |

### Learning
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | None | List published courses |
| GET | `/api/courses/[id]` | User (opt) | Course detail + lesson status |
| GET | `/api/lessons/[id]` | User (opt) | Lesson content + quizzes + nav |
| POST | `/api/progress` | User | Record lesson completion + XP |

### Content Archive
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stories` | None | Paginated stories; filter by community, type, search |
| POST | `/api/stories` | User | Create story |
| GET | `/api/songs` | None | Paginated songs |
| GET | `/api/words` | None | Paginated words; filter by community, language |
| POST | `/api/words` | User | Create word |
| GET | `/api/videos` | None | Paginated videos |
| GET | `/api/recordings` | None | Paginated recordings |
| GET | `/api/festivals` | None | Upcoming festivals |

### Scripts & Keyboards
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/scripts/characters` | None | Script chars; `?communitySlug=` `?group=` |
| GET | `/api/admin/keyboards` | Admin/President | List keyboard layouts |
| POST | `/api/admin/keyboards` | Admin/President | Save/upsert layout + keys |
| DELETE | `/api/admin/keyboards?id=` | Admin/President | Delete layout |

### Submissions & Moderation
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/submissions` | Moderator+ | Paginated queue; filter by status, community |
| POST | `/api/submissions` | User | Submit content for review |
| PATCH | `/api/submissions/[id]/review` | Moderator+ | Approve or reject |

### Practice
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/pronunciation/score` | User | Score attempt, persist to DB |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/tutor` | User | SSE streaming chat (20/hr rate limit) |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/search/semantic` | User | Vector/text search across content |

### Subscriptions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscriptions/plans` | None | Available subscription plans |
| GET | `/api/subscriptions/status` | User | Current subscription + payment history |
| POST | `/api/subscriptions/create` | User | Create subscription (Razorpay or dev mode) |
| POST | `/api/subscriptions/cancel` | User | Cancel at period end or immediately |
| POST | `/api/subscriptions/webhook` | Razorpay | Payment confirmation webhook |

### Analytics & System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | Admin/Gov | Full platform analytics |
| GET | `/api/revenue/community` | President+ | Community earnings |
| GET | `/api/achievements` | User | User achievements |
| GET | `/api/leaderboard` | None | XP leaderboard |
| GET | `/api/notifications` | User | User notifications |
| GET | `/api/health` | None | DB ping + auth/AI config status |
| GET | `/api/realtime/activity` | None | SSE live activity stream |
| POST | `/api/upload` | User | File upload |
| POST | `/api/embeddings/generate` | Admin | Generate content embeddings |

---

## 8. Data Models

### Core Models Summary

```
User                    — auth, roles, XP, streak, communityId
├── Community           — cultural group with theme colors and preservation score
│   ├── Language        — specific language (e.g. Lepcha/Róng) with endangerment level
│   │   └── Dialect     — regional dialect
│   ├── Course          — learning course (Beginner/Intermediate/Advanced)
│   │   ├── Lesson      — lesson with JSON content, quizzes
│   │   └── Quiz        — MCQ/T-F/audio-match question
│   ├── Story           — folktale, myth, oral history (PENDING→APPROVED)
│   ├── Song            — traditional song with lyrics
│   ├── Video           — cultural video
│   ├── Recording       — audio recording (word/phrase/story/song/ritual)
│   ├── Word            — vocabulary entry with pronunciation
│   ├── Festival        — cultural festival with month
│   ├── ScriptCharacter — Unicode character with stroke data
│   ├── ScriptLesson    — script writing lesson
│   └── KeyboardLayout  — custom input keyboard
│       └── KeyboardKey — individual key (char, phonetic, alts)
├── UserProgress        — (userId, lessonId) completion record
├── PronunciationAttempt— scored pronunciation attempt
├── HandwritingAttempt  — graded handwriting attempt
├── Submission          — moderation queue item
├── Notification        — in-app notification
├── Achievement         — badge definition
├── UserAchievement     — earned badge
├── UserSubscription    — Razorpay subscription record
├── SubscriptionPlan    — Heritage Monthly / Annual plans
├── SubscriptionPayment — individual payment record
├── CommunityEarning    — revenue distributed to community
└── RevenueShare        — per-subscription revenue split config
```

### Key JSON Fields
- `Lesson.content` — `{ sections: [{id, type, content}], vocabulary: [{word, meaning, pronunciation, exampleSentence}], culturalNotes: string }`
- `Quiz.options` — `string[]` for multiple choice
- `KeyboardKey.altChars` — `[{char: string, label: string}]` for long-press variants
- `SubscriptionPlan.features` — `{ aiTutor: bool, aiSearch: bool, voicePractice: bool, writingPractice: bool, downloads: bool, badge: string, annualBonus: string }`

---

## 9. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | **Yes** | JWT signing secret (min 32 chars) |
| `NEXTAUTH_URL` | **Yes** | Base URL (e.g. `https://sikkimverse.in`) |
| `GOOGLE_CLIENT_ID` | Yes (OAuth) | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Yes (OAuth) | Google OAuth app secret |
| `OPENAI_API_KEY` | No | GPT-4o-mini key; AI tutor offline without it |
| `RAZORPAY_KEY_ID` | No | Razorpay API key; payments use dev mode without it |
| `RAZORPAY_KEY_SECRET` | No | Razorpay API secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | No | Public key for client-side checkout |
| `RESEND_API_KEY` | No | For email delivery (verification, password reset) |
| `RESEND_FROM_EMAIL` | No | Sender address (e.g. `noreply@sikkimverse.in`) |

---

## 10. Non-Functional Requirements

### 10.1 Performance
- **Target**: < 2s First Contentful Paint on 4G
- All list endpoints paginated (default 12–20, max 50–200 per request)
- Separate Prisma queries used instead of deeply nested `include` chains to avoid TypeScript inference overhead
- Static cultural supplement data (history, food, attire) kept as local maps — not DB queries — since it's curated, not user-generated

### 10.2 Rate Limiting
- **Middleware (IP-based)**: 120 requests/minute per IP
- **Auth endpoints**: 5 requests/minute per IP (authLimiter)
- **AI tutor**: 20 messages/hour per user (userId-keyed)
- **Payment endpoints**: 10 requests/minute per IP
- ⚠️ Rate limiters are **in-memory** — not distributed. For multi-instance deployments, replace with Redis-backed rate limiting (e.g. `upstash/ratelimit`)

### 10.3 Availability
- Platform degrades gracefully if optional services are unavailable:
  - No `OPENAI_API_KEY` → AI tutor shows offline mode, returns JSON fallback
  - No `RAZORPAY_KEY_ID` → subscriptions created locally in dev mode
  - No `RESEND_API_KEY` → email flows fail silently (log error)

### 10.4 Mobile
- Responsive design using Tailwind CSS breakpoints
- Bottom navigation bar for mobile (`< md`)
- Touch-optimized lesson player, voice recorder, keyboard builder

---

## 11. Security Requirements

### 11.1 Authentication
- Passwords hashed with `bcryptjs` (rounds ≥ 12)
- JWT sessions via HttpOnly cookies (NextAuth manages this)
- Email verification required before contributor actions

### 11.2 Authorization
- Every API route verifies session via `await auth()` before processing
- Role checks enforced server-side — never trust client-supplied role
- Community isolation: Presidents filtered to their `communityId` on all queries

### 11.3 Input Validation
- All API inputs validated with **Zod schemas** before DB access
- Zod errors returned as 400/422 with field details
- No raw SQL — all queries through Prisma ORM (SQL injection prevention)

### 11.4 Content Security
- File uploads: validate MIME type and size server-side
- User-contributed content enters moderation queue — not published directly
- XSS: all content rendered via React (JSX escaping), no `dangerouslySetInnerHTML`

---

## 12. Deployment Notes

### 12.1 Database Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (communities, languages, subscription plans, Lepcha script characters)
npx prisma db seed
```

### 12.2 Build
```bash
npm run build
npm start
```

### 12.3 Health Check
`GET /api/health` returns:
```json
{
  "status": "healthy | degraded",
  "services": {
    "db":   { "ok": true, "latencyMs": 12 },
    "auth": { "ok": true },
    "ai":   { "ok": false, "error": "OPENAI_API_KEY not configured" }
  },
  "checkedAt": "2026-05-11T..."
}
```
Use this endpoint for load balancer health checks and uptime monitoring.

### 12.4 Known Limitations for v1.0
| Item | Status | Notes |
|------|--------|-------|
| Rate limiting | In-memory | Replace with Redis for horizontal scaling |
| File storage | URL-based | Integrate with S3/Cloudflare R2 for uploads |
| Audio playback | Browser TTS fallback | Integrate pre-recorded native speaker audio |
| Embeddings | API exists | Needs scheduled job to generate embeddings for semantic search |
| Email delivery | Optional | Platform works without Resend; email flows disabled |
| Handwriting AI | Rule-based grade | Integrate vision AI for real stroke analysis |
| Monthly analytics | Static period | No time-series DB; government dashboard shows current totals only |

---

*This SRS reflects the current production state of the codebase on branch `claude/build-sikkimverse-platform-UsFS9`. All endpoints listed are implemented and TypeScript-verified.*
