import { doc, getDoc } from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";
import { SAMPLE_IMPACT } from "./sample-data";
import type { ImpactStats } from "./types";

export async function getImpact(): Promise<ImpactStats> {
  if (!firebaseEnabled) return SAMPLE_IMPACT;
  try {
    const snap = await getDoc(doc(db(), "stats", "impact"));
    return snap.exists() ? { ...SAMPLE_IMPACT, ...(snap.data() as Partial<ImpactStats>) } : SAMPLE_IMPACT;
  } catch (err) {
    console.error("[impact] Firestore read failed, using sample stats", err);
    return SAMPLE_IMPACT;
  }
}
