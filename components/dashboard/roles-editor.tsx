"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { VolunteerOpportunity } from "@/lib/types";
import type { OwnedHome } from "@/lib/manage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Empty } from "./empty";
import { Select } from "./select";

const CATEGORIES: { value: VolunteerOpportunity["category"]; label: string }[] = [
  { value: "tutoring", label: "Tutoring" },
  { value: "meals", label: "Meals" },
  { value: "mentoring", label: "Mentoring" },
  { value: "events", label: "Events" },
  { value: "other", label: "Other" },
];

export function RolesEditor({ home, onChange }: { home: OwnedHome; onChange: (next: OwnedHome) => void }) {
  const [category, setCategory] = useState<VolunteerOpportunity["category"]>("tutoring");

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {home.opportunities.length === 0 ? (
          <Empty title="No volunteer roles" body="Post a role so neighbors can sign up to help in person." />
        ) : (
          <ul className="divide-y divide-cream-300 border-y border-cream-300">
            <AnimatePresence initial={false}>
              {home.opportunities.map((o) => (
                <motion.li
                  key={o.id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-3 py-5 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-6"
                >
                  <p className="text-sm font-semibold text-amber-700">{o.schedule}</p>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-800">{o.title}</p>
                    <p className="mt-0.5 text-sm text-navy-500">{o.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="justify-self-start text-navy-400 hover:text-red-600"
                    onClick={() => {
                      if (confirm(`Remove the “${o.title}” role?`))
                        onChange({ ...home, opportunities: home.opportunities.filter((x) => x.id !== o.id) });
                    }}
                  >
                    Remove
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          onChange({
            ...home,
            opportunities: [
              ...home.opportunities,
              {
                id: crypto.randomUUID().slice(0, 8),
                title: String(f.get("title")).trim(),
                schedule: String(f.get("schedule")).trim(),
                category,
                description: String(f.get("description")).trim(),
              },
            ],
          });
          form.reset();
        }}
        className="h-fit rounded-3xl border border-cream-200 bg-white p-6 shadow-soft lg:sticky lg:top-24"
      >
        <h2 className="font-semibold">Post a volunteer role</h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="role-title">Role</Label>
            <Input id="role-title" name="title" required maxLength={80} placeholder="Reading buddies" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-schedule">When</Label>
            <Input id="role-schedule" name="schedule" required maxLength={60} placeholder="Saturdays, 10-11am" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-cat">Type</Label>
            <Select
              id="role-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as VolunteerOpportunity["category"])}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-desc">What volunteers will do</Label>
            <Textarea id="role-desc" name="description" required maxLength={300} className="min-h-[90px]" />
          </div>
          <Button type="submit" variant="accent">
            Post role
          </Button>
        </div>
      </form>
    </div>
  );
}
