# GigShield

Submission for the Hackathon

## Problem Statement Chosen

**Domain:** GigShield

**Problem Statement:** Build an India-first assistant for gig workers that helps them record jobs, evaluate whether payment was fair, track earnings, understand worker-rights themes, generate evidence-backed complaint drafts, compare route safety, detect fatigue, and manage savings goals.

## Team

**Team Name:** Synaptrix

## Our Solution

GigShield is a mobile-first PWA for delivery riders, cab drivers, bike-taxi riders, couriers, and home-service workers in Bengaluru. It lets workers log jobs manually, through screenshot review, or from a voice transcript, then runs deterministic fairness scoring to compare actual payout against transparent benchmark assumptions. The app also provides a multi-platform earnings dashboard, route safety guidance, fatigue nudges, a private evidence vault, complaint draft generation, community benchmark comparison, savings tracking, and weekly insights. When external credentials are not configured, GigShield runs in seeded demo mode so judges can test the full product flow.

## AI Component

The AI component is included and designed to support worker workflows without replacing deterministic scoring.

- **What AI is used:** Anthropic Claude API through the official TypeScript SDK.
- **What it does in the app:** Claude is wired for screenshot extraction, voice transcript parsing, worker-rights Q&A, multilingual explanations, weekly insight summaries, and complaint draft generation.
- **Why we chose this approach:** Claude is useful for interpreting unstructured screenshots, natural language voice notes, and complaint language, while GigShield keeps numeric fairness, route safety, and fatigue scores in deterministic TypeScript services so results remain explainable and repeatable.

If `ANTHROPIC_API_KEY` is not configured, the app uses realistic seeded AI fallback responses for demo judging.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript strict mode, Tailwind CSS, Lucide icons, Recharts, TanStack Query, React Hook Form.
- **Backend:** Next.js Route Handlers, Zod validation, server-side provider adapters.
- **AI/ML:** Anthropic Claude SDK with seeded fallback behavior.
- **Database/Storage:** MongoDB Atlas with Mongoose models, private AWS S3 adapter for evidence upload, seeded in-memory demo data when credentials are absent.
- **Other tools/APIs:** Clerk authentication, AWS SDK v3 presigned S3 URLs, Google Maps Routes API adapter, Open-Meteo-ready weather inputs, Web Push service worker, Vitest.

## Features Implemented

### Core Requirements

- Public landing page, sign-in, sign-up, and credential-free `/demo` route.
- Authenticated product routes for onboarding, dashboard, jobs, assistant, routes, complaints, evidence, community, savings, insights, notifications, and settings.
- Manual job entry with net payout calculation, validation, save, and fairness evaluation.
- Screenshot scan review flow with S3 presign API, evidence metadata API, and editable extracted job form.
- Voice entry flow with transcript editing, server parsing, and editable review form.
- Deterministic Bengaluru fairness engine with benchmark assumptions, operating cost, community blending, component scores, confidence score, verdict, and test coverage.
- Multi-platform dashboard with earnings trend, platform split, underpayment trend, active/waiting hours, recent jobs, action queue, safety notice, and weekly insight preview.
- Mongoose models for user profiles, jobs, evidence assets, fairness evaluations, community jobs, complaints, work sessions, incidents, savings goals, notifications, and push subscriptions.
- Server-side authorization pattern using Clerk session user ID when configured; seeded demo user when not configured.
- Consistent API response format and Zod validation for job creation, upload presign, voice parsing, route scoring, assistant messages, complaint drafting, and community contribution.

### Bonus Features Attempted

- Worker-rights assistant with curated India/Karnataka rights pack.
- AI-ready complaint drafts with placeholders for unknown facts and no automatic sending.
- Route safety scoring with seeded Bengaluru route alternatives and risk factor chips.
- Fatigue detector with deterministic long-hours scoring.
- SOS/trusted-contact alert preparation with preview-only behavior.
- Savings goal tracker with safe-percentage recommendation.
- Anonymous community benchmark with median, IQR, sample size, recency, and privacy-preserving buckets.
- Weekly insight generation using deterministic metrics first, AI narrative second.
- English, Hindi, and Kannada language support hooks in onboarding, settings, and insight UI.
- In-app notifications and Web Push service worker skeleton.
- CSV export for worker-owned job records.

## How to Run This Project

```bash
# Clone the repo
git clone https://github.com/HarshitaBMSCE/Synaptrix-.git

# Enter the project
cd Synaptrix-

# Install dependencies
npm install

# Copy the example env file and fill in your own keys if available
cp .env.example .env.local

# Run the project
npm run dev
```

Open `http://localhost:3000/demo` to test the seeded demo mode without external credentials.

To verify the project:

```bash
npm test
npm run build
```

## Screenshots

Add 2-3 screenshots of the running app after deployment or local testing. Suggested screens:

- Dashboard with earnings, fairness, fatigue, and savings cards.
- Screenshot scan review form.
- Route safety comparison or complaint draft preview.

## API Keys / Environment Variables

Do not hardcode API keys or upload them directly to GitHub.

1. Create `.env.local` in the project root and put API keys/secrets there.
2. Keep `.env` and `.env.local` ignored by git.
3. Commit `.env.example` with variable names only so judges know what to configure.

Important variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

MONGODB_URI=

ANTHROPIC_API_KEY=

AWS_REGION=ap-south-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

GOOGLE_MAPS_API_KEY=

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:demo@gigshield.local
```

Leaving provider keys blank keeps seeded demo mode available for judging.

## Safety and Legal Guardrails

GigShield fairness estimates are independent benchmarks, not official platform rates. Rights content is general information, not legal advice. Route safety scores are guidance only and cannot guarantee safety. The app never automatically sends complaints or SOS messages; workers must preview and explicitly choose any sharing action.
