"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NEED_CATEGORIES, categoryLabel, type Need, type NeedCategory } from "@/lib/types";
import type { OwnedHome } from "@/lib/manage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Empty } from "./empty";
import { Select } from "./select";

export function NeedsEditor({
  home,
  onChange,
}: {
  home: OwnedHome;
  onChange: (next: OwnedHome, opts?: { donated?: boolean }) => void;
}) {
  const setNeed = (id: string, patch: Partial<Need>, opts?: { donated?: boolean }) =>
    onChange({ ...home, needs: home.needs.map((n) => (n.id === id ? { ...n, ...patch } : n)) }, opts);
  const remove = (id: string) => onChange({ ...home, needs: home.needs.filter((n) => n.id !== id) });

  const sorted = [...home.needs].sort(
    (a, b) => Number(a.fulfilled) - Number(b.fulfilled) || Number(b.urgent) - Number(a.urgent)
  );
  const lastWishlist = home.needs.at(-1)?.wishlistUrl ?? "";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {sorted.length === 0 ? (
          <Empty title="No needs listed" body="Add the first item your home needs using the form." />
        ) : (
          <ul className="divide-y divide-cream-300 border-y border-cream-300">
            <AnimatePresence initial={false}>
              {sorted.map((n) => (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center"
                >
                  <div className={`min-w-0 flex-1 ${n.fulfilled ? "opacity-60" : ""}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-medium text-navy-800 ${n.fulfilled ? "line-through" : ""}`}>{n.title}</p>
                      {n.urgent && !n.fulfilled && <Badge variant="urgent">Urgent</Badge>}
                      {n.fulfilled && <Badge variant="success">Fulfilled</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs uppercase tracking-wider text-navy-400">{categoryLabel(n.category)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!n.fulfilled && (
                      <Button size="sm" variant="outline" onClick={() => setNeed(n.id, { urgent: !n.urgent })}>
                        {n.urgent ? "Not urgent" : "Mark urgent"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={n.fulfilled ? "outline" : "default"}
                      onClick={() => setNeed(n.id, { fulfilled: !n.fulfilled }, { donated: !n.fulfilled })}
                    >
                      {n.fulfilled ? "Reopen" : "Mark fulfilled"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-navy-400 hover:text-red-600"
                      onClick={() => {
                        if (confirm(`Remove “${n.title}” from your needs list?`)) remove(n.id);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <AddNeed
        defaultWishlist={lastWishlist}
        onAdd={(need) => onChange({ ...home, needs: [...home.needs, need] })}
      />
    </div>
  );
}

function AddNeed({ onAdd, defaultWishlist }: { onAdd: (n: Need) => void; defaultWishlist: string }) {
  const [category, setCategory] = useState<NeedCategory>("clothes");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        onAdd({
          id: crypto.randomUUID().slice(0, 8),
          title: String(f.get("title")).trim(),
          category,
          urgent: f.get("urgent") === "on",
          fulfilled: false,
          wishlistUrl: String(f.get("wishlistUrl")).trim(),
        });
        form.reset();
      }}
      className="h-fit rounded-3xl border border-cream-200 bg-white p-6 shadow-soft lg:sticky lg:top-24"
    >
      <h2 className="font-semibold">Add a need</h2>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="need-title">Item</Label>
          <Input id="need-title" name="title" required maxLength={80} placeholder="Rain boots (kids sizes 1-5)" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="need-cat">Category</Label>
          <Select id="need-cat" value={category} onChange={(e) => setCategory(e.target.value as NeedCategory)}>
            {NEED_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="need-url">Amazon wish list link</Label>
          <Input
            id="need-url"
            name="wishlistUrl"
            type="url"
            required
            defaultValue={defaultWishlist}
            placeholder="https://www.amazon.com/hz/wishlist/ls/…"
          />
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-navy-700">
          <input type="checkbox" name="urgent" className="h-4 w-4 accent-amber-500" />
          This is urgent
        </label>
        <Button type="submit" variant="accent">
          Add to needs list
        </Button>
      </div>
    </form>
  );
}
