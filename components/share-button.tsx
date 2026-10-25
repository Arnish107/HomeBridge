"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, type ButtonProps } from "./ui/button";

/** Uses the native share sheet on phones, falls back to copying the link. */
export function ShareButton({
  title,
  text,
  path,
  ...props
}: { title: string; text: string; path: string } & Omit<ButtonProps, "onClick">) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user dismissed the sheet; fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <Button onClick={share} {...props}>
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-2">
            Link copied
          </motion.span>
        ) : (
          <motion.span key="share" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-2">
            Share this home
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
