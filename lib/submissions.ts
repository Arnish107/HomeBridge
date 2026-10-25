import { addDoc, collection, doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
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
  await addDoc(collection(db(), "volunteer_signups"), { ...s, createdAt: serverTimestamp() });
  await setDoc(
    doc(db(), "stats", "impact"),
    { volunteersSignedUp: increment(1), hoursVolunteered: increment(s.hours) },
    { merge: true }
  );
}
