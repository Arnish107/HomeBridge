"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export const isAdminEmail = (email?: string | null) => Boolean(ADMIN_EMAIL && email?.toLowerCase() === ADMIN_EMAIL);

/** Current Firebase user. `loading` is true until Firebase reports the first auth state. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) return;
    return onAuthStateChanged(auth(), (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading, isAdmin: isAdminEmail(user?.email) };
}
