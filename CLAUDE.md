# HomeBridge

Connects licensed foster homes in North Metro Atlanta with neighbors who donate (via each home's wish list)
or volunteer. Public visitors browse without accounts; verified foster homes manage their listing; an admin
approves new homes. Built for the Congressional App Challenge.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind 3 · shadcn/ui primitives (restyled) ·
Framer Motion (UI responses) · GSAP 3 + ScrollTrigger (scroll/editorial motion) · Lenis (smooth scroll) ·
Firebase Auth + Firestore · Leaflet/react-leaflet 5 · deployed on Vercel from `main`.

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` (http://localhost:3000) |
| Types / lint / build | `npx tsc --noEmit` · `npm run lint` · `npx next build` |
| Firestore rules + roles + seed (local only) | `npm run setup -- --dry-run` first, then `npm run setup` |
| Live security tests (34) | `npm run test:security` |
| Live dashboard/form flow tests (16) | `npm run test:flows` |

Stop the dev server before `next build` (they share `.next/`). The project must live outside OneDrive
(OneDrive locks `.next/` and causes random 404s).

## Architecture

- `lib/firebase.ts` — the only `initializeApp` for the web SDK. `firebaseEnabled` is false without env vars,
  and public pages fall back to `lib/sample-homes.json`.
- `lib/homes.ts` — server reads; `toPublic()` strips `ownerUid`/`protected` before data reaches the browser.
- `lib/manage.ts` — dashboard/admin writes. `lib/submissions.ts` — public forms (contact, volunteer sign-up).
- `lib/use-auth.ts` — admin is the custom claim `admin: true`, never an email comparison.
- `lib/gsap.ts` — the single place GSAP plugins are registered.
- `components/layout/smooth-scroll.tsx` — Lenis driven by `gsap.ticker`, feeding `ScrollTrigger.update`.
- Public pages render with `dynamic = "force-dynamic"` so dashboard edits appear immediately.

## Security rules (do not weaken)

- Never commit or print `.env.local` or `serviceAccount.json` (both git-ignored). Only the six
  `NEXT_PUBLIC_FIREBASE_*` values belong in Vercel. `ADMIN_EMAIL`, `DEMO_HOME_EMAIL`,
  `FIREBASE_SERVICE_ACCOUNT` are local, setup-only.
- `firestore.rules` is the source of truth; publish only via `npm run setup` and re-run `test:security` after.
- Owners can edit only their own home and can't change `id`, `ownerUid`, or `protected`.
- Messages and volunteer sign-ups are readable only by that home's owner or an admin.
- Impact counters only rise with real data (a sign-up in the same batch; a home owner marking fulfilled).
- `sunshine-home` is the protected demo listing. Setup never overwrites it; tests restore it exactly.
- Ask before changing production rules or data. Never show full addresses; map pins are city centers.

## Design system — "paper, ink, amber"

Benchmark: editorial craft in the spirit of amphi-forum.org, expressed as HomeBridge's own identity.

**Color** (`tailwind.config.ts`): paper `cream` #F4EFE4 (surfaces), `cream-100/200` for quiet panels,
ink `navy-900` #131A2B (type), `navy-800` #1B2A4A (dark panels), amber `amber-500` #E8A33D for fills
only, `amber-700` #995B00 for amber *text*. Body copy `navy-600/700`; small gray text no lighter than
`navy-400` (#62697D, 4.5:1 on paper).

**Type**: Instrument Serif for display (`.display` / `font-serif`, regular weight only, never bold, tight
leading ~0.9); Geist for reading and UI; Geist Mono (`.eyebrow`, `font-mono`) only for real data labels
(counts, areas, categories, schedules). Dashboards keep sans controls; serif for page titles only.

**Composition**: left-aligned, asymmetric 12-column layouts; hairline rules (`border-navy-900/15`, strong
`/80` to open a list); generous section spacing (`pt-32 md:pt-44`); no drop shadows on cards, small radius
(`rounded-lg`) on photos and buttons only. Lists over card grids. Urgency = a 3px amber rule plus the
word "Urgent" in amber-700 — no badges, no pulsing.

**Motion**: one orchestrated entrance (hero line reveal + photo window). Elsewhere motion must answer an
action or show progress (homes index preview, how-it-works progress line, closing panel). No per-section
fade-ups. Every GSAP animation goes inside `gsap.matchMedia()` with `MOTION_OK`, inside `useGSAP` with a
`scope`. Clip backgrounds, never text.

**Copy**: plain, specific, sentence case. Say what a button does ("Give this", "Find a home to help").
Label demo figures as demonstration figures; never present seeded counters as verified impact.

## QA checklist before pushing

1. `npx tsc --noEmit`, `npm run lint`, `npx next build` all clean.
2. `npm run test:security` and `npm run test:flows` pass (they need `serviceAccount.json`).
3. Browser pass at 1440, 820, and 390 widths on `/`, `/homes`, a home page, `/volunteer`, `/near-me`,
   `/login`, `/register`, `/volunteer/hours`, a flyer. Check the mobile menu and homes index by touch.
4. axe-core: zero WCAG 2.1 AA violations on public pages.
5. Keep changes minimal and in the existing idiom; don't add dependencies without a reason.
