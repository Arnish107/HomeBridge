"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { firebaseEnabled } from "@/lib/firebase";
import { authErrorMessage, logIn } from "@/lib/auth";
import { isAdminEmail } from "@/lib/use-auth";
import { AuthShell, SetupNotice } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firebaseEnabled) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const { user } = await logIn(String(f.get("email")).trim(), String(f.get("password")));
      router.push(isAdminEmail(user.email) ? "/admin" : "/dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Foster home login"
      title="Welcome back"
      body="Log in to update your needs list, post volunteer roles, and read messages from your community."
      points={[
        "Keep your needs list current so donors send the right things.",
        "Mark items fulfilled as gifts arrive.",
        "Read messages from neighbors, sent safely through HomeBridge.",
      ]}
    >
      <h2 className="text-2xl font-bold">Log in</h2>
      <p className="mt-1 text-sm text-navy-500">
        Browsing and donating don&apos;t need an account. This login is for verified foster homes.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        {!firebaseEnabled && <SetupNotice />}
        <div className="grid gap-2">
          <Label htmlFor="l-email">Email</Label>
          <Input id="l-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="l-password">Password</Label>
          <Input id="l-password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={busy || !firebaseEnabled}>
          {busy ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-8 border-t border-cream-200 pt-6 text-sm text-navy-600">
        New to HomeBridge?{" "}
        <Link href="/register" className="font-semibold text-navy-800 underline underline-offset-4">
          Register your foster home
        </Link>
      </p>
    </AuthShell>
  );
}
