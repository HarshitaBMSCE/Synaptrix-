# GigShield Fix Report

## Root Causes Found

- Screenshot upload was only a visual review path: the `/jobs/scan` UI did not perform a complete presign, upload, completion, extraction, review, and save sequence.
- Upload APIs needed strict production configuration checks so missing S3 or Claude credentials return clear errors instead of generated sample data.
- Claude screenshot extraction needed strict JSON parsing, fence stripping, schema validation, and one schema-correction retry before values could safely reach the shared job form.
- Voice entry was text-only and prefilled with stale sample content. It did not progressively use the browser Web Speech API, did not surface microphone/browser errors, and did not pass language selection to the server.
- Seeded sample data was mixed into normal repository paths. User data operations now key from the authenticated Clerk user and MongoDB only.
- Role checks were not centralized. Admin routes and APIs now use server-side helpers instead of trusting client state.

## Files Affected

- Upload and extraction: `components/screenshot-uploader.tsx`, `app/jobs/scan/page.tsx`, `app/api/uploads/presign/route.ts`, `app/api/uploads/complete/route.ts`, `lib/s3.ts`, `lib/extraction.ts`, `lib/upload-validation.ts`.
- Voice flow: `components/voice-entry.tsx`, `app/jobs/voice/page.tsx`, `app/api/jobs/voice/route.ts`, `lib/claude.ts`, `lib/validations.ts`.
- Job creation and ownership: `components/job-form.tsx`, `app/api/jobs/route.ts`, `app/api/jobs/[jobId]/route.ts`, `lib/repository.ts`.
- RBAC: `lib/auth.ts`, `middleware.ts`, `app/unauthorized/page.tsx`.
- Admin: `app/admin/*`, `app/api/admin/*`, `components/admin-shell.tsx`, `components/admin-nav.tsx`, `lib/admin.ts`, `lib/models/index.ts`.
- Tests and docs: `tests/*`, `.env.example`, `README.md`, `docs/FIX_REPORT.md`.

## Fixes Applied

- Implemented screenshot file validation for PNG, JPEG, WEBP, and HEIC with a 10 MB limit.
- Added drag/drop, mobile capture input, preview, retry/remove, progress, processing status, extraction warnings, field confidence display, and shared job review form.
- Added S3 presign and completion APIs that authenticate the user, scope object keys to `users/{clerkUserId}/...`, store evidence metadata, retrieve private objects server-side, and never expose AWS credentials.
- Removed generated sample extraction paths; S3 and Claude are required for screenshot extraction.
- Added strict Claude extraction validation so malformed model output cannot silently create jobs.
- Rebuilt voice entry with safe Web Speech feature detection, prefixed API support, listening state, timeout/no-speech handling, permission/browser errors, editable transcript, language selection, typed entry, and shared review/save flow.
- Added centralized `AppRole`, `AppUser`, `requireAuthenticatedUser`, `requireAdmin`, ownership helpers, and consistent API error envelopes.
- Added Worker/Admin route protection in middleware and repeated server-side checks in admin services and APIs.
- Added functional admin pages for overview, users, platforms, benchmarks, community, incidents, rights, notifications, and audit logs.
- Added Mongo models for platform configuration, benchmark history, audit logs, user role/status mirrors, and moderation status fields.
- Added unit coverage for screenshot validation/extraction, voice parsing, OpenRouteService behavior, and RBAC helpers.

## Remaining External Configuration Requirements

- Clerk production keys and sign-in/sign-up URLs must be configured in `.env.local` and in the Clerk dashboard.
- Assign admins through Clerk `publicMetadata.role = "admin"` or temporary bootstrap env vars.
- MongoDB Atlas must be available for production user-owned data.
- AWS S3 bucket CORS must allow browser PUTs from `NEXT_PUBLIC_APP_URL`.
- Anthropic Claude key is required for screenshot extraction, voice parsing, assistant answers, weekly insights, and complaint drafting.
- OpenRouteService key is required for route geometry.
