"use client";

import { useEffect, useState } from "react";
import Landing from "./Landing";
import RoutePlanner from "./RoutePlanner";
import InstallPrompt from "./InstallPrompt";
import FeedbackWidget from "./FeedbackWidget";
import {
  setPendingRouteFile,
  setPendingPrompt,
  registerFileLaunchHandler,
  hasPendingRouteFile,
} from "@/lib/filehandoff";
import { isRouteFileName } from "@/lib/routing";

export default function PlannerApp() {
  const [started, setStarted] = useState(false);

  /** Routebestand van buitenaf (landing-knop, drop, PWA "openen met"). */
  const handleRouteFile = (file: File) => {
    setPendingRouteFile(file);
    setStarted(true);
  };

  /** Prompt van buitenaf (bijv. Route Roulette op de landing of /ontdek). */
  const handleRoutePrompt = (prompt: string) => {
    setPendingPrompt(prompt);
    setStarted(true);
  };

  // terug van /ontdek (of een ?rit-link): gelijk door naar de planner als er
  // iets klaarstaat — via rAF, niet synchroon in het effect (React-compiler)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasRit =
      hasPendingRouteFile() ||
      new URLSearchParams(window.location.search).has("rit");
    if (hasRit) {
      const r = requestAnimationFrame(() => setStarted(true));
      return () => cancelAnimationFrame(r);
    }
  }, []);

  useEffect(() => {
    registerFileLaunchHandler((file) => {
      if (isRouteFileName(file.name)) handleRouteFile(file);
    });
  }, []);

  return (
    <>
      {started ? (
        <RoutePlanner />
      ) : (
        <Landing
          onStart={() => setStarted(true)}
          onImportFile={handleRouteFile}
          onRouletteStart={handleRoutePrompt}
        />
      )}
      <InstallPrompt />
      <FeedbackWidget />
    </>
  );
}
