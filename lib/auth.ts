import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function logIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth(), email, password);
}

export async function logOut() {
  return signOut(auth());
}

export interface Registration {
  homeName: string;
  contactName: string;
  email: string;
  phone: string;
  area: string;
  zip: string;
  licenseNumber: string;
  description: string;
}

/**
 * Creates the foster home's login, then files a request in `pending_homes` (keyed by uid)
 * for an admin to approve. The public listing is only created on approval.
 */
export async function registerHome(r: Registration, password: string) {
  const cred = await createUserWithEmailAndPassword(auth(), r.email, password);
  await setDoc(doc(db(), "pending_homes", cred.user.uid), {
    ...r,
    uid: cred.user.uid,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

/** Turns Firebase error codes into sentences people can act on. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match an account.";
    case "auth/email-already-in-use":
      return "An account with that email already exists. Try logging in instead.";
    case "auth/weak-password":
      return "Please choose a password with at least 8 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    default:
      return "Something went wrong. Please try again.";
  }
}
