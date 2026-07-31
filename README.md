# GigShield

Submission for the Hackathon

## Problem Statement Chosen

**Domain:** GigShield

**Problem Statement:** Build an India-first assistant for gig workers that helps them record jobs, evaluate whether payment was fair, track earnings, understand worker-rights themes, generate evidence-backed complaint drafts, compare route safety, detect fatigue, and manage savings goals.

## Team

**Team Name:** Synaptrix

## Our Solution

GigShield is a mobile-first PWA for delivery riders, cab drivers, bike-taxi riders, couriers, and home-service workers in Bengaluru. It lets workers log jobs manually, through screenshot review, or from a voice transcript, then runs deterministic fairness scoring to compare actual payout against transparent benchmark assumptions. The app also provides a multi-platform earnings dashboard, route safety guidance, fatigue nudges, a private evidence vault, complaint draft generation, community benchmark comparison, savings tracking, and weekly insights. Every signed-in worker gets an isolated Clerk and MongoDB-backed workspace with no shared sample jobs.

## AI Component

The AI component is included and designed to support worker workflows without replacing deterministic scoring.

- **What AI is used:** Anthropic Claude API through the official TypeScript SDK.
- **What it does in the app:** Claude is wired for screenshot extraction, voice transcript parsing, worker-rights Q&A, multilingual explanations, weekly insight summaries, and complaint draft generation.
- **Why we chose this approach:** Claude is useful for interpreting unstructured screenshots, natural language voice notes, and complaint language, while GigShield keeps numeric fairness, route safety, and fatigue scores in deterministic TypeScript services so results remain explainable and repeatable.

If `ANTHROPIC_API_KEY` is unavailable at runtime, Claude-powered features return a clear configuration error instead of generated sample data.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript strict mode, Tailwind CSS, Lucide icons, Recharts, TanStack Query, React Hook Form.
- **Backend:** Next.js Route Handlers, Zod validation, server-side provider adapters.
- **AI/ML:** Anthropic Claude SDK for production AI extraction, assistant answers, insights, and complaint drafting.
- **Database/Storage:** MongoDB Atlas with Mongoose models and private AWS S3 adapter for evidence upload.
- **Other tools/APIs:** Clerk authentication, AWS SDK v3 presigned S3 URLs, OpenRouteService Directions API adapter, Open-Meteo-ready weather inputs, Web Push service worker, Vitest.

## Features Implemented

### Core Requirements

- Public landing page, sign-in, and sign-up.
- Authenticated product routes for onboarding, dashboard, jobs, assistant, routes, complaints, evidence, community, savings, insights, notifications, and settings.
- Manual job entry with net payout calculation, validation, save, and fairness evaluation.
- Screenshot scan review flow with S3 presign API, evidence metadata API, and editable extracted job form.
- Voice entry flow with transcript editing, server parsing, and editable review form.
- Deterministic Bengaluru fairness engine with benchmark assumptions, operating cost, community blending, component scores, confidence score, verdict, and test coverage.
- Multi-platform dashboard with earnings trend, platform split, underpayment trend, active/waiting hours, recent jobs, action queue, safety notice, and weekly insight preview.
- Mongoose models for user profiles, jobs, evidence assets, fairness evaluations, community jobs, complaints, work sessions, incidents, savings goals, notifications, and push subscriptions.
- Server-side authorization pattern using the verified Clerk session user ID for every private record operation.
- Consistent API response format and Zod validation for job creation, upload presign, voice parsing, route scoring, assistant messages, complaint drafting, and community contribution.

### Bonus Features Attempted

- Worker-rights assistant with curated India/Karnataka rights pack.
- AI-ready complaint drafts with placeholders for unknown facts and no automatic sending.
- Route safety scoring with OpenRouteService Directions API geometry.
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

Open `http://localhost:3000/sign-up` to create a new private workspace, or `http://localhost:3000/sign-in` to return to an existing one.

To verify the project:

```bash
npm test
npm run lint
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

MONGODB_URI=

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-latest

AWS_REGION=ap-south-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

OPENROUTESERVICE_API_KEY=
GOOGLE_MAPS_API_KEY=

NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:alerts@gigshield.local

BOOTSTRAP_ADMIN_CLERK_USER_ID=
BOOTSTRAP_ADMIN_EMAIL=
```

Clerk and MongoDB are required for private user data. AWS S3, Claude, OpenRouteService, and VAPID keys enable their respective production integrations. `GOOGLE_MAPS_API_KEY` is preserved only for future map display work; active route scoring uses OpenRouteService.

## Screenshot Upload Architecture

The `/jobs/scan` flow validates PNG, JPEG, WEBP, or HEIC screenshots up to 10 MB, shows a preview, requests a presigned upload URL from `POST /api/uploads/presign`, uploads directly to private S3, then calls `POST /api/uploads/complete`. The server verifies the Clerk user, scopes object keys under `users/{clerkUserId}/screenshots/{uuid}.{extension}`, saves evidence metadata, retrieves the private object server-side, sends it to Claude, validates strict JSON through Zod, and returns an editable job review form. Saving the reviewed form calls `POST /api/jobs`, runs deterministic fairness scoring, and redirects to `/jobs/{jobId}`.

S3 and Claude credentials are required for screenshot extraction. Missing or invalid provider configuration returns a clear API error; no sample extraction data is generated.

### S3 Setup

Use a private bucket. Suggested CORS:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.example"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type", "x-amz-*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

### Claude Screenshot Extraction

Set `ANTHROPIC_API_KEY` and optionally `ANTHROPIC_MODEL`. Claude extracts structured job facts only. GigShield strips Markdown fences, rejects malformed JSON, validates every field through Zod, and retries once for corrected JSON. If Claude fails validation after retry, the request fails and the user must retry. Claude never calculates fairness scores.

## Voice Entry

The `/jobs/voice` page uses the browser Web Speech API when `SpeechRecognition` or `webkitSpeechRecognition` is available. It supports English (`en-IN`), Hindi (`hi-IN`), and Kannada (`kn-IN`), checks that microphone access is on localhost or HTTPS, keeps the transcript editable, and sends typed or spoken text to `/api/jobs/voice` for Claude extraction. Browsers without speech recognition show: “Voice recognition is not supported in this browser. Type or paste your job description below.” Typed entry still uses Claude for field extraction.

No raw audio is stored by default.

## Roles and Admin

GigShield supports `worker` and `admin` roles. Workers can manage only their own profile, jobs, evidence, complaints, dashboard, savings, notifications, assistant interactions, route/fairness tools, and anonymized community contributions. Admins can access `/admin`, limited user operations, platform configuration, benchmark history, moderation queues, rights snippets, notification tooling, and audit logs.

Clerk is the source of truth for role assignment. Set `publicMetadata.role` to `"admin"` in the Clerk dashboard for admins. Users without that metadata default to `worker`. For the first admin, temporarily set one of these values and restart the app:

```env
BOOTSTRAP_ADMIN_CLERK_USER_ID=user_...
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
```

After confirming access, assign `publicMetadata.role = "admin"` in Clerk and remove the bootstrap variable.

Admin routes: `/admin`, `/admin/users`, `/admin/platforms`, `/admin/benchmarks`, `/admin/community`, `/admin/incidents`, `/admin/rights`, `/admin/notifications`, and `/admin/audit-logs`.

Authorization is enforced server-side through centralized helpers in `lib/auth.ts`; client navigation and role badges are only user-experience hints. API errors use a consistent envelope with `success: false` and an error code/message.

## Routing Provider

GigShield uses the OpenRouteService Directions API from server-side code only:

```text
POST https://api.openrouteservice.org/v2/directions/driving-car/geojson
```

Coordinates are sent as `[longitude, latitude]`. The app supports origin, destination, and optional intermediate waypoint coordinates. Known Bengaluru place names are resolved server-side for route guidance, and identical route requests are cached briefly to protect free API quota. If `OPENROUTESERVICE_API_KEY` is missing or OpenRouteService returns an auth error, rate-limit response, malformed payload, no-route response, downtime response, or timeout, the API returns a clear error.

## Troubleshooting

- Upload button does nothing: confirm you are signed in, choose a supported image under 10 MB, and check the browser console for validation errors.
- S3 CORS error: update bucket CORS to allow `PUT`, `content-type`, `x-amz-*`, and the `NEXT_PUBLIC_APP_URL` origin.
- Presigned URL failure: check `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and IAM permission for `s3:PutObject`.
- Claude extraction failure: check `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, provider quota, and model JSON validity; no generated sample data is used.
- Microphone permission denied: allow microphone access in the browser, or type the transcript manually.
- Speech recognition unavailable: use a browser with Web Speech API support, or type the transcript manually.
- Clerk role not reflected: confirm `publicMetadata.role` is set to `admin`, sign out and back in, and restart the local server if using bootstrap env vars.
- Worker receives 403 on admin route: this is expected. Assign an admin role in Clerk when appropriate.
- OpenRouteService quota/auth failure: verify `OPENROUTESERVICE_API_KEY`, provider quota, and submitted coordinates.

## Safety and Legal Guardrails

GigShield fairness estimates are independent benchmarks, not official platform rates. Rights content is general information, not legal advice. Route safety scores are guidance only and cannot guarantee safety. The app never automatically sends complaints or SOS messages; workers must preview and explicitly choose any sharing action.
