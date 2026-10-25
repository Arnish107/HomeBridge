// Live security test for HomeBridge's Firestore rules and roles.
//
//   npm run test:security
//
// Signs in as the admin and demo accounts using one-time custom tokens minted by the Admin SDK
// (no passwords involved), plus an anonymous visitor, and checks that every access is allowed
// or denied as expected. Every test write is cleaned up at the end: test messages and sign-ups
// are deleted, Sunshine Home's needs list is restored exactly, and the impact counters are reset.

import { readFileSync } from "node:fs";
import { cert, initializeApp as initAdmin } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminDb } from "firebase-admin/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, getDocs, getFirestore, increment, query, serverTimestamp,
  setDoc, updateDoc, where, writeBatch,
} from "firebase/firestore";

const env = process.env;
const key = JSON.parse(readFileSync(env.FIREBASE_SERVICE_ACCOUNT?.trim() || "./serviceAccount.json", "utf8"));
initAdmin({ credential: cert(key) });
const adminAuth = getAdminAuth();
const adminDb = getAdminDb();

const webConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** A separate client "browser" per identity. */
async function client(name, email) {
  const app = initializeApp(webConfig, name);
  if (email) {
    const user = await adminAuth.getUserByEmail(email.trim());
    await signInWithCustomToken(getAuth(app), await adminAuth.createCustomToken(user.uid));
  }
  return { app, db: getFirestore(app), auth: getAuth(app) };
}

/** JSON with sorted keys, so field order doesn't affect comparisons. */
const stable = (v) =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`
  : JSON.stringify(v);

let passed = 0;
let failed = 0;
const created = { messages: [], signups: [] };

async function expect(label, shouldSucceed, fn) {
  let ok;
  let detail = "";
  try {
    await fn();
    ok = shouldSucceed;
    if (!ok) detail = " (was allowed, should be denied)";
  } catch (e) {
    ok = !shouldSucceed && e.code === "permission-denied";
    if (!ok) detail = ` (${e.code ?? e.message})`;
  }
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail}`);
}

const SUN = "sunshine-home";
const OTHER = "hope-house";
const sunRef = adminDb.collection("homes").doc(SUN);
const sunBefore = (await sunRef.get()).data();
const statsBefore = (await adminDb.collection("stats").doc("impact").get()).data();
if (!sunBefore) {
  console.error("Sunshine Home doesn't exist yet. Run `npm run setup` first.");
  process.exit(1);
}

const anon = await client("anon");
const demo = await client("demo", env.DEMO_HOME_EMAIL);
const admin = await client("admin", env.ADMIN_EMAIL);

try {
  console.log("\n— Roles —");
  await expect("demo account does NOT have the admin role", true, async () => {
    const { claims } = await demo.auth.currentUser.getIdTokenResult();
    if (claims.admin) throw new Error("demo has admin claim");
  });
  await expect("admin account has the admin role", true, async () => {
    const { claims } = await admin.auth.currentUser.getIdTokenResult();
    if (claims.admin !== true) throw new Error("admin claim missing");
  });

  console.log("\n— Anonymous visitor —");
  await expect("can read public home listings", true, () => getDocs(collection(anon.db, "homes")));
  await expect("can read impact counters", true, () => getDoc(doc(anon.db, "stats", "impact")));
  await expect("cannot edit a home", false, () => updateDoc(doc(anon.db, "homes", SUN), { name: "Hacked" }));
  await expect("cannot read contact messages", false, () => getDocs(collection(anon.db, "messages")));
  await expect("cannot read volunteer sign-ups", false, () => getDocs(collection(anon.db, "volunteer_signups")));
  await expect("cannot read registration requests", false, () => getDocs(collection(anon.db, "pending_homes")));
  await expect("can send a contact message", true, async () => {
    const r = await addDoc(collection(anon.db, "messages"), {
      homeId: SUN, name: "Security Test", email: "test@example.com",
      message: "Automated security test message.", read: false, createdAt: serverTimestamp(),
    });
    created.messages.push(r.id);
  });
  await expect("cannot add hidden extra fields to a message", false, () =>
    addDoc(collection(anon.db, "messages"), {
      homeId: SUN, name: "x", email: "x@example.com", message: "Extra field test", read: false,
      createdAt: serverTimestamp(), isAdmin: true,
    }));
  await expect("cannot message a home that doesn't exist", false, () =>
    addDoc(collection(anon.db, "messages"), {
      homeId: "no-such-home", name: "x", email: "x@example.com", message: "Nonexistent home test",
      read: false, createdAt: serverTimestamp(),
    }));
  await expect("can sign up to volunteer", true, async () => {
    const r = await addDoc(collection(anon.db, "volunteer_signups"), {
      homeId: SUN, opportunityId: "o1", name: "Security Test", email: "test@example.com",
      hours: 2, message: "", createdAt: serverTimestamp(),
    });
    created.signups.push(r.id);
  });
  await expect("cannot inflate impact counters", false, () =>
    setDoc(doc(anon.db, "stats", "impact"), { itemsDonated: increment(1000) }, { merge: true }));
  await expect("cannot bump volunteer counters without a real sign-up", false, () =>
    setDoc(doc(anon.db, "stats", "impact"), { volunteersSignedUp: increment(1), hoursVolunteered: increment(2), lastSignup: "fake-id" }, { merge: true }));
  await expect("cannot bump 'items donated' without owning a home", false, () =>
    setDoc(doc(anon.db, "stats", "impact"), { itemsDonated: increment(1), lastHome: SUN }, { merge: true }));
  await expect("sign-up + matching counter bump in one write is allowed", true, async () => {
    const s = doc(collection(anon.db, "volunteer_signups"));
    const b = writeBatch(anon.db);
    b.set(s, { homeId: SUN, opportunityId: "o1", name: "Security Test", email: "test@example.com", hours: 2, message: "", createdAt: serverTimestamp() });
    b.set(doc(anon.db, "stats", "impact"), { volunteersSignedUp: increment(1), hoursVolunteered: increment(2), lastSignup: s.id }, { merge: true });
    await b.commit();
    created.signups.push(s.id);
  });
  await expect("hours bump must equal the sign-up's hours", false, async () => {
    const s = doc(collection(anon.db, "volunteer_signups"));
    const b = writeBatch(anon.db);
    b.set(s, { homeId: SUN, opportunityId: "o1", name: "Security Test", email: "test@example.com", hours: 2, message: "", createdAt: serverTimestamp() });
    b.set(doc(anon.db, "stats", "impact"), { volunteersSignedUp: increment(1), hoursVolunteered: increment(40), lastSignup: s.id }, { merge: true });
    await b.commit();
    created.signups.push(s.id); // only reached if wrongly allowed, so cleanup still happens
  });

  console.log("\n— Demo account (Sunshine Home owner) —");
  const needs = sunBefore.needs;
  const testNeed = { id: "sectest", title: "Security test item", category: "other", urgent: false, fulfilled: false, wishlistUrl: "https://www.amazon.com/" };
  await expect("can add a need to its own home", true, () =>
    updateDoc(doc(demo.db, "homes", SUN), { needs: [...needs, testNeed] }));
  await expect("can mark that need fulfilled", true, () =>
    updateDoc(doc(demo.db, "homes", SUN), { needs: [...needs, { ...testNeed, fulfilled: true }] }));
  await expect("can count a donation (+1) for its own home", true, () =>
    setDoc(doc(demo.db, "stats", "impact"), { itemsDonated: increment(1), lastHome: SUN }, { merge: true }));
  await expect("cannot count a donation for another home", false, () =>
    setDoc(doc(demo.db, "stats", "impact"), { itemsDonated: increment(1), lastHome: OTHER }, { merge: true }));
  await expect("cannot count more than one donation at a time", false, () =>
    setDoc(doc(demo.db, "stats", "impact"), { itemsDonated: increment(5), lastHome: SUN }, { merge: true }));
  await expect("can remove that need again", true, () => updateDoc(doc(demo.db, "homes", SUN), { needs }));
  await expect("cannot transfer ownership of its home", false, () =>
    updateDoc(doc(demo.db, "homes", SUN), { ownerUid: "someone-else" }));
  await expect("cannot remove its home's protected flag", false, () =>
    updateDoc(doc(demo.db, "homes", SUN), { protected: false }));
  await expect("cannot edit another home", false, () =>
    updateDoc(doc(demo.db, "homes", OTHER), { name: "Hacked" }));
  await expect("cannot create a new home", false, () =>
    setDoc(doc(demo.db, "homes", "fake-home"), { id: "fake-home", name: "Fake", ownerUid: demo.auth.currentUser.uid }));
  await expect("can read its own messages", true, async () => {
    const s = await getDocs(query(collection(demo.db, "messages"), where("homeId", "==", SUN)));
    if (!s.docs.some((d) => created.messages.includes(d.id))) throw new Error("test message not visible");
  });
  await expect("can read its own volunteer sign-ups", true, () =>
    getDocs(query(collection(demo.db, "volunteer_signups"), where("homeId", "==", SUN))));
  await expect("cannot read another home's messages", false, () =>
    getDocs(query(collection(demo.db, "messages"), where("homeId", "==", OTHER))));
  await expect("cannot read the admin registration queue", false, () =>
    getDocs(query(collection(demo.db, "pending_homes"), where("status", "==", "pending"))));

  console.log("\n— Admin account —");
  await expect("can read the registration queue", true, () =>
    getDocs(query(collection(admin.db, "pending_homes"), where("status", "==", "pending"))));
  await expect("can read any home's messages", true, () =>
    getDocs(query(collection(admin.db, "messages"), where("homeId", "==", SUN))));
  await expect("can read any home's sign-ups", true, () => getDocs(collection(admin.db, "volunteer_signups")));
} finally {
  // Cleanup: remove test documents and restore anything the test touched.
  for (const id of created.messages) await adminDb.collection("messages").doc(id).delete();
  for (const id of created.signups) await adminDb.collection("volunteer_signups").doc(id).delete();
  await sunRef.update({ needs: sunBefore.needs });
  if (statsBefore) await adminDb.collection("stats").doc("impact").set(statsBefore);
  await Promise.all([anon, demo, admin].map((c) => deleteApp(c.app)));

  const sunAfter = (await sunRef.get()).data();
  const same = stable(sunAfter) === stable(sunBefore);
  console.log(`\nCleanup: removed ${created.messages.length} test message(s), ${created.signups.length} test sign-up(s).`);
  console.log(`Sunshine Home content ${same ? "identical to before the test" : "DIFFERS from before the test (check it!)"}.`);
  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed || !same ? 1 : 0);
}
