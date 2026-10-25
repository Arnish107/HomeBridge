"use client";

import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/submissions";
import { FormSuccess } from "./form-success";

export function ContactDialog({
  homeId,
  homeName,
  triggerProps,
}: {
  homeId: string;
  homeName: string;
  triggerProps?: ButtonProps;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      await sendContactMessage({
        homeId,
        name: String(f.get("name")).trim(),
        email: String(f.get("email")).trim(),
        message: String(f.get("message")).trim(),
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
        <Button {...triggerProps}>
          Contact {homeName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {status === "sent" ? (
          <FormSuccess
            title="Message sent"
            body={`${homeName} will get your note in their HomeBridge inbox and reply to the email you gave.`}
          >
            <DialogClose asChild>
              <Button variant="outline">Done</Button>
            </DialogClose>
          </FormSuccess>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Message {homeName}</DialogTitle>
              <DialogDescription>
                Ask about a donation, a drop-off, or how else you can help.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">Your name</Label>
                  <Input id="c-name" name="name" required maxLength={80} autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-email">Email</Label>
                  <Input id="c-email" name="email" type="email" required maxLength={120} autoComplete="email" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-message">Message</Label>
                <Textarea id="c-message" name="message" required minLength={10} maxLength={1500} placeholder="Hi! I'd love to help with…" />
              </div>
              <p className="rounded-xl bg-cream-100 px-3 py-2.5 text-xs text-navy-500">
                Your message is delivered through HomeBridge. The home&apos;s contact details are never shared publicly.
              </p>
              {status === "error" && (
                <p className="text-sm text-destructive">Something went wrong sending that. Please try again.</p>
              )}
              <Button type="submit" variant="accent" size="lg" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
