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
  promptFromSearch,
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

  // Terug van een gids, zoekresultaat of gedeelde `?plan=`-link: zet de
  // opdracht vóór het openen klaar. De URL is de duurzame fallback wanneer
  // een harde navigatie de modulebuffer heeft geleegd.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    const prompt = promptFromSearch(window.location.search);
    if (prompt) setPendingPrompt(prompt);
    const hasRit = hasPendingRouteFile() || Boolean(prompt) || query.has("rit");
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
