"use client";

// Single place GSAP plugins are registered (GSAP skills: register once per app).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Media queries for gsap.matchMedia: motion only runs when the visitor allows it. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
