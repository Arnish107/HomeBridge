// Firebase setup for HomeBridge. Safe to re-run.
//
//   npm run setup -- --dry-run         show what would change, change nothing
//   npm run setup                      publish rules, set roles, create any missing data
//   npm run setup -- --reset-samples   also restore the four NON-demo sample homes to their defaults
//
// Guarantees:
//   - Never deletes any document or user.
//   - Never overwrites Sunshine Home (the demo listing) or any home marked `protected`.
//     For those it only re-asserts ownerUid/protected, leaving all content untouched.
//   - Existing homes and counters are left as they are unless --reset-samples is passed
//     (and even then, protected homes are skipped).
//
// Reads from .env.local (local only, never shipped to the browser):
//   ADMIN_EMAIL               Firebase Auth user that gets the `admin` custom claim
//   DEMO_HOME_EMAIL           Firebase Auth user that owns Sunshine Home
//   FIREBASE_SERVICE_ACCOUNT  path to the service-account key JSON (default ./serviceAccount.json)

import { readFileSync, existsSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getSecurityRules } from "firebase-admin/security-rules";

const DEMO_HOME_ID = "sunshine-home";
const dryRun = process.argv.includes("--dry-run");
const resetSamples = process.argv.includes("--reset-samples");

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};
const step = (msg) => console.log(`${dryRun ? "[dry run] would " : "✓ "}${msg}`);
const note = (msg) => console.log(`• ${msg}`);

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const demoEmail = process.env.DEMO_HOME_EMAIL?.trim().toLowerCase();
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT?.trim() || "./serviceAccount.json";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

if (!adminEmail) fail("ADMIN_EMAIL is missing from .env.local");
if (!demoEmail) fail("DEMO_HOME_EMAIL is missing from .env.local");
if (adminEmail === demoEmail) fail("ADMIN_EMAIL and DEMO_HOME_EMAIL must be different accounts.");
if (!existsSync(keyPath))
  fail(`Service account key not found at ${keyPath}.\n  Firebase Console > Project settings > Service accounts > Generate new private key.`);

const key = JSON.parse(readFileSync(keyPath, "utf8"));
if (projectId && key.project_id !== projectId)
  fail(`The service account key is for project "${key.project_id}", but .env.local is for "${projectId}".`);

initializeApp({ credential: cert(key) });
const db = getFirestore();
const auth = getAuth();

console.log(`\nHomeBridge setup for ${key.project_id}${dryRun ? " (dry run: nothing will be changed)" : ""}\n`);

// 1. Accounts
const findUser = async (email, label) => {
  try {
    return await auth.getUserByEmail(email);
  } catch {
    fail(`No Firebase Auth user for ${label} (${email}). Create it in Authentication > Users > Add user.`);
  }
};
const adminUser = await findUser(adminEmail, "ADMIN_EMAIL");
const demoUser = await findUser(demoEmail, "DEMO_HOME_EMAIL");
note(`Found admin account and demo account`);

// 2. Roles (custom claims). Only this script, holding the service-account key, can set them.
if (adminUser.customClaims?.admin === true) note("Admin account already has the admin role");
else {
  step("give the admin account the server-controlled admin role (custom claim)");
  if (!dryRun) await auth.setCustomUserClaims(adminUser.uid, { ...adminUser.customClaims, admin: true });
}
if (demoUser.customClaims?.admin) {
  step("remove the admin role from the demo account");
  if (!dryRun) {
    const { admin: _drop, ...rest } = demoUser.customClaims;
    await auth.setCustomUserClaims(demoUser.uid, rest);
  }
} else note("Demo account has no admin role (correct)");

// 3. Security rules
step("publish firestore.rules");
if (!dryRun) await getSecurityRules().releaseFirestoreRulesetFromSource(readFileSync("firestore.rules", "utf8"));

// 4. Homes
const samples = JSON.parse(readFileSync("lib/sample-homes.json", "utf8"));
const DAY = 86_400_000;
const daysAgo = [1, 3, 0, 6, 2];

for (const [i, sample] of samples.entries()) {
  const ref = db.collection("homes").doc(sample.id);
  const snap = await ref.get();
  const isDemo = sample.id === DEMO_HOME_ID;

  if (snap.exists) {
    const data = snap.data();
    if (isDemo || data.protected) {
      // Protected: never touch content. Only make sure the demo account still owns it.
      if (isDemo && (data.ownerUid !== demoUser.uid || data.protected !== true)) {
        step(`${sample.name}: keep all content, re-link ownership to the demo account`);
        if (!dryRun) await ref.update({ ownerUid: demoUser.uid, protected: true });
      } else note(`${sample.name}: protected, left untouched`);
      continue;
    }
    if (!resetSamples) {
      note(`${sample.name}: already exists, left as is`);
      continue;
    }
  }

  step(`${sample.name}: ${snap.exists ? "reset to sample defaults" : "create"}${isDemo ? " (owned by the demo account, protected)" : ""}`);
  if (!dryRun)
    await ref.set({
      ...sample,
      updatedAt: new Date(Date.now() - daysAgo[i % daysAgo.length] * DAY).toISOString(),
      ownerUid: isDemo ? demoUser.uid : null,
      protected: isDemo,
    });
}

// 5. Impact counters
const stats = db.collection("stats").doc("impact");
if ((await stats.get()).exists) note("Impact counters already exist, left as is");
else {
  step("create impact counters");
  if (!dryRun) await stats.set({ itemsDonated: 128, volunteersSignedUp: 34, hoursVolunteered: 212 });
}

console.log(
  dryRun
    ? "\nDry run complete. Nothing was changed.\n"
    : "\nDone. If either account was already signed in, log out and back in so the new role takes effect.\n"
);
process.exit(0);
