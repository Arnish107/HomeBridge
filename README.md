# HomeBridge

HomeBridge connects foster homes in North Metro Atlanta with neighbors who want to donate supplies or volunteer.
The public browses homes and gives through each home's wish list. Verified foster homes log in to manage their
listing, and an admin reviews new registrations.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lenis, Leaflet,
Firebase Authentication and Firestore.

## Run locally

```bash
npm install
npm run dev
```

Without Firebase keys the site runs on bundled sample data (login is disabled and shows a "Demo mode" notice).

## Firebase setup (one time)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Authentication → Get started → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode, a US region).
4. **Project settings → General → Your apps → Web (`</>`)**: register an app and copy the config values into
   `.env.local` (see `.env.example`). Also set `NEXT_PUBLIC_ADMIN_EMAIL`.
5. **Authentication → Users → Add user**: create the Sunshine Home demo login and an admin login.
   Put the demo login's email in `.env.local` as `DEMO_HOME_EMAIL`.
6. **Project settings → Service accounts → Generate new private key**: save it in this folder as
   `serviceAccount.json` (git-ignored, never commit it).
7. Run:

   ```bash
   npm run setup
   ```

   This publishes `firestore.rules`, creates the sample homes and impact counters, and links Sunshine Home to the
   demo login. It is safe to run again: it only creates missing data, and Sunshine Home is marked `protected`, so
   re-running setup, redeploying, or rebuilding never overwrites it. `npm run setup -- --reset-samples` restores the
   other four sample homes but still leaves Sunshine Home alone.

## Deploy (Vercel)

1. Push this repo to a private GitHub repository.
2. In Vercel, **Add New → Project → Import** the repo.
3. Add every `NEXT_PUBLIC_*` variable from `.env.local` under **Environment Variables**
   (not `DEMO_HOME_EMAIL` or `FIREBASE_SERVICE_ACCOUNT`, which are only for local setup).
4. Deploy, then add the Vercel domain under Firebase **Authentication → Settings → Authorized domains**.

The site is unlisted: every page sends `X-Robots-Tag: noindex` and `robots.txt` disallows all crawlers.

## Privacy by design

- Homes are shown by city or county only; map pins sit on city centers.
- Contact and volunteer forms go through the app; a home's email is never shown.
- Home photos are illustrative stock images of spaces (Unsplash), never children.
- Firestore rules let a foster home edit only its own listing and read only its own messages.
