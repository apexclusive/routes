"use client";

import { useEffect } from "react";
import { captureAttribution, trackEvent, type AnalyticsProps } from "@/lib/analytics";

const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || "";
const SCRIPT_URL =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL?.trim() ||
  "https://plausible.io/js/script.js";

/**
 * Eén lichte analytics-laag voor de hele funnel. Elementen met
 * `data-track="Eventnaam"` worden automatisch gemeten; aanvullende
 * `data-track-*` attributen worden eigenschappen. Zonder domein wordt geen
 * script of netwerkrequest geladen.
 */
export default function Analytics() {
  useEffect(() => {
    captureAttribution();

    if (DOMAIN) {
      window.plausible =
        window.plausible ||
        Object.assign(
          (event: string, options?: unknown) => {
            window.plausible!.q = window.plausible!.q || [];
            window.plausible!.q!.push([event, options]);
          },
          { q: [] as unknown[][] }
        );

      if (!document.querySelector('script[data-apex-analytics="plausible"]')) {
        const script = document.createElement("script");
        script.defer = true;
        script.src = SCRIPT_URL;
        script.dataset.domain = DOMAIN;
        script.dataset.apexAnalytics = "plausible";
        document.head.appendChild(script);
      }
    }

    const onClick = (event: MouseEvent) => {
      const origin = event.target;
      if (!(origin instanceof Element)) return;
      const element = origin.closest<HTMLElement>("[data-track]");
      if (!element?.dataset.track) return;
      const props: AnalyticsProps = {};
      for (const [key, value] of Object.entries(element.dataset)) {
        if (key === "track" || !key.startsWith("track") || !value) continue;
        const suffix = key.slice("track".length);
        const prop = suffix
          ? suffix.charAt(0).toLowerCase() + suffix.slice(1)
          : "";
        if (prop) props[prop] = value;
      }
      trackEvent(element.dataset.track, props);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
