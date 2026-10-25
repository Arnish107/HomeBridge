import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";
import { SAMPLE_HOMES } from "./sample-data";
import type { FosterHome } from "./types";

/** Public view of a home: drops internal fields like the owner's uid. */
function toPublic(id: string, data: Record<string, unknown>): FosterHome {
  const { ownerUid: _owner, protected: _protected, ...rest } = data;
  void _owner;
  void _protected;
  return { ...(rest as unknown as FosterHome), id };
}

/** Reads homes from Firestore, falling back to bundled sample data when Firebase isn't set up. */
export async function getHomes(): Promise<FosterHome[]> {
  if (!firebaseEnabled) return SAMPLE_HOMES;
  try {
    const snap = await getDocs(collection(db(), "homes"));
    const homes = snap.docs.map((d) => toPublic(d.id, d.data()));
    return homes.length ? homes.sort((a, b) => a.name.localeCompare(b.name)) : SAMPLE_HOMES;
  } catch (err) {
    console.error("[homes] Firestore read failed, using sample data", err);
    return SAMPLE_HOMES;
  }
}

export async function getHome(id: string): Promise<FosterHome | null> {
  if (!firebaseEnabled) return SAMPLE_HOMES.find((h) => h.id === id) ?? null;
  try {
    const snap = await getDoc(doc(db(), "homes", id));
    return snap.exists() ? toPublic(snap.id, snap.data()) : null;
  } catch (err) {
    console.error("[homes] Firestore read failed, using sample data", err);
    return SAMPLE_HOMES.find((h) => h.id === id) ?? null;
  }
}

