import type { FosterHome, ImpactStats } from "./types";
import homes from "./sample-homes.json";

const DAY = 86_400_000;
// Spread "last updated" over the past week so the freshness labels look realistic.
const UPDATED_DAYS_AGO = [1, 3, 0, 6, 2];

export const SAMPLE_HOMES: FosterHome[] = (homes as FosterHome[]).map((h, i) => ({
  ...h,
  updatedAt: h.updatedAt ?? new Date(Date.now() - UPDATED_DAYS_AGO[i % UPDATED_DAYS_AGO.length] * DAY).toISOString(),
}));

/** Demo baseline shown until the Firestore `stats/impact` document exists. */
export const SAMPLE_IMPACT: ImpactStats = {
  itemsDonated: 128,
  volunteersSignedUp: 34,
  hoursVolunteered: 212,
};
