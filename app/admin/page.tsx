import type { Metadata } from "next";
import { AdminQueue } from "@/components/admin-queue";

export const metadata: Metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <div className="container min-h-[60vh] pt-10 md:pt-14">
      <AdminQueue />
    </div>
  );
}
