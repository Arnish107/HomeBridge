"use client";

import { useState } from "react";
import Link from "next/link";
import { firebaseEnabled } from "@/lib/firebase";
import { authErrorMessage, registerHome } from "@/lib/auth";
import { AuthShell, SetupNotice } from "@/components/auth-shell";
import { FormSuccess } from "@/components/forms/form-success";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Field({
  id,
  label,
  hint,
  ...props
}: { id: string; label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...props} />
      {hint && <p className="text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firebaseEnabled) return;
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    if (get("password").length < 8) return setError("Please choose a password with at least 8 characters.");
    if (get("password") !== String(f.get("confirm"))) return setError("The passwords don't match.");
    setStatus("sending");
    setError(null);
    try {
      await registerHome(
        {
          homeName: get("homeName"),
          contactName: get("contactName"),
          email: get("email"),
          phone: get("phone"),
          area: get("area"),
          zip: get("zip"),
          licenseNumber: get("licenseNumber"),
          description: get("description"),
        },
        String(f.get("password"))
      );
      setStatus("sent");
    } catch (err) {
      setError(authErrorMessage(err));
      setStatus("idle");
    }
  }

  return (
    <AuthShell
      eyebrow="Register your home"
      title="Bring your community closer"
      body="HomeBridge is free for licensed foster homes and agencies in Georgia."
      points={[
        "Tell us about your home. This takes about three minutes.",
        "Our team checks your license and contact details, usually within two days.",
        "Once approved, log in to post your needs and volunteer roles.",
      ]}
    >
      {status === "sent" ? (
        <FormSuccess
          title="Request received"
          body="Thanks! Our team will review your registration and email you when your home is approved."
        >
          <Button asChild variant="outline">
            <Link href="/">Back to HomeBridge</Link>
          </Button>
        </FormSuccess>
      ) : (
        <>
          <h2 className="text-2xl font-bold">Registration request</h2>
          <p className="mt-1 text-sm text-navy-500">
            Your phone number, email, and license number are only seen by our review team.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5">
            {!firebaseEnabled && <SetupNotice />}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="homeName" label="Home or agency name" required maxLength={80} />
              <Field id="contactName" label="Your name" required maxLength={80} autoComplete="name" />
              <Field id="email" label="Email" type="email" required maxLength={120} autoComplete="email" />
              <Field id="phone" label="Phone" type="tel" required maxLength={20} autoComplete="tel" />
              <Field
                id="area"
                label="City or county"
                required
                maxLength={60}
                placeholder="Cumming, GA"
                hint="This is the only location shown publicly."
              />
              <Field id="zip" label="ZIP code" required inputMode="numeric" pattern="\d{5}" maxLength={5} />
            </div>
            <Field id="licenseNumber" label="Foster care license number" required maxLength={40} />
            <div className="grid gap-2">
              <Label htmlFor="description">About your home</Label>
              <Textarea
                id="description"
                name="description"
                required
                minLength={40}
                maxLength={800}
                placeholder="Who you care for, and what kind of help makes the biggest difference."
              />
            </div>
            <div className="grid gap-5 border-t border-cream-200 pt-5 sm:grid-cols-2">
              <Field id="password" label="Create a password" type="password" required minLength={8} autoComplete="new-password" />
              <Field id="confirm" label="Confirm password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="accent" size="lg" disabled={status === "sending" || !firebaseEnabled}>
              {status === "sending" ? "Submitting…" : "Submit for review"}
            </Button>
          </form>

          <p className="mt-8 border-t border-cream-200 pt-6 text-sm text-navy-600">
            Already approved?{" "}
            <Link href="/login" className="font-semibold text-navy-800 underline underline-offset-4">
              Log in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
