// Client-side reads and writes for the foster-home dashboard and the admin queue.
// Every write here is checked again by firestore.rules.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { FosterHome } from "./types";

export type OwnedHome = FosterHome & { ownerUid: string; protected?: boolean };

export async function findMyHome(uid: string): Promise<OwnedHome | null> {
  const snap = await getDocs(query(collection(db(), "homes"), where("ownerUid", "==", uid), limit(1)));
  const d = snap.docs[0];
  return d ? ({ ...(d.data() as OwnedHome), id: d.id }) : null;
}

/** Saves the whole home document and stamps `updatedAt` for the freshness labels. */
export async function saveHome(home: OwnedHome): Promise<OwnedHome> {
  const next = { ...home, updatedAt: new Date().toISOString() };
  await setDoc(doc(db(), "homes", home.id), next);
  return next;
}

/** +1 "items donated". Rules only allow it from the signed-in owner of `homeId`. */
export async function countDonation(homeId: string) {
  await setDoc(doc(db(), "stats", "impact"), { itemsDonated: increment(1), lastHome: homeId }, { merge: true });
}

export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: Timestamp;
}

export interface Signup {
  id: string;
  opportunityId: string;
  name: string;
  email: string;
  hours: number;
  message?: string;
  createdAt?: Timestamp;
}

const newestFirst = <T extends { createdAt?: Timestamp }>(a: T, b: T) =>
  (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0);

export async function getInbox(homeId: string) {
  const snap = await getDocs(query(collection(db(), "messages"), where("homeId", "==", homeId)));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<InboxMessage, "id">), id: d.id })).sort(newestFirst);
}

export async function markMessageRead(id: string) {
  await updateDoc(doc(db(), "messages", id), { read: true });
}

export async function getSignups(homeId: string) {
  const snap = await getDocs(query(collection(db(), "volunteer_signups"), where("homeId", "==", homeId)));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Signup, "id">), id: d.id })).sort(newestFirst);
}

// ---------- Registration ----------

export interface PendingHome {
  uid: string;
  homeName: string;
  contactName: string;
  email: string;
  phone: string;
  area: string;
  zip: string;
  licenseNumber: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: Timestamp;
}

export async function getMyRegistration(uid: string): Promise<PendingHome | null> {
  const snap = await getDoc(doc(db(), "pending_homes", uid));
  return snap.exists() ? (snap.data() as PendingHome) : null;
}

export async function getPendingQueue() {
  const snap = await getDocs(query(collection(db(), "pending_homes"), where("status", "==", "pending")));
  return snap.docs.map((d) => d.data() as PendingHome).sort(newestFirst);
}

/** Approximate city/county centers for the public map. Never a real address. */
export const PLACES: { label: string; county: string; lat: number; lng: number }[] = [
  { label: "Alpharetta, GA", county: "Fulton County", lat: 34.0754, lng: -84.2941 },
  { label: "Atlanta, GA", county: "Fulton County", lat: 33.749, lng: -84.388 },
  { label: "Cumming, GA", county: "Forsyth County", lat: 34.2073, lng: -84.1402 },
  { label: "Duluth, GA", county: "Gwinnett County", lat: 34.0029, lng: -84.1446 },
  { label: "Forsyth County, GA", county: "Forsyth County", lat: 34.247, lng: -84.09 },
  { label: "Gainesville, GA", county: "Hall County", lat: 34.2979, lng: -83.8241 },
  { label: "Johns Creek, GA", county: "Fulton County", lat: 34.0289, lng: -84.1986 },
  { label: "Lawrenceville, GA", county: "Gwinnett County", lat: 33.9562, lng: -83.988 },
  { label: "Marietta, GA", county: "Cobb County", lat: 33.9526, lng: -84.5499 },
  { label: "Roswell, GA", county: "Fulton County", lat: 34.0232, lng: -84.3616 },
  { label: "Suwanee, GA", county: "Gwinnett County", lat: 34.0515, lng: -84.0713 },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "home";

/** Publishes an approved registration as a public home owned by the applicant. */
export async function approveRegistration(p: PendingHome, placeLabel: string) {
  const place = PLACES.find((x) => x.label === placeLabel) ?? PLACES[0];
  let id = slugify(p.homeName);
  if ((await getDoc(doc(db(), "homes", id))).exists()) id = `${id}-${p.uid.slice(0, 5).toLowerCase()}`;

  const home: OwnedHome = {
    id,
    name: p.homeName,
    area: p.area || place.label,
    county: place.county,
    zips: [p.zip],
    description: p.description,
    lat: place.lat,
    lng: place.lng,
    tone: Math.floor(Math.random() * 6),
    needs: [],
    opportunities: [],
    updatedAt: new Date().toISOString(),
    ownerUid: p.uid,
    protected: false,
  };
  await setDoc(doc(db(), "homes", id), home);
  await updateDoc(doc(db(), "pending_homes", p.uid), { status: "approved", homeId: id });
  return home;
}

export async function rejectRegistration(uid: string) {
  await updateDoc(doc(db(), "pending_homes", uid), { status: "rejected" });
}
