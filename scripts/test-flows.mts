// End-to-end test of HomeBridge's real data code (the same functions the dashboard, admin queue,
// contact form and volunteer form call), against the live Firebase project.
//
//   npm run test:flows
//
// Signs in with one-time custom tokens from the Admin SDK (no passwords). Every change is read back
// through the Admin SDK to prove it was saved, then cleaned up. Sunshine Home and the impact
// counters are restored exactly and verified at the end.

import { readFileSync } from "node:fs";
import { cert, initializeApp as initAdmin } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminDb } from "firebase-admin/firestore";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  countDonation, findMyHome, getInbox, getPendingQueue, getSignups, markMessageRead, saveHome,
} from "../lib/manage";
import { sendContactMessage, signUpToVolunteer } from "../lib/submissions";
import { hasAdminClaim } from "../lib/use-auth";

const key = JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT?.trim() || "./serviceAccount.json", "utf8"));
initAdmin({ credential: cert(key) });
const adminAuth = getAdminAuth();
const adminDb = getAdminDb();

const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]`
  : v && typeof v === "object"
    ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}`
  : JSON.stringify(v);

let passed = 0;
let failed = 0;
async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`PASS  ${label}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${label} (${(e as Error).message})`);
  }
}
const assert = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(msg);
};

async function signInAs(email: string) {
  const u = await adminAuth.getUserByEmail(email);
  await signInWithCustomToken(auth(), await adminAuth.createCustomToken(u.uid));
  return u;
}

const SUN = "sunshine-home";
const sunRef = adminDb.collection("homes").doc(SUN);
const statsRef = adminDb.collection("stats").doc("impact");
const sunBefore = (await sunRef.get()).data()!;
const statsBefore = (await statsRef.get()).data()!;
const marker = `flowtest-${Date.now()}`;

try {
  // ---------- Visitor: contact form + volunteer form ----------
  console.log("\n— Visitor forms —");
  await check("contact form message saves to Firestore", async () => {
    await sendContactMessage({ homeId: SUN, name: "Flow Test", email: "flowtest@example.com", message: `Hello from ${marker}` });
    const s = await adminDb.collection("messages").where("message", "==", `Hello from ${marker}`).get();
    assert(s.size === 1, "message not found in Firestore");
    assert(s.docs[0].data().read === false, "message should start unread");
  });
  await check("volunteer sign-up saves and bumps volunteer + hours counters", async () => {
    await signUpToVolunteer({ homeId: SUN, opportunityId: "o1", name: "Flow Test", email: "flowtest@example.com", hours: 3, message: marker });
    const s = await adminDb.collection("volunteer_signups").where("message", "==", marker).get();
    assert(s.size === 1, "sign-up not found in Firestore");
    const st = (await statsRef.get()).data()!;
    assert(st.volunteersSignedUp === statsBefore.volunteersSignedUp + 1, "volunteer counter not incremented");
    assert(st.hoursVolunteered === statsBefore.hoursVolunteered + 3, "hours counter not incremented");
  });

  // ---------- Sunshine Home dashboard ----------
  console.log("\n— Sunshine Home dashboard (demo account) —");
  const demo = await signInAs(process.env.DEMO_HOME_EMAIL!);
  await check("demo account is not treated as admin", async () => {
    assert(!(await hasAdminClaim(auth().currentUser)), "demo has admin");
  });
  let home = await findMyHome(demo.uid);
  await check("dashboard finds the demo account's home (Sunshine Home)", async () => {
    assert(home?.id === SUN, `found ${home?.id ?? "nothing"}`);
  });
  await check("add a donation need, and it persists", async () => {
    home = await saveHome({ ...home!, needs: [...home!.needs, { id: "flow1", title: "Flow test item", category: "other", urgent: false, fulfilled: false, wishlistUrl: "https://www.amazon.com/" }] });
    const saved = (await sunRef.get()).data()!;
    assert(saved.needs.some((n: { id: string }) => n.id === "flow1"), "new need not saved");
    assert(saved.updatedAt === home.updatedAt, "updatedAt not saved");
  });
  await check("edit the need (title + mark urgent), and it persists", async () => {
    home = await saveHome({ ...home!, needs: home!.needs.map((n) => (n.id === "flow1" ? { ...n, title: "Flow test item (edited)", urgent: true } : n)) });
    const n = (await sunRef.get()).data()!.needs.find((x: { id: string }) => x.id === "flow1");
    assert(n?.title === "Flow test item (edited)" && n?.urgent === true, "edit not saved");
  });
  await check("mark the need fulfilled + count the donation, and both persist", async () => {
    home = await saveHome({ ...home!, needs: home!.needs.map((n) => (n.id === "flow1" ? { ...n, fulfilled: true } : n)) });
    await countDonation(SUN);
    const n = (await sunRef.get()).data()!.needs.find((x: { id: string }) => x.id === "flow1");
    assert(n?.fulfilled === true, "fulfilled not saved");
    assert((await statsRef.get()).data()!.itemsDonated === statsBefore.itemsDonated + 1, "donation counter not incremented");
  });
  await check("remove the need, and it is gone", async () => {
    home = await saveHome({ ...home!, needs: home!.needs.filter((n) => n.id !== "flow1") });
    assert(!(await sunRef.get()).data()!.needs.some((x: { id: string }) => x.id === "flow1"), "need still present");
  });
  await check("post and remove a volunteer role", async () => {
    home = await saveHome({ ...home!, opportunities: [...home!.opportunities, { id: "flowrole", title: "Flow role", schedule: "Sundays", category: "other", description: "Test" }] });
    assert((await sunRef.get()).data()!.opportunities.some((o: { id: string }) => o.id === "flowrole"), "role not saved");
    home = await saveHome({ ...home!, opportunities: home!.opportunities.filter((o) => o.id !== "flowrole") });
    assert(!(await sunRef.get()).data()!.opportunities.some((o: { id: string }) => o.id === "flowrole"), "role not removed");
  });
  await check("re-loading the dashboard shows the saved state (refresh persistence)", async () => {
    const fresh = await findMyHome(demo.uid);
    assert(stable(fresh!.needs) === stable(home!.needs), "reloaded needs differ from saved");
  });
  await check("inbox shows the contact message, and marking it read persists", async () => {
    const inbox = await getInbox(SUN);
    const m = inbox.find((x) => x.message === `Hello from ${marker}`);
    assert(m, "message not in inbox");
    await markMessageRead(m!.id);
    assert((await adminDb.collection("messages").doc(m!.id).get()).data()!.read === true, "read flag not saved");
  });
  await check("sign-ups tab shows the volunteer sign-up", async () => {
    assert((await getSignups(SUN)).some((s) => s.message === marker), "sign-up not listed");
  });
  await check("demo account cannot open the admin queue", async () => {
    try {
      await getPendingQueue();
    } catch (e) {
      if ((e as { code?: string }).code === "permission-denied") return;
      throw e;
    }
    throw new Error("admin queue was readable");
  });
  await signOut(auth());

  // ---------- Admin ----------
  console.log("\n— Admin account —");
  await signInAs(process.env.ADMIN_EMAIL!);
  await check("admin account is recognized as admin", async () => {
    assert(await hasAdminClaim(auth().currentUser), "no admin claim");
  });
  await check("admin can load the registration queue", async () => {
    await getPendingQueue();
  });
  await check("admin owns no home (dashboard routes it to /admin)", async () => {
    assert((await findMyHome(auth().currentUser!.uid)) === null, "admin unexpectedly owns a home");
  });
  await signOut(auth());
} finally {
  // ---------- Cleanup ----------
  const leftovers: [string, string][] = [["messages", `Hello from ${marker}`], ["volunteer_signups", marker]];
  for (const [col, text] of leftovers)
    for (const d of (await adminDb.collection(col).where("message", "==", text).get()).docs) await d.ref.delete();
  await sunRef.set(sunBefore);
  await statsRef.set(statsBefore);
  const sunOk = stable((await sunRef.get()).data()) === stable(sunBefore);
  const statsOk = stable((await statsRef.get()).data()) === stable(statsBefore);
  console.log(`\nCleanup: test message and sign-up deleted. Sunshine Home ${sunOk ? "restored exactly" : "DIFFERS"}; impact counters ${statsOk ? "restored exactly" : "DIFFER"}.`);
  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed || !sunOk || !statsOk ? 1 : 0);
}
