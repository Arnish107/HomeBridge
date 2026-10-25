export type NeedCategory = "clothes" | "food" | "supplies" | "school" | "other";

export interface Need {
  id: string;
  title: string;
  category: NeedCategory;
  urgent: boolean;
  fulfilled: boolean;
  wishlistUrl: string;
  note?: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  schedule: string;
  category: "tutoring" | "meals" | "mentoring" | "events" | "other";
  description: string;
}

export interface HomePhoto {
  url: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

export interface FosterHome {
  /** URL slug, also the Firestore document id */
  id: string;
  name: string;
  /** General area only (city or county), never a street address */
  area: string;
  county: string;
  zips: string[];
  description: string;
  /** Approximate city-center coordinates, never the real location */
  lat: number;
  lng: number;
  /** Cover photo of the home's spaces (never children). Falls back to a typographic cover. */
  photo?: HomePhoto;
  /** Index into the cover color palette (see components/home-cover.tsx) */
  tone?: number;
  needs: Need[];
  opportunities: VolunteerOpportunity[];
  /** ISO timestamp of the last edit to needs or profile */
  updatedAt?: string;
  /** Firebase Auth uid of the home's manager */
  ownerUid?: string;
}

export interface ImpactStats {
  itemsDonated: number;
  volunteersSignedUp: number;
  hoursVolunteered: number;
}

export const NEED_CATEGORIES: { value: NeedCategory; label: string }[] = [
  { value: "clothes", label: "Clothes" },
  { value: "food", label: "Food" },
  { value: "supplies", label: "Supplies" },
  { value: "school", label: "School materials" },
  { value: "other", label: "Other" },
];

export const categoryLabel = (c: NeedCategory) =>
  NEED_CATEGORIES.find((x) => x.value === c)?.label ?? "Other";
