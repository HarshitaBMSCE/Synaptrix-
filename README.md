# GigShield

Fair pay. Safer routes. Stronger workers.

GigShield is an India-first, mobile-first PWA for delivery riders, cab drivers, bike-taxi riders, couriers, and home-service workers. It records jobs manually, by screenshot review, or by voice transcript; evaluates payment fairness with deterministic Bengaluru demo benchmarks; tracks cross-platform earnings; drafts complaints; compares safer routes; warns about fatigue; manages savings goals; and provides English, Hindi, and Kannada-ready workflows.

## What is included

- Next.js App Router, TypeScript strict mode, Tailwind CSS, Lucide icons, Recharts, TanStack Query, React Hook Form, and Zod.
- Clerk-ready private routes. If Clerk keys are absent, the app runs as a seeded demo user for hackathon judging.
- MongoDB/Mongoose model definitions for profile, jobs, evidence, fairness evaluations, community jobs, complaints, work sessions, incidents, savings goals, notifications, and push subscriptions.
- AWS S3 adapter for presigned uploads/downloads with seeded fallback object keys.
- Claude adapter for voice parsing, assistant answers, weekly insights, and complaint drafting with seeded fallback responses.
- Google Routes adapter pattern with seeded Bengaluru route alternatives and deterministic safety scoring.
- Deterministic fairness, route safety, and fatigue engines.
- Required pages: `/`, `/sign-in`, `/sign-up`, `/demo`, `/onboarding`, `/dashboard`, `/jobs`, `/jobs/new`, `/jobs/scan`, `/jobs/voice`, `/jobs/[jobId]`, `/assistant`, `/routes`, `/complaints`, `/complaints/[complaintId]`, `/evidence`, `/community`, `/savings`, `/insights`, `/notifications`, and `/settings`.
- Unit tests for the scoring engine and one API validation test.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/demo` for a credential-free seeded demo.

## Verify

```bash
npm test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill only the providers you want to test. Leaving keys blank keeps demo fallback behavior enabled.

Important keys:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `ANTHROPIC_API_KEY`
- `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## Guardrails

GigShield fairness estimates are independent benchmarks, not official platform rates. Rights content is general information, not legal advice. Route safety scores are guidance only and cannot guarantee safety. The app never automatically sends complaints or SOS messages; workers must preview and explicitly choose any sharing action.
