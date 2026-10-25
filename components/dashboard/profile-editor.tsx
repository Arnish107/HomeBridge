"use client";

import type { OwnedHome } from "@/lib/manage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileEditor({ home, onChange }: { home: OwnedHome; onChange: (next: OwnedHome) => void }) {
  return (
    <form
      key={home.updatedAt}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onChange({
          ...home,
          name: String(f.get("name")).trim(),
          area: String(f.get("area")).trim(),
          description: String(f.get("description")).trim(),
        });
      }}
      className="max-w-2xl rounded-xl border border-cream-200 bg-card p-6 shadow-soft sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Home name</Label>
            <Input id="p-name" name="name" required maxLength={80} defaultValue={home.name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-area">General area</Label>
            <Input id="p-area" name="area" required maxLength={60} defaultValue={home.area} />
            <p className="text-xs text-navy-400">City or county only. Never enter a street address.</p>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-desc">About your home</Label>
          <Textarea id="p-desc" name="description" required maxLength={800} defaultValue={home.description} className="min-h-[160px]" />
        </div>
        <Button type="submit" className="justify-self-start">
          Save profile
        </Button>
      </div>
    </form>
  );
}
