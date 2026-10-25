import { addDoc, collection, doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, firebaseEnabled } from "./firebase";

const fakeLatency = () => new Promise((r) => setTimeout(r, 700));

export interface ContactMessage {
  homeId: string;
  name: string;
  email: string;
  message: string;
}

/** Stores a message for the home in Firestore; the home reads it from their dashboard. */
export async function sendContactMessage(msg: ContactMessage) {
  if (!firebaseEnabled) return fakeLatency();
  await addDoc(collection(db(), "messages"), { ...msg, read: false, createdAt: serverTimestamp() });
}

export interface VolunteerSignup {
  homeId: string;
  opportunityId: string;
  name: string;
  email: string;
  hours: number;
  message: string;
}

export async function signUpToVolunteer(s: VolunteerSignup) {
  if (!firebaseEnabled) return fakeLatency();
  // One atomic write: the sign-up and the counter bump that references it.
  // Firestore rules only allow the bump when it points at a sign-up created in this same write.
  const signup = doc(collection(db(), "volunteer_signups"));
  const batch = writeBatch(db());
  batch.set(signup, { ...s, createdAt: serverTimestamp() });
  batch.set(
    doc(db(), "stats", "impact"),
    { volunteersSignedUp: increment(1), hoursVolunteered: increment(s.hours), lastSignup: signup.id },
    { merge: true }
  );
  await batch.commit();
}
