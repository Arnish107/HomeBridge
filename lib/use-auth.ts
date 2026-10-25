"use client";

import { useEffect, useState } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

/**
 * Whether this user holds the server-set `admin` custom claim.
 * Only used to choose which screen to show; Firestore rules enforce the real permission.
 */
export async function hasAdminClaim(user: User | null): Promise<boolean> {
  if (!user) return false;
  const { claims } = await user.getIdTokenResult();
  return claims.admin === true;
}

/** Current Firebase user. `loading` is true until Firebase reports the first auth state. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) return;
    return onIdTokenChanged(auth(), async (u) => {
      setUser(u);
      setIsAdmin(await hasAdminClaim(u).catch(() => false));
      setLoading(false);
    });
  }, []);

  return { user, loading, isAdmin };
}
