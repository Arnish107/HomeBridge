"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { signUpToVolunteer } from "@/lib/submissions";
import type { VolunteerOpportunity } from "@/lib/types";
import { FormSuccess } from "./form-success";

export function SignupDialog({
  homeId,
  homeName,
  opportunity,
  triggerProps,
}: {
  homeId: string;
  homeName: string;
  opportunity: VolunteerOpportunity;
  triggerProps?: ButtonProps;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      await signUpToVolunteer({
        homeId,
        opportunityId: opportunity.id,
        name: String(f.get("name")).trim(),
        email: String(f.get("email")).trim(),
        hours: Math.max(1, Math.min(40, Number(f.get("hours")) || 1)),
        message: String(f.get("message") ?? "").trim(),
      });
      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(() => setStatus("idle"), 300);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" {...triggerProps}>
          Sign up
        </Button>
      </DialogTrigger>
      <DialogContent>
        {status === "sent" ? (
          <FormSuccess
            title="You're signed up!"
            body={`${homeName} will email you to confirm your first ${opportunity.title.toLowerCase()} session.`}
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="accent">
                <Link href="/volunteer/hours">Start your hours log</Link>
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Done</Button>
              </DialogClose>
            </div>
          </FormSuccess>
        ) : (
          <>
            <DialogHeader>
              <p className="eyebrow">{homeName}</p>
              <DialogTitle>{opportunity.title}</DialogTitle>
              <DialogDescription className="font-medium text-amber-700">{opportunity.schedule}</DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="s-name">Full name</Label>
                  <Input id="s-name" name="name" required maxLength={80} autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" name="email" type="email" required maxLength={120} autoComplete="email" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-hours">Hours available per month</Label>
                <Input id="s-hours" name="hours" type="number" min={1} max={40} defaultValue={4} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s-message">Anything we should know? (optional)</Label>
                <Textarea id="s-message" name="message" maxLength={1000} placeholder="Experience, availability, questions…" />
              </div>
              {status === "error" && (
                <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
              )}
              <Button type="submit" variant="accent" size="lg" disabled={status === "sending"}>
                {status === "sending" ? "Signing you up…" : "Confirm sign up"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
