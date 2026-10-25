// One-time (and safely re-runnable) Firebase setup for HomeBridge.
//
//   npm run setup                  publish rules, link the demo account, create any missing data
//   npm run setup -- --reset-samples   also restore the four NON-demo sample homes to their defaults
//
// Sunshine Home (the demo account's home) is marked `protected` and is never overwritten by this script.
//
// Needs in .env.local:
//   NEXT_PUBLIC_ADMIN_EMAIL   email allowed into /admin
//   DEMO_HOME_EMAIL           the Sunshine Home login you created in Firebase Console > Authentication
//   FIREBASE_SERVICE_ACCOUNT  path to the service-account key JSON (default ./serviceAccount.json)

import { readFileSync, existsSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getSecurityRules } from "firebase-admin/security-rules";

const DEMO_HOME_ID = "sunshine-home";
const resetSamples = process.argv.includes("--reset-samples");

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
const demoEmail = process.env.DEMO_HOME_EMAIL?.trim();
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT?.trim() || "./serviceAccount.json";

if (!adminEmail) fail("NEXT_PUBLIC_ADMIN_EMAIL is missing from .env.local");
if (!demoEmail) fail("DEMO_HOME_EMAIL is missing from .env.local");
if (!existsSync(keyPath))
  fail(`Service account key not found at ${keyPath}.\n  Firebase Console > Project settings > Service accounts > Generate new private key.`);

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) });
const db = getFirestore();

// 1. Security rules
const rules = readFileSync("firestore.rules", "utf8").replaceAll("__ADMIN_EMAIL__", adminEmail.replace(/'/g, ""));
await getSecurityRules().releaseFirestoreRulesetFromSource(rules);
console.log("✓ Published Firestore security rules");

// 2. Demo account
let demoUser;
try {
  demoUser = await getAuth().getUserByEmail(demoEmail);
} catch {
  fail(`No Firebase Auth user with email ${demoEmail}.\n  Create it in Firebase Console > Authentication > Users > Add user, then run this again.`);
}
console.log(`✓ Found demo login ${demoEmail}`);

// 3. Homes
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
      // Never touch content. Only make sure the demo account still owns it.
      if (isDemo && (data.ownerUid !== demoUser.uid || !data.protected)) {
        await ref.update({ ownerUid: demoUser.uid, protected: true });
        console.log(`✓ ${sample.name}: kept all content, re-linked to ${demoEmail}`);
      } else {
        console.log(`✓ ${sample.name}: protected, left untouched`);
      }
      continue;
    }
    if (!resetSamples) {
      console.log(`• ${sample.name}: already exists, left as is`);
      continue;
    }
  }

  await ref.set({
    ...sample,
    updatedAt: new Date(Date.now() - daysAgo[i % daysAgo.length] * DAY).toISOString(),
    ownerUid: isDemo ? demoUser.uid : null,
    protected: isDemo,
  });
  console.log(`✓ ${sample.name}: ${snap.exists ? "reset to defaults" : "created"}${isDemo ? ` (owned by ${demoEmail})` : ""}`);
}

// 4. Impact counters
const stats = db.collection("stats").doc("impact");
if (!(await stats.get()).exists) {
  await stats.set({ itemsDonated: 128, volunteersSignedUp: 34, hoursVolunteered: 212 });
  console.log("✓ Created impact counters");
} else {
  console.log("• Impact counters already exist, left as is");
}

console.log("\nDone. Log in at /login with the demo account to manage Sunshine Home.\n");
process.exit(0);
