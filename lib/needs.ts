import type { FosterHome } from "./types";

export const openNeeds = (h: FosterHome) => h.needs.filter((n) => !n.fulfilled);
export const urgentNeeds = (h: FosterHome) => openNeeds(h).filter((n) => n.urgent);
