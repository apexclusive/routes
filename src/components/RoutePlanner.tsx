"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Download,
  RotateCcw,
  Settings,
  Satellite,
  Mountain,
  Layers,
  MessageSquare,
  Map as MapIcon,
  ExternalLink,
  Upload,
  Trash2,
  Undo2,
  X,
  Route as RouteIcon,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  CircleDot,
  Flag,
  Bookmark,
  Share2,
  Check,
  Shuffle,
  Printer,
  ArrowLeftRight,
  Repeat,
  Trophy,
  Crown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Gauge,
  Fuel,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudRainWind,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
  CloudLightning,
  ChevronUp,
  ChevronDown,
  Zap,
  FileUp,
  Camera,
  RotateCw,
  BedDouble,
} from "lucide-react";
import ChatMessage, { TypingIndicator } from "./chat/ChatMessage";
import ChatInput from "./chat/ChatInput";
import Logo from "./Logo";
import { RouteWizard, ConversationMessage } from "@/lib/wizard";
import { Waypoint, Route, GeoJSON, VehicleType, Coordinates } from "@/types";
import { selectNavigationAnchors, buildTurnByTurn } from "@/lib/navigation";
import {
  listSavedRoutes,
  saveRoute,
  deleteSavedRoute,
  toStoredRoute,
  fromStoredRoute,
  type StoredRoute,
} from "@/lib/storage";
import { encodeRoute, decodeRoute, buildShareUrl } from "@/lib/share";
import ElevationProfile from "./ElevationProfile";
import {
  fetchElevationProfile,
  MIN_DISTANCE_M,
  type ElevationProfile as Profile,
} from "@/lib/elevation";
import { optimizeWaypointOrder, MIN_POINTS as MIN_OPTIMIZE_POINTS } from "@/lib/optimize";
import { fetchRoutePois, type RoutePoi } from "@/lib/pois";
import { generateLoopWaypoints } from "@/lib/loopgen";
import { fuelAdvice } from "@/lib/fuelrange";
import { difficultyLevel } from "@/lib/difficulty";
import { lineStringToCanvasPoints } from "@/lib/sharecard";
import { bookingSearchUrl, defaultTravelDates } from "@/lib/monetize";
import { trackEvent } from "@/lib/analytics";
import { fetchWeatherNow, weatherLabel, type WeatherNow } from "@/lib/weather";
import {
  downloadGPX,
  getWazeUrl,
  getGoogleMapsUrl,
  calculateRoute,
  reverseGeocode,
  matchTrackToRoads,
  nearestKnownPlaceName,
  calculateWindingScore,
  windingLabel,
  parseRouteFile,
  parseFIT,
  aiLayerConfigured,
  haversineKm,
  formatDistance,
  formatDuration,
  MAX_WAYPOINTS,
  ROUTE_FILE_EXTENSIONS,
  isRouteFileName,
} from "@/lib/routing";
import {
  consumePendingRouteFile,
  consumePendingPrompt,
  PENDING_ROUTE_EVENT,
  PENDING_PROMPT_EVENT,
} from "@/lib/filehandoff";
import {
  canUse,
  recordUse,
  getUsage,
  getProState,
  remainingToday,
  tierOf,
  trialDaysLeft,
  TIER_LIMITS,
  type UsageState,
  type ProState,
} from "@/lib/pro";
import { SHARED, PLANNER } from "@/lib/i18n";
import { useLang } from "./LangSwitch";
import { computeGarageStats, unlockedIds, newlyUnlocked, BADGES } from "@/lib/garage";
import { fireConfetti } from "@/lib/confetti";
import { spinRoulette, type RouletteVehicle } from "@/lib/roulette";
import {
  cumulativeDistances,
  positionAtDistance,
  totalDistanceM,
  rideSpeedMps,
  nextTurnAfter,
  type LatLon,
} from "@/lib/playback";
import ProDialog from "./ProDialog";
import GaragePanel from "./GaragePanel";

const PremiumMap = dynamic(() => import("./map/PremiumMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050507] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Kaart laden...</p>
      </div>
    </div>
  ),
});

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Auto" },
  { value: "motorcycle", label: "Motor" },
  { value: "bicycle", label: "Fiets" },
  { value: "pedestrian", label: "Wandelen" },
];

const MAX_IMPORT_BYTES = 15 * 1024 * 1024;

let wpCounter = 0;
function uid(prefix: string) {
  wpCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${wpCounter}`;
}

/** Weer-visual: lucide-icoon op basis van Open-Meteo-code + regen. */
function WeatherVisual({ code, rainMm }: { code: number; rainMm: number }) {
  const cls = "w-5 h-5 text-yellow-300 shrink-0";
  if (rainMm >= 1) return <CloudRain className={cls} />;
  if (rainMm > 0) return <CloudDrizzle className={cls} />;
  if (code === 0) return <Sun className={cls} />;
  if (code <= 2) return <CloudSun className={cls} />;
  if (code === 3) return <Cloud className={cls} />;
  if (code <= 48) return <CloudFog className={cls} />;
  if (code <= 57) return <CloudDrizzle className={cls} />;
  if (code <= 67) return <CloudRain className={cls} />;
  if (code <= 77) return <CloudSnow className={cls} />;
  if (code <= 82) return <CloudRainWind className={cls} />;
  return <CloudLightning className={cls} />;
}

/** Icoon bij een afslag-instructie. */
function TurnIcon({ type, modifier }: { type: string; modifier?: string }) {
  const m = modifier ?? "straight";
  const cls = "w-4 h-4 shrink-0 mt-0.5 text-yellow-400";
  if (
    type === "roundabout" ||
    type === "rotary" ||
    type === "roundabout turn" ||
    type === "exit roundabout" ||
    type === "exit rotary"
  )
    return <CircleDot className={cls} />;
  if (type === "arrive") return <Flag className={cls} />;
  if (m === "uturn") return <RotateCcw className={cls} />;
  if (m.includes("left")) return <CornerUpLeft className={cls} />;
  if (m.includes("right")) return <CornerUpRight className={cls} />;
  return <ArrowUp className={cls} />;
}

export default function RoutePlanner() {
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | undefined>(
    undefined
  );
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite" | "topo">("dark");
  const [vehicle, setVehicle] = useState<VehicleType>("car");
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showWaypointList, setShowWaypointList] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  // op smalle schermen ligt de chat als overlay-drawer over de kaart i.p.v.
  // ernaast (kaart blijft dan bruikbaar breed); standaard daar dicht
  const [isDesktop, setIsDesktop] = useState(true);
  // GPX/KML/GeoJSON-import: route volgt het bestand → Google-export gebruikt
  // representatieve ankers uit de track i.p.v. alleen start en einde
  const [importedRoute, setImportedRoute] = useState(false);
  const [navAnchors, setNavAnchors] = useState<Coordinates[]>([]);
  const [showTurns, setShowTurns] = useState(false);
  // opgeslagen routes (localStorage) en deel-links
  const [savedRoutes, setSavedRoutes] = useState<StoredRoute[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied" | "partial" | "failed">(
    "idle"
  );
  // hoogteprofiel (Open-Meteo) — extraatje, blokkeert nooit de route
  const [elevation, setElevation] = useState<{ key: string; profile: Profile | null } | null>(
    null
  );
  // aangeklikte afslag: de kaart vliegt erheen en zet er kort een pulse neer
  const [focusPoint, setFocusPoint] = useState<{
    coordinates: Coordinates;
    key: number;
  } | null>(null);
  // volgorde vóór het optimaliseren, zodat je het terug kunt draaien
  const [orderBeforeOptimize, setOrderBeforeOptimize] = useState<Waypoint[] | null>(null);
  // POI's langs de route (tankstations/laadpalen via Overpass)
  const [showPois, setShowPois] = useState(false);
  const [showLoopGen, setShowLoopGen] = useState(false);
  // A/B-varianten (Kurviger-stijl) + deel-afbeelding (REVER-stijl)
  const [variantB, setVariantB] = useState<{
    km: number;
    avoid: boolean;
    estimated: boolean;
  } | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [pois, setPois] = useState<RoutePoi[]>([]);
  const [poiKey, setPoiKey] = useState("");
  // weer op de startplek (Open-Meteo) — chip in de samenvatting
  const [weather, setWeather] = useState<{ key: string; now: WeatherNow | null } | null>(
    null
  );
  // Apex-lidmaatschap (Basis/Supporter/Pro) + daggebruik
  const [proState, setProState] = useState<ProState>({
    active: false,
    plan: "year",
    code: "",
    activatedAt: 0,
  });
  const [lang] = useLang();
  const P = PLANNER[lang];
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [showPro, setShowPro] = useState(false);
  // de Garage: statistieken + badges over opgeslagen routes
  const [showGarage, setShowGarage] = useState(false);

  const wizardRef = useRef<RouteWizard | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // huidige routenaam buiten React om, zodat computeFromWaypoints stabiel blijft
  const routeNameRef = useRef<string>(`Route ${new Date().toLocaleDateString("nl-NL")}`);

  useEffect(() => {
    if (route?.name) routeNameRef.current = route.name;
  }, [route]);

  /** Navigatie-punten voor Google: bij import de slimme ankers, anders de eigen punten. */
  const navCoords: Coordinates[] | null = (() => {
    if (importedRoute && navAnchors.length >= 2) return navAnchors;
    if (waypoints.length >= 2) return waypoints.map((w) => w.coordinates);
    return null;
  })();

  const embedUrl = (() => {
    if (!navCoords || navCoords.length < 2) return "";
    const start = navCoords[0];
    const rest = navCoords
      .slice(1)
      .map((w) => `${w.lat},${w.lng}`)
      .join("+to:");
    return `https://maps.google.com/maps?saddr=${start.lat},${start.lng}&daddr=${rest}&output=embed`;
  })();

  const googleMapsUrl = (() => {
    if (!navCoords) return "#";
    return getGoogleMapsUrl(navCoords, true, vehicle);
  })();

  useEffect(() => {
    wizardRef.current = new RouteWizard((msgs) => {
      setMessages(msgs);
    });
    setMessages(wizardRef.current.getMessages());
    setSavedRoutes(listSavedRoutes());
    // Lidmaatschap en daggebruik uit de lokale opslag
    setProState(getProState());
    setUsage(getUsage());
    const onProChange = (event: Event) => {
      const detail = (event as CustomEvent<ProState>).detail;
      setProState(detail && typeof detail.active === "boolean" ? detail : getProState());
    };
    window.addEventListener("apex:pro-change", onProChange);
    // gratis probe: is de optionele AI-laag op de server geconfigureerd?
    let alive = true;
    aiLayerConfigured().then((v) => {
      if (alive) setAiEnabled(v);
    });
    // responsive: op mobiel is de chat standaard dicht (overlay i.p.v. naast)
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => {
      setIsDesktop(mq.matches);
    };
    update();
    setChatOpen(mq.matches);
    mq.addEventListener("change", update);
    return () => {
      alive = false;
      window.removeEventListener("apex:pro-change", onProChange);
      mq.removeEventListener("change", update);
    };
  }, []);

  // pro-sneltoets: "/" zet de focus in de chat (niet als je al typt)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          (el instanceof HTMLElement && el.isContentEditable))
      )
        return;
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>("#apex-chat-input");
      input?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /** Route herberekenen — bewust níet binnen een state-updater aangeroepen. */
  const computeFromWaypoints = useCallback(
    async (wps: Waypoint[], veh: VehicleType, avoid: boolean) => {
      if (wps.length < 2) {
        setRoute(null);
        setRouteGeometry(undefined);
        return;
      }
      setIsCalculating(true);
      try {
        const routeData = await calculateRoute(
          wps.map((w) => w.coordinates),
          { vehicleType: veh, avoidHighways: avoid }
        );
        const newRoute: Route = {
          id: uid("route"),
          name: routeNameRef.current,
          waypoints: wps,
          geometry: routeData.geometry,
          distance: routeData.distance,
          duration: routeData.duration,
          windingScore: calculateWindingScore(routeData.geometry),
          turns: buildTurnByTurn(routeData),
          engine: routeData.estimated ? "manual" : "osrm",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setRoute(newRoute);
        setRouteGeometry(newRoute.geometry);
        setImportedRoute(false);
        setNavAnchors([]);
        trackEvent("Route berekend", {
          vehicle: veh,
          estimated: Boolean(routeData.estimated),
          waypoint_count: Math.min(wps.length, 25),
        });
      } catch (error) {
        trackEvent("Routeberekening mislukt", { vehicle: veh });
        console.error("Route calculation failed:", error);
      } finally {
        setIsCalculating(false);
      }
    },
    []
  );

  /** Deel-link in de URL-hash: route herstellen bij het openen van de pagina. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyHash = () => {
      const shared = decodeRoute(window.location.hash);
      if (!shared) return;

      const wps: Waypoint[] = shared.waypoints.map((w) => ({
        id: uid("wp"),
        name: w.name,
        coordinates: w.coordinates,
      }));

      setVehicle(shared.vehicle);
      setWaypoints(wps);
      routeNameRef.current = shared.name;
      trackEvent("Gedeelde route geopend", {
        vehicle: shared.vehicle,
        geometry: Boolean(shared.geometry),
        imported: Boolean(shared.imported),
      });

      if (shared.geometry) {
        // geometrie zat in de link → direct tonen, geen herberekening nodig
        setRoute({
          id: uid("route"),
          name: shared.name,
          waypoints: wps,
          geometry: shared.geometry,
          windingScore: calculateWindingScore(shared.geometry),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setRouteGeometry(shared.geometry);
        if (shared.imported) {
          setImportedRoute(true);
          setNavAnchors(
            selectNavigationAnchors(shared.geometry, 9).map((a) => a.coordinates)
          );
        }
      } else {
        // alleen routepunten gedeeld → route opnieuw berekenen
        computeFromWaypoints(wps, shared.vehicle, false);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: `**Gedeelde route geladen:** ${shared.name}\n\n${wps.length} punten${
            shared.geometry ? "" : " — de route wordt opnieuw over de wegen berekend."
          }`,
        },
      ]);
    };

    // de URL is een externe bron: na de eerste commit toepassen (geen cascading
    // render) en blijven luisteren, zodat een nieuw geplakte link ook werkt
    const timer = window.setTimeout(applyHash, 0);
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", applyHash);
    };
  }, [computeFromWaypoints]);

  /** Hoogteprofiel ophalen zodra er een (nieuwe) routegeometrie is. */
  const geometryKey = routeGeometry
    ? `${routeGeometry.coordinates.length}:${routeGeometry.coordinates[0]?.join(",")}:${routeGeometry.coordinates[routeGeometry.coordinates.length - 1]?.join(",")}`
    : "";
  const elevationProfile = elevation?.key === geometryKey ? elevation.profile : null;
  const elevationLoading = Boolean(routeGeometry) && elevation?.key !== geometryKey;

  useEffect(() => {
    if (!routeGeometry || routeGeometry.coordinates.length < 2) return;
    const controller = new AbortController();
    let alive = true;
    fetchElevationProfile(routeGeometry, controller.signal).then((profile) => {
      if (alive) setElevation({ key: geometryKey, profile });
    });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [routeGeometry, geometryKey]);

  /** Weer op de startplek ophalen bij een nieuwe route (extraatje). */
  useEffect(() => {
    if (!routeGeometry || routeGeometry.coordinates.length < 2) return;
    const key = geometryKey;
    if (weather?.key === key) return;
    const start = {
      lat: routeGeometry.coordinates[0][1],
      lng: routeGeometry.coordinates[0][0],
    };
    let alive = true;
    fetchWeatherNow(start).then((now) => {
      if (alive) setWeather({ key, now });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGeometry, geometryKey]);

  /** Tankstops/laadpalen ophalen zodra de laag aan staat (en de route verandert). */
  const poisLoading = showPois && Boolean(routeGeometry) && poiKey !== geometryKey;

  useEffect(() => {
    if (!showPois || !routeGeometry || routeGeometry.coordinates.length < 2) return;
    const key = geometryKey;
    if (key === poiKey) return;
    let alive = true;
    fetchRoutePois(routeGeometry, ["fuel", "charging", "viewpoint"]).then((found) => {
      if (!alive) return;
      setPois(found);
      setPoiKey(key);
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content:
            found.length === 0
              ? "Geen tankstations of laadpalen binnen 2 km van deze route gevonden (of de dienst is even onbereikbaar)."
              : `**${found.length} tankstops/laadpalen** binnen 2 km van je route gevonden — staat op de kaart. Dichtstbijzijnde: ${
                  found
                    .slice(0, 3)
                    .map((p) => `${p.name} (${p.distanceM} m)`)
                    .join(", ")
                }.`,
        },
      ]);
    });
    return () => {
      alive = false;
    };
    // poiKey bewust mee: voorkomt herhaalde fetches bij re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPois, routeGeometry, geometryKey]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!wizardRef.current || isTyping) return;

      // korte "google maps openen"-zinnen openen Google Maps direct
      const plain = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N} ]/gu, "")
        .trim();
      if (plain.includes("google maps") && navCoords && plain.split(/\s+/).length <= 5) {
        setMessages((prev) => [
          ...prev,
          { id: uid("user"), role: "user", content: text },
          {
            id: uid("bot"),
            role: "assistant",
            content: "Geopend in Google Maps — goede rit! ",
          },
        ]);
        trackEvent("Navigatie geopend", { provider: "google_maps", vehicle });
        window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // het gebruikersbericht komt hier exact één keer in de chat
      setMessages((prev) => [
        ...prev,
        { id: uid("user"), role: "user", content: text },
      ]);

      setIsTyping(true);
      try {
        const newMessages = await wizardRef.current.processInput(text);
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages]);
        }

        const context = wizardRef.current.getContext();
        if (context.state === "building") {
          // freemium: daglimiet naar laag (Basis 3 / Supporter 10 / Pro ∞)
          if (!canUse("aiRoutes", usage, proState)) {
            const limit = TIER_LIMITS[tierOf(proState)].aiRoutes;
            setMessages((prev) => [
              ...prev,
              {
                id: uid("bot"),
                role: "assistant",
                content: `**Daglimiet bereikt** — in deze laag zijn dat ${limit} AI-routes per dag. Met **Supporter** (€2,99/maand) krijg je er 10, met **Apex Pro** onbeperkt. Je punten blijven staan; kies een plan en zeg daarna opnieuw "bouw de route".`,
              },
            ]);
            trackEvent("Prijsdialoog geopend", {
              source: "ai_limit",
              tier: tierOf(proState),
            });
            setShowPro(true);
            return;
          }
          const routeMessages = await wizardRef.current.buildRoute();
          if (routeMessages.length > 0) {
            setMessages((prev) => [...prev, ...routeMessages]);
          }
          const newContext = wizardRef.current.getContext();
          setWaypoints(newContext.waypoints);
          setVehicle(newContext.vehicle);
          if (newContext.route) {
            setRoute(newContext.route);
            setRouteGeometry(newContext.route.geometry);
            setImportedRoute(false);
            trackEvent("Route berekend", {
              vehicle: newContext.vehicle,
              estimated: newContext.route.engine === "manual",
              waypoint_count: Math.min(newContext.waypoints.length, 25),
            });
            setNavAnchors([]);
            if (tierOf(proState) !== "pro") setUsage(recordUse("aiRoutes"));
          }
        }
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, navCoords, googleMapsUrl, usage, proState, vehicle]
  );

  const handleQuickReply = useCallback(
    (reply: string) => {
      // "In Google Maps openen" opent echt Google Maps i.p.v. een hint geven
      const plain = reply
        .toLowerCase()
        .replace(/[^\p{L}\p{N} ]/gu, "")
        .trim();
      if (plain.includes("google maps") && navCoords) {
        window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
        return;
      }
      handleSendMessage(reply);
    },
    [navCoords, googleMapsUrl, handleSendMessage]
  );

  const handleMapClick = useCallback(
    async (coords: { lat: number; lng: number }) => {
      if (waypoints.length >= MAX_WAYPOINTS) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content: `Maximaal ${MAX_WAYPOINTS} punten per route. Verwijder eerst een punt of start een nieuwe route.`,
          },
        ]);
        return;
      }
      const name = (await reverseGeocode(coords)) || "Nieuw punt";

      // dubbelklik of trillende vinger op dezelfde plek? dan geen tweede punt
      const TOO_CLOSE_KM = 0.03; // ~30 m
      if (
        waypoints.some(
          (w) => haversineKm(w.coordinates, coords) < TOO_CLOSE_KM
        )
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content:
              "Dit punt staat er al (binnen 30 m van een bestaand punt). Versleep het bestaande punt als je het verlegt wil.",
          },
        ]);
        return;
      }

      // Bij een geïmporteerde track zou een losse klik de hele track
      // vervangen door een 2-punts-snelroute. In plaats daarvan zetten we de
      // track om naar zijn ankers als bewerkbare punten en voegen daar de
      // klik toe als extra stop.
      let base: Waypoint[] = waypoints;
      let converted = false;
      if (importedRoute && navAnchors.length >= 2) {
        base = navAnchors.map((c, i) => ({
          id: uid("wp"),
          name:
            i === 0
              ? waypoints[0]?.name ?? "Start"
              : i === navAnchors.length - 1
                ? waypoints[waypoints.length - 1]?.name ?? "Einde"
                : `Anker ${i}`,
          coordinates: c,
        }));
        converted = true;
      }

      const newWaypoint: Waypoint = {
        id: uid("wp"),
        name,
        coordinates: coords,
      };
      const next = [...base, newWaypoint];
      if (converted) {
        setImportedRoute(false);
        setNavAnchors([]);
      }
      setWaypoints(next);
      computeFromWaypoints(next, vehicle, avoidHighways);
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: converted
            ? `**${name}** toegevoegd als extra stop. De geïmporteerde track is omgezet naar ${next.length} bewerkbare punten (de ankers) — versleep of verwijder ze naar wens via de puntenlijst.`
            : `**${name}** toegevoegd aan je route!${
                next.length >= 2
                  ? " Route wordt automatisch berekend over de echte wegen."
                  : " Voeg er nog een punt aan toe voor een route."
              }`,
        },
      ]);
    },
    [waypoints, vehicle, avoidHighways, importedRoute, navAnchors, computeFromWaypoints]
  );

  const handleWaypointDrag = useCallback(
    (waypoint: Waypoint, coords: { lat: number; lng: number }) => {
      // Verslepen van start/einde van een geïmporteerde track: zet de track
      // eerst om naar ankerpunten, anders vervalt de hele track naar een
      // rechtstreekse verbinding tussen de twee eindpunten.
      if (importedRoute && navAnchors.length >= 2) {
        const idx = waypoints.findIndex((w) => w.id === waypoint.id);
        const base: Waypoint[] = navAnchors.map((c, i) => ({
          id: uid("wp"),
          name: i === 0 ? "Start" : i === navAnchors.length - 1 ? "Einde" : `Anker ${i}`,
          coordinates: c,
        }));
        const target = idx <= 0 ? 0 : base.length - 1;
        base[target] = { ...base[target], coordinates: coords };
        setImportedRoute(false);
        setNavAnchors([]);
        setWaypoints(base);
        computeFromWaypoints(base, vehicle, avoidHighways);
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content: `Punt verplaatst. De geïmporteerde track is omgezet naar ${base.length} bewerkbare punten zodat je bewerkingen behouden blijven.`,
          },
        ]);
        return;
      }
      const next = waypoints.map((wp) =>
        wp.id === waypoint.id ? { ...wp, coordinates: coords } : wp
      );
      setWaypoints(next);
      computeFromWaypoints(next, vehicle, avoidHighways);
    },
    [waypoints, vehicle, avoidHighways, importedRoute, navAnchors, computeFromWaypoints]
  );

  const handleRemoveWaypoint = useCallback(
    (id: string) => {
      const next = waypoints.filter((wp) => wp.id !== id);
      setWaypoints(next);
      computeFromWaypoints(next, vehicle, avoidHighways);
    },
    [waypoints, vehicle, avoidHighways, computeFromWaypoints]
  );

  const handleUndoWaypoint = useCallback(() => {
    const next = waypoints.slice(0, -1);
    setWaypoints(next);
    computeFromWaypoints(next, vehicle, avoidHighways);
  }, [waypoints, vehicle, avoidHighways, computeFromWaypoints]);

  const handleRecalculateRoute = useCallback(async () => {
    if (waypoints.length < 2) return;
    await computeFromWaypoints(waypoints, vehicle, avoidHighways);
  }, [waypoints, vehicle, avoidHighways, computeFromWaypoints]);

  /** Route omkeren: laatste punt wordt het startpunt. */
  const handleReverseRoute = useCallback(() => {
    if (waypoints.length < 2) return;
    const next = [...waypoints].reverse();
    setWaypoints(next);
    setOrderBeforeOptimize(null);
    computeFromWaypoints(next, vehicle, avoidHighways);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("bot"),
        role: "assistant",
        content: "↔Route omgekeerd — je rijdt 'm nu vanaf het andere eindpunt.",
      },
    ]);
  }, [waypoints, vehicle, avoidHighways, computeFromWaypoints]);

  /** Lus sluiten: het startpunt wordt ook het eindpunt (rondrit). */
  /** Rekent stilletjes een alternatieve variant (snelweg-voorkeur omgedraaid). */
  const compareVariants = useCallback(async () => {
    if (waypoints.length < 2) return;
    if (vehicle !== "car" && vehicle !== "motorcycle") return;
    setVariantLoading(true);
    try {
      const alt = await calculateRoute(
        waypoints.map((w) => w.coordinates),
        { vehicleType: vehicle, avoidHighways: !avoidHighways }
      );
      setVariantB({
        km: (alt.distance ?? 0) / 1000,
        avoid: !avoidHighways,
        estimated: Boolean(alt.estimated),
      });
    } catch {
      setVariantB(null);
    } finally {
      setVariantLoading(false);
    }
  }, [waypoints, vehicle, avoidHighways]);

  const applyVariantB = useCallback(() => {
    if (!variantB) return;
    setAvoidHighways(variantB.avoid);
    computeFromWaypoints(waypoints, vehicle, variantB.avoid);
    setVariantB(null);
  }, [variantB, waypoints, vehicle, computeFromWaypoints]);

  /** Rendert de route als social-card (1200x630, STARTGRID-stijl) en downloadt 'm. */
  const shareImage = useCallback(() => {
    if (!routeGeometry || typeof document === "undefined") return;
    const canvas = document.createElement("canvas");
    const pixelScale = tierOf(proState) === "pro" ? 2 : 1;
    canvas.width = 1200 * pixelScale;
    canvas.height = 630 * pixelScale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(pixelScale, pixelScale);

    ctx.fillStyle = "#050507";
    ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 630);
      ctx.stroke();
    }
    for (let y = 0; y <= 630; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    const pts = lineStringToCanvasPoints(
      routeGeometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] })),
      1200,
      630,
      110
    );
    if (pts.length > 1) {
      ctx.strokeStyle = "#ffe600";
      ctx.lineWidth = 5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(255,230,0,0.45)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      pts.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
      ctx.stroke();
      ctx.shadowBlur = 0;
      const first = pts[0];
      const last = pts[pts.length - 1];
      ctx.fillStyle = "#050507";
      ctx.beginPath();
      ctx.arc(first.x, first.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffe600";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(first.x, first.y, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffe600";
      ctx.beginPath();
      ctx.arc(last.x, last.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px system-ui, -apple-system, sans-serif";
    ctx.fillText((route?.name ?? "Apex-route").slice(0, 40), 90, 120);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "24px ui-monospace, SFMono-Regular, monospace";
    const km = route?.distance
      ? `${(route.distance / 1000).toFixed(1).replace(".", ",")} km`
      : "";
    const kronkel = route?.windingScore ?? 0;
    ctx.fillText(
      `${km}${kronkel > 0 ? ` · ${Math.round(kronkel)}°/km` : ""} · ${waypoints.length} punten`,
      90,
      165
    );
    ctx.fillStyle = "#ffe600";
    ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
    ctx.fillText("APEX ROUTES · routes.apexclusive.nl", 90, 560);
    if (tierOf(proState) === "free") {
      ctx.fillStyle = "#64748b";
      ctx.font = "20px system-ui, -apple-system, sans-serif";
      ctx.fillText("Gemaakt met de gratis laag — Supporters delen zonder deze regel", 90, 596);
    } else {
      ctx.fillStyle = "#050507";
      ctx.strokeStyle = "#ffe600";
      ctx.lineWidth = 2;
      ctx.fillRect(1090, 540, 66, 34);
      ctx.strokeRect(1090, 540, 66, 34);
      ctx.fillStyle = "#ffe600";
      ctx.font = "bold 20px ui-monospace, monospace";
      ctx.fillText("PRO", 1101, 564);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(route?.name ?? "apex-route").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackEvent("Route geëxporteerd", {
        format: "png",
        vehicle,
        imported: importedRoute,
        high_resolution: pixelScale === 2,
      });
    }, "image/png");
  }, [routeGeometry, route, waypoints.length, proState, vehicle, importedRoute]);

  /** Rondrit-generator: lus van ongeveer X km vanaf het eerste punt. */
  const handleGenerateLoop = useCallback(
    (km: number) => {
      const start = waypoints[0];
      setShowLoopGen(false);
      if (!start) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content:
              "Zet eerst een startpunt — klik op de kaart of noem een plaats in de chat, en draai daarna opnieuw.",
          },
        ]);
        return;
      }
      const wps = generateLoopWaypoints(start.coordinates, km, Date.now(), start.name);
      setWaypoints(wps);
      computeFromWaypoints(wps, vehicle, avoidHighways);
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: `**Rondrit gegenereerd** — ongeveer ${km} km vanaf **${start.name}**, ${wps.length} ankers en de lus is al gesloten. Sleep punten op de kaart om bij te schaven, of draai opnieuw voor een andere variant.`,
        },
      ]);
    },
    [waypoints, vehicle, avoidHighways, computeFromWaypoints]
  );

  const handleCloseLoop = useCallback(() => {
    if (waypoints.length < 2) return;
    const first = waypoints[0];
    if (
      waypoints[waypoints.length - 1].coordinates.lat === first.coordinates.lat &&
      waypoints[waypoints.length - 1].coordinates.lng === first.coordinates.lng
    ) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: "Dit is al een rondrit — het eindpunt valt samen met het startpunt.",
        },
      ]);
      return;
    }
    const next: Waypoint[] = [
      ...waypoints,
      { ...first, id: uid("wp"), name: `${first.name} (einde)` },
    ];
    if (next.length > MAX_WAYPOINTS) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: `Maximaal ${MAX_WAYPOINTS} punten per route — verwijder eerst een punt.`,
        },
      ]);
      return;
    }
    setWaypoints(next);
    computeFromWaypoints(next, vehicle, avoidHighways);
    setMessages((prev) => [
      ...prev,
      {
        id: uid("bot"),
        role: "assistant",
        content: "Lus gesloten — de route keert nu terug naar het startpunt.",
      },
    ]);
  }, [waypoints, vehicle, avoidHighways, computeFromWaypoints]);

  const handleVehicleChange = useCallback(
    (veh: VehicleType) => {
      setVehicle(veh);
      if (waypoints.length >= 2) computeFromWaypoints(waypoints, veh, avoidHighways);
    },
    [waypoints, avoidHighways, computeFromWaypoints]
  );

  const handleAvoidHighwaysChange = useCallback(
    (avoid: boolean) => {
      setAvoidHighways(avoid);
      if (waypoints.length >= 2) computeFromWaypoints(waypoints, vehicle, avoid);
    },
    [waypoints, vehicle, computeFromWaypoints]
  );

  const handleImportFile = useCallback(
    async (file: File) => {
      const format = file.name.split(".").pop()?.toLowerCase().slice(0, 10) || "onbekend";
      if (file.size > MAX_IMPORT_BYTES) {
        trackEvent("Route import mislukt", { format, reason: "too_large" });
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content: "Dit routebestand is groter dan 15 MB. Verklein of vereenvoudig de track en probeer opnieuw.",
          },
        ]);
        return;
      }
      // FIT is binair: eigen decoder; tekstformaten via parseRouteFile
      let coords: Coordinates[] | null = null;
      if (file.name.toLowerCase().endsWith(".fit")) {
        coords = parseFIT(await file.arrayBuffer());
      } else {
        coords = parseRouteFile(await file.text());
      }
      if (!coords || coords.length < 2) {
        trackEvent("Route import mislukt", { format });
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content:
              "Ik kon geen route vinden in dit bestand. Ondersteund: GPX, KML, TCX, GeoJSON en FIT (Garmin).",
          },
        ]);
        return;
      }

      setIsCalculating(true);
      try {
        // 1) track op het echte wegenraster leggen (map matching)
        const matched = await matchTrackToRoads(coords, vehicle);
        const geometry = matched?.geometry;

        // 2) slimme navigatie-ankers: op de weg, bij de echte afslagen
        const anchors = geometry
          ? selectNavigationAnchors(geometry, 9).map((a) => a.coordinates)
          : [];

        // 3) Nederlandse routebeschrijving (afslagen links/rechts)
        const turns = matched ? buildTurnByTurn(matched) : [];

        const startName = nearestKnownPlaceName(coords[0]);
        const endName = nearestKnownPlaceName(coords[coords.length - 1]);
        const wpStart: Waypoint = {
          id: uid("wp"),
          name: `Start · ${startName}`,
          coordinates: coords[0],
        };
        const wpEnd: Waypoint = {
          id: uid("wp"),
          name: `Einde · ${endName}`,
          coordinates: coords[coords.length - 1],
        };

        const newRoute: Route = {
          id: uid("route"),
          name: file.name.replace(/\.[^.]+$/, "") || "Geïmporteerde route",
          waypoints: [wpStart, wpEnd],
          geometry,
          distance: matched?.distance,
          duration: matched?.duration,
          turns: turns.length > 0 ? turns : undefined,
          windingScore: geometry ? calculateWindingScore(geometry) : undefined,
          engine: matched
            ? matched.matched
              ? "osrm-match"
              : matched.estimated
                ? "manual"
                : "osrm"
            : "manual",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setWaypoints([wpStart, wpEnd]);
        setRoute(newRoute);
        setRouteGeometry(geometry);
        setImportedRoute(true);
        setNavAnchors(anchors);
        // meteen tonen wat de rijder het meest interesseert: de afslagen
        setShowTurns(turns.length > 0);
        setOrderBeforeOptimize(null);
        routeNameRef.current = newRoute.name;
        trackEvent("Route geïmporteerd", {
          format,
          matched: Boolean(matched?.matched),
          preserved: Boolean(matched?.preserved),
          has_turns: turns.length > 0,
        });

        const matchLabel = matched?.matched
          ? "op het wegenraster gelegd (map matching)"
          : matched?.preserved
            ? "oorspronkelijke trackvorm behouden; tijd is een schatting"
            : matched
              ? "via voertuig-specifieke routepunten herberekend"
              : "track ingelezen zonder herberekening";
        const mapsNote = anchors.length > 0
          ? `Google Maps krijgt ${anchors.length} route-ankers en kan het wegverloop zelf herberekenen.`
          : "Voor deze track zijn geen betrouwbare Google Maps-ankers beschikbaar.";
        const gpxNote = turns.length > 0
          ? "De GPX-download bevat de routelijn en de beschikbare afslagpunten."
          : "De GPX-download behoudt de routelijn, maar bevat voor deze import geen afslagpunten.";

        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content: `**${file.name} geïmporteerd!**\n\n${
              matched ? formatDistance(matched.distance) : "Afstand onbekend"
            } · **${turns.length} afslagen** · ${matchLabel}.\n\n${mapsNote} ${gpxNote} Navigatie-apps kunnen een GPX anders interpreteren; controleer de route vóór vertrek.`,
          },
        ]);
      } finally {
        setIsCalculating(false);
      }
    },
    [vehicle]
  );

  const handleDownloadGPX = useCallback(() => {
    if (!route && waypoints.length === 0) return;
    // freemium: export-daglimiet naar laag (Basis 5 / Supporter 15 / Pro ∞)
    if (!canUse("exports", usage, proState)) {
      const limit = TIER_LIMITS[tierOf(proState)].exports;
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: `**GPX-limiet bereikt** — in deze laag zijn dat ${limit} GPX-downloads per dag. Supporter geeft er 15; Pro maakt GPX-downloads onbeperkt. Je route blijft bewaard terwijl je kiest.`,
        },
      ]);
      trackEvent("Prijsdialoog geopend", {
        source: "export_limit",
        tier: tierOf(proState),
      });
      setShowPro(true);
      return;
    }
    downloadGPX(route?.name || "Route", waypoints, routeGeometry, route?.turns);
    trackEvent("Route geëxporteerd", {
      format: "gpx",
      vehicle,
      imported: importedRoute,
    });
    if (tierOf(proState) !== "pro") setUsage(recordUse("exports"));
  }, [route, waypoints, routeGeometry, usage, proState, vehicle, importedRoute]);

  /** Route Roulette in de chat: het lot kiest, de wizard bouwt. */
  const handleRoulette = useCallback(() => {
    const kmTarget = 60 + Math.floor(Math.random() * 17) * 10; // 60–220 km
    const r = spinRoulette({ vehicle: vehicle as RouletteVehicle, kmTarget });
    void handleSendMessage(`${r.rideName}! ${r.prompt}`);
  }, [vehicle, handleSendMessage]);

  /** Prompt die op de landing is gedraaid (Route Roulette) meteen uitvoeren. */
  useEffect(() => {
    const run = () => {
      const p = consumePendingPrompt();
      if (p) void handleSendMessage(p);
    };
    // kleine vertraging: de wizard moet eerst zijn openingsbericht hebben gezet
    const t = window.setTimeout(run, 300);
    window.addEventListener(PENDING_PROMPT_EVENT, run);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(PENDING_PROMPT_EVENT, run);
    };
  }, [handleSendMessage]);

  /** Bestand dat op de landing of via de PWA ("openen met") is gekozen. */
  useEffect(() => {
    const importPending = () => {
      const p = consumePendingRouteFile();
      if (!p) return;
      void handleImportFile(p.file);
    };
    importPending();
    window.addEventListener(PENDING_ROUTE_EVENT, importPending);
    return () => window.removeEventListener(PENDING_ROUTE_EVENT, importPending);
  }, [handleImportFile]);

  /* ---------- demo-rit: virtueel proefrijden met afslagbanners ---------- */
  const [demoRide, setDemoRide] = useState<{
    routeId: string;
    playing: boolean;
    speed: number;
    dist: number;
    muted: boolean;
  } | null>(null);
  const spokenTurnRef = useRef(-1);

  const rideCoords = useMemo<LatLon[]>(
    () => (routeGeometry?.coordinates ?? []).map((c) => [c[1], c[0]] as LatLon),
    [routeGeometry]
  );
  const rideCum = useMemo(() => cumulativeDistances(rideCoords), [rideCoords]);
  const rideTotal = totalDistanceM(rideCum);

  // de rit laten rijden: afstand loopt op met de frame-tijd
  useEffect(() => {
    if (!demoRide?.playing || rideCoords.length < 2) return;
    let raf = 0;
    let last = performance.now();
    const baseMps = rideSpeedMps(vehicle);
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setDemoRide((r) => {
        if (!r?.playing) return r;
        const dist = r.dist + baseMps * r.speed * dt;
        if (dist >= rideTotal) {
          return { ...r, dist: rideTotal, playing: false };
        }
        return { ...r, dist };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [demoRide?.playing, demoRide?.speed, rideCoords, rideTotal, vehicle]);

  // aankondiging van de eerstvolgende afslag (banner + optioneel stem)
  const upcomingTurn = (() => {
    if (!demoRide || !route?.turns?.length) return null;
    return nextTurnAfter(route.turns, demoRide.dist);
  })();

  useEffect(() => {
    if (!demoRide || !upcomingTurn || !route?.turns) return;
    if (upcomingTurn.aheadM > 230) return;
    const idx = route.turns.indexOf(upcomingTurn.turn);
    if (spokenTurnRef.current === idx) return;
    spokenTurnRef.current = idx;
    if (!demoRide.muted && typeof speechSynthesis !== "undefined") {
      try {
        const u = new SpeechSynthesisUtterance(upcomingTurn.turn.instruction);
        u.lang = "nl-NL";
        u.rate = 1.05;
        speechSynthesis.cancel();
        speechSynthesis.speak(u);
      } catch {
        // speech niet beschikbaar — de banner is er ook nog
      }
    }
  }, [demoRide, upcomingTurn, route]);

  // nieuwe/andere route? demo-rit netjes stoppen
  useEffect(() => {
    if (!demoRide) return;
    if (route?.id !== demoRide.routeId) {
      const r = requestAnimationFrame(() => setDemoRide(null));
      return () => cancelAnimationFrame(r);
    }
  }, [demoRide, route?.id]);

  const startDemoRide = useCallback(() => {
    if (!route) return;
    spokenTurnRef.current = -1;
    try {
      speechSynthesis?.cancel?.();
    } catch {
      // geen speech op dit apparaat
    }
    setDemoRide({ routeId: route.id, playing: true, speed: 1, dist: 0, muted: false });
  }, [route]);

  const ridePos = demoRide
    ? positionAtDistance(rideCoords, rideCum, demoRide.dist)
    : null;

  /* ---------- drag & drop: routebestand overal op de pagina loslaten ---------- */
  const [dropActive, setDropActive] = useState(false);
  const dragDepthRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    setDropActive(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    // gedrag toestaan zodat de drop mag plaatsvinden
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback(() => {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDropActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepthRef.current = 0;
      setDropActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      if (!isRouteFileName(file.name)) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid("bot"),
            role: "assistant",
            content: `*${file.name}* is geen routebestand. Ondersteund: ${ROUTE_FILE_EXTENSIONS.join(", ")}.`,
          },
        ]);
        return;
      }
      void handleImportFile(file);
    },
    [handleImportFile]
  );

  const handleOpenWaze = useCallback(() => {
    if (waypoints.length === 0) return;
    const dest = waypoints[waypoints.length - 1].coordinates;
    trackEvent("Navigatie geopend", { provider: "waze", vehicle });
    window.open(getWazeUrl(dest), "_blank", "noopener,noreferrer");
  }, [waypoints, vehicle]);

  /** Printen: de afslagenlijst moet uitgeklapt zijn, anders staat 'ie niet in de DOM. */
  const handlePrint = useCallback(() => {
    trackEvent("Route geëxporteerd", { format: "print_pdf", vehicle });
    setShowTurns(true);
    // één frame wachten zodat de lijst gerenderd is voor de printdialoog opent
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
  }, [vehicle]);

  /* ---------- volgorde optimaliseren ---------- */
  const handleOptimizeOrder = useCallback(() => {
    if (waypoints.length < MIN_OPTIMIZE_POINTS) return;

    const result = optimizeWaypointOrder(waypoints.map((w) => w.coordinates));
    if (!result.improved) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content:
            "De volgorde is al zo goed als het wordt — herschikken maakt de route niet korter.",
        },
      ]);
      return;
    }

    const reordered = result.order.map((i) => waypoints[i]);
    setOrderBeforeOptimize(waypoints);
    setWaypoints(reordered);
    computeFromWaypoints(reordered, vehicle, avoidHighways);

    const savedKm = result.before - result.after;
    setMessages((prev) => [
      ...prev,
      {
        id: uid("bot"),
        role: "assistant",
        content: `**Volgorde geoptimaliseerd** — ongeveer ${savedKm
          .toFixed(0)
          .replace(".", ",")} km korter (hemelsbreed ${result.before.toFixed(
          0
        )} → ${result.after.toFixed(
          0
        )} km). Start en eindpunt zijn blijven staan. Niet tevreden? Klik op *Volgorde terug* in de puntenlijst.`,
      },
    ]);
  }, [waypoints, vehicle, avoidHighways, computeFromWaypoints]);

  const handleUndoOptimize = useCallback(() => {
    if (!orderBeforeOptimize) return;
    setWaypoints(orderBeforeOptimize);
    computeFromWaypoints(orderBeforeOptimize, vehicle, avoidHighways);
    setOrderBeforeOptimize(null);
  }, [orderBeforeOptimize, vehicle, avoidHighways, computeFromWaypoints]);

  /* ---------- opslaan, laden en delen ---------- */
  const handleSaveRoute = useCallback(() => {
    if (!route) return;
    const name = saveName.trim() || route.name || "Route zonder naam";
    const stored = toStoredRoute(
      { ...route, name, waypoints },
      { vehicle, imported: importedRoute, navAnchors }
    );
    // badges vergelijken vóór/na — nieuwe badge = confetti + melding
    const before = unlockedIds(computeGarageStats(savedRoutes));
    const next = saveRoute(stored);
    const fresh = newlyUnlocked(before, unlockedIds(computeGarageStats(next)));
    setSavedRoutes(next);
    routeNameRef.current = name;
    setRoute((r) => (r ? { ...r, name } : r));
    setSaveName("");
    setMessages((prev) => [
      ...prev,
      {
        id: uid("bot"),
        role: "assistant",
        content: `**${name}** opgeslagen in deze browser. Je vindt 'm terug onder *Mijn routes*.`,
      },
    ]);
    trackEvent("Route opgeslagen", {
      vehicle,
      imported: importedRoute,
      badge_unlocked: fresh.length > 0,
    });
    if (fresh.length > 0) {
      fireConfetti();
      const earned = BADGES.filter((b) => fresh.includes(b.id));
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: `**Badge verdiend:** ${earned
            .map((b) => b.name)
            .join(" · ")} — check je Garage!`,
        },
      ]);
    }
  }, [route, waypoints, vehicle, importedRoute, navAnchors, saveName, savedRoutes]);

  const handleLoadRoute = useCallback((stored: StoredRoute) => {
    const loaded = fromStoredRoute(stored);
    setWaypoints(loaded.waypoints);
    setRoute(loaded.route);
    setRouteGeometry(loaded.route.geometry);
    setVehicle(loaded.vehicle);
    setImportedRoute(loaded.imported);
    setNavAnchors(loaded.navAnchors);
    setShowTurns(false);
    setShowSaved(false);
    setOrderBeforeOptimize(null);
    routeNameRef.current = loaded.route.name;
    setMessages((prev) => [
      ...prev,
      {
        id: uid("bot"),
        role: "assistant",
        content: `**${loaded.route.name}** geladen — ${loaded.waypoints.length} punten.`,
      },
    ]);
  }, []);

  const handleDeleteSavedRoute = useCallback((id: string) => {
    setSavedRoutes(deleteSavedRoute(id));
  }, []);

  const handleShareRoute = useCallback(async () => {
    if (!route || waypoints.length < 2) return;
    const { hash, geometryIncluded } = encodeRoute({
      name: route.name,
      vehicle,
      waypoints: waypoints.map((w) => ({ name: w.name, coordinates: w.coordinates })),
      geometry: routeGeometry,
      imported: importedRoute,
    });
    const url = buildShareUrl(window.location.origin, window.location.pathname, hash);

    // de link ook in de adresbalk zetten: refresh en bladwijzer houden de route
    // (replaceState vuurt geen hashchange, dus de route wordt niet dubbel geladen)
    window.history.replaceState(null, "", `#r=${hash}`);

    try {
      await navigator.clipboard.writeText(url);
      setShareState(geometryIncluded ? "copied" : "partial");
      trackEvent("Route gedeeld", { method: "clipboard", geometry: geometryIncluded });
    } catch {
      // clipboard geweigerd (geen https of geen toestemming) → link in de chat
      setShareState("failed");
      trackEvent("Route gedeeld", { method: "fallback", geometry: geometryIncluded });
      setMessages((prev) => [
        ...prev,
        {
          id: uid("bot"),
          role: "assistant",
          content: `**Deel-link** (kopiëren lukte niet automatisch):\n\n${url}`,
        },
      ]);
    }
    window.setTimeout(() => setShareState("idle"), 2500);
  }, [route, waypoints, vehicle, routeGeometry, importedRoute]);

  const handleNewRoute = useCallback(() => {
    setWaypoints([]);
    setRoute(null);
    setRouteGeometry(undefined);
    setShowEmbed(false);
    setShowSettings(false);
    setImportedRoute(false);
    setNavAnchors([]);
    setShowTurns(false);
    setOrderBeforeOptimize(null);
    routeNameRef.current = `Route ${new Date().toLocaleDateString("nl-NL")}`;
    // deel-link uit de URL halen, anders keert de route terug na een refresh
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (wizardRef.current) {
      wizardRef.current.reset();
      setMessages(wizardRef.current.getMessages());
    }
  }, []);

  const winding = routeGeometry && routeGeometry.coordinates.length > 2
    ? calculateWindingScore(routeGeometry)
    : 0;
  const windingInfo = windingLabel(winding);

  return (
    <div
      className="apex-shell h-dvh w-full flex flex-col bg-[#050507] text-white overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* drag & drop-overlay */}
      {dropActive && (
        <div className="fixed inset-0 z-[900] bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-none print:hidden">
          <div className="glass border-2 border-dashed border-yellow-400 rounded px-10 py-8 text-center">
            <FileUp className="w-10 h-10 mx-auto mb-3 text-yellow-400" aria-hidden />
            <p className="font-display font-bold text-xl">Laat je route vallen</p>
            <p className="text-sm text-slate-400 mt-1">
              GPX · KML · TCX · GeoJSON — wij leggen hem op de echte wegen
            </p>
          </div>
        </div>
      )}
      {/* header */}
      <header className="flex-shrink-0 flex items-center gap-2 sm:gap-3 glass border-b border-white/10 px-3 sm:px-4 py-2.5 z-30 print:hidden">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div className="leading-none">
            <h1 className="font-display font-bold text-base tracking-tight">
              Apex Routes
            </h1>
            <p className="text-[11px] text-slate-400">AI Route Planner</p>
          </div>
        </div>

        <div className="flex-1" />

        <select
          value={vehicle}
          onChange={(e) => handleVehicleChange(e.target.value as VehicleType)}
          aria-label="Vervoermiddel"
          className="hidden sm:block bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60"
        >
          {VEHICLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-slate-900">
              {o.label}
            </option>
          ))}
        </select>

        <input
          ref={fileInputRef}
          type="file"
          accept={ROUTE_FILE_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          data-track="Route import gestart"
          data-track-source="planner_toolbar"
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="GPX / KML / GeoJSON importeren"
          aria-label="Routebestand importeren"
        >
          <Upload className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowGarage(true)}
          className="relative p-2 hover:bg-white/10 rounded transition-colors"
          title="De Garage — statistieken & badges"
          aria-label="Garage openen"
        >
          <Trophy className="w-5 h-5" />
          {(() => {
            const n = unlockedIds(computeGarageStats(savedRoutes)).length;
            return n > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-[9px] font-bold min-w-[15px] h-[15px] rounded flex items-center justify-center px-0.5">
                {n}
              </span>
            ) : null;
          })()}
        </button>
        <button
          onClick={() => setShowPro(true)}
          data-track="Prijsdialoog geopend"
          data-track-source="planner_toolbar"
          className={`relative p-2 rounded transition-colors ${
            proState.active ? "pro-chip" : "hover:bg-white/10"
          }`}
          title={
            proState.active
              ? `${tierOf(proState) === "supporter" ? "Supporter" : "Pro"} is actief`
              : "Apex-lidmaatschap bekijken"
          }
          aria-label="Apex-lidmaatschap"
        >
          <Crown className={`w-5 h-5 ${proState.active ? "text-yellow-300" : ""}`} />
          {trialDaysLeft(proState) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-black text-[9px] font-bold px-1 rounded">
              {trialDaysLeft(proState)}d
            </span>
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => {
              setShowSaved((v) => !v);
              setSaveName(route?.name ?? "");
            }}
            className={`p-2 rounded transition-colors ${
              showSaved ? "bg-white/10" : "hover:bg-white/10"
            }`}
            title="Mijn routes"
            aria-label="Mijn routes"
            aria-expanded={showSaved}
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {showSaved && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowSaved(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-12 w-72 glass rounded p-4 z-40"
                >
                  <p className="eyebrow mb-2">{P.myRoutes}</p>

                  {route ? (
                    <div className="flex gap-2 mb-3">
                      <input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRoute();
                        }}
                        placeholder={P.savePlaceholder}
                        aria-label="Naam van deze route"
                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-sm outline-none focus:border-yellow-500/60"
                      />
                      <button
                        onClick={handleSaveRoute}
                        className="btn-brand px-3 rounded text-sm font-semibold shrink-0"
                      >
                        {P.save}
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 mb-3">
                      Maak eerst een route om er een te bewaren.
                    </p>
                  )}

                  {savedRoutes.length === 0 ? (
                    <p className="text-[11px] text-slate-500">
                      Nog niets opgeslagen. Routes blijven in deze browser — geen
                      account, geen server.
                    </p>
                  ) : (
                    <ul className="max-h-56 overflow-y-auto -mx-1">
                      {savedRoutes.map((r) => (
                        <li key={r.id} className="flex items-center gap-1 px-1">
                          <button
                            onClick={() => handleLoadRoute(r)}
                            className="flex-1 min-w-0 text-left px-2 py-2 rounded hover:bg-white/10 transition-colors"
                          >
                            <span className="block truncate text-sm text-slate-200">
                              {r.name}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-mono">
                              {r.distance ? formatDistance(r.distance) : `${r.waypoints.length} punten`}
                              {" · "}
                              {new Date(r.savedAt).toLocaleDateString("nl-NL")}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteSavedRoute(r.id)}
                            title={`${r.name} verwijderen`}
                            aria-label={`${r.name} verwijderen`}
                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleNewRoute}
          className="p-2 hover:bg-white/10 rounded transition-colors"
          title="Nieuwe route"
          aria-label="Nieuwe route"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`p-2 rounded transition-colors ${
              showSettings ? "bg-white/10" : "hover:bg-white/10"
            }`}
            title="Instellingen"
            aria-label="Instellingen"
            aria-expanded={showSettings}
          >
            <Settings className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowSettings(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-12 w-64 glass rounded p-4 z-40"
                >
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                  Vervoermiddel
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {VEHICLE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => handleVehicleChange(o.value)}
                      className={`px-2 py-2 rounded text-sm font-medium border transition-colors ${
                        vehicle === o.value
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "border-white/15 text-slate-200 hover:border-white/40"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-sm text-slate-200">Vermijd snelwegen</span>
                  <input
                    type="checkbox"
                    checked={avoidHighways}
                    onChange={(e) => handleAvoidHighwaysChange(e.target.checked)}
                    className="w-5 h-5 accent-yellow-400"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-3">
                  Voorkeuren worden bij de volgende herberekening meegenomen.
                </p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="px-3 py-2 btn-ghost rounded text-sm font-medium flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">{chatOpen ? "Verberg chat" : "Chat"}</span>
        </button>
      </header>

      {/* body: chat sidebar + map */}
      <div className="apex-main flex-1 flex overflow-hidden relative">
        {/* chat sidebar — overlay-drawer op mobiel, kolom op desktop */}
        {chatOpen && !isDesktop && (
          <div
            className="absolute inset-0 z-20 bg-black/50 print:hidden"
            onClick={() => setChatOpen(false)}
            aria-hidden
          />
        )}
        <AnimatePresence initial={false}>
          {chatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: isDesktop
                  ? 380
                  : Math.min(380, Math.round((typeof window !== "undefined" ? window.innerWidth : 380) * 0.92)),
                opacity: 1,
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 bg-[#0e0e11] border-r border-white/10 flex flex-col overflow-hidden print:hidden
                absolute inset-y-0 left-0 z-30 shadow-2xl
                sm:relative sm:z-20 sm:shadow-none"
            >
              <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <h2 className="font-semibold text-sm">Chat met Route Assistent</h2>
                {aiEnabled && (
                  <span
                    className="ml-auto text-[10px] font-bold uppercase tracking-wide text-yellow-300 border border-yellow-400/30 bg-yellow-400/10 rounded px-2 py-0.5"
                    title="OPENAI_API_KEY gevonden — vrije-tekst parsering wordt door AI verrijkt"
                  >
                    <Zap className="w-3 h-3 inline -mt-0.5" aria-hidden /> AI
                  </span>
                )}
              </div>

              <div
                ref={chatContainerRef}
                role="log"
                aria-live="polite"
                aria-label="Gesprek met de route-assistent"
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onQuickReply={handleQuickReply}
                  />
                ))}
                {isTyping && <TypingIndicator />}
              </div>

              {/* freemium-meter: alleen zichtbaar buiten Pro */}
              {tierOf(proState) !== "pro" && (() => {
                const limit = TIER_LIMITS[tierOf(proState)].aiRoutes;
                const used = limit - remainingToday("aiRoutes", usage, proState);
                return (
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-white/5 text-[11px] text-slate-500 bg-slate-900/40">
                    <span>
                      AI vandaag:{" "}
                      <b className="text-slate-300">
                        {used}/{Number.isFinite(limit) ? limit : "∞"}
                      </b>
                      {tierOf(proState) === "supporter" && (
                        <span className="text-yellow-400/80 font-semibold"> · Supporter</span>
                      )}
                    </span>
                    <button
                      onClick={() => setShowPro(true)}
                      className="text-yellow-400/90 hover:text-yellow-300 font-semibold"
                    >
                      Meer met Pro (proef gratis) →
                    </button>
                  </div>
                );
              })()}
              <ChatInput
                onSend={handleSendMessage}
                disabled={isTyping}
                placeholder={SHARED[lang].chatPlaceholder}
                onRoulette={handleRoulette}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* map */}
        <main className="apex-main flex-1 relative">
          <PremiumMap
            waypoints={waypoints}
            routeGeometry={routeGeometry}
            onMapClick={handleMapClick}
            onWaypointDrag={handleWaypointDrag}
            interactive={true}
            mapStyle={mapStyle}
            focusPoint={focusPoint}
            anchors={importedRoute ? navAnchors : undefined}
            pois={showPois ? pois : undefined}
            rideMarker={
              demoRide && ridePos
                ? {
                    lat: ridePos.lat,
                    lng: ridePos.lng,
                    bearing: ridePos.bearing,
                    active: true,
                  }
                : null
            }
            className="absolute inset-0 print:hidden"
          />

          {/* demo-rit: afslagbanner bovenin */}
          {demoRide && upcomingTurn && (
            <div className="absolute bottom-32 sm:bottom-36 md:bottom-auto md:top-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md print:hidden">
              <div className="glass rounded border border-yellow-400/40 px-4 py-3 flex items-center gap-3 shadow-xl shadow-black/50 demo-banner">
                <TurnIcon
                  type={upcomingTurn.turn.type}
                  modifier={upcomingTurn.turn.modifier}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-yellow-400 font-bold">
                    {upcomingTurn.aheadM < 60
                      ? "Nu"
                      : `Over ${formatDistance(upcomingTurn.aheadM)}`}
                  </p>
                  <p className="text-[14px] font-medium truncate">
                    {upcomingTurn.turn.instruction}
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">
                  {Math.round((demoRide.dist / Math.max(1, rideTotal)) * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* demo-rit: bediening onderin */}
          {route && !demoRide && (
            <button
              onClick={startDemoRide}
              className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 btn-brand btn-shine flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm shadow-xl shadow-black/50 print:hidden"
              title="Rij de route virtueel vooraf — met afslagen en stem"
            >
              <Play className="w-4 h-4" />
              Demo-rit
            </button>
          )}
          {demoRide && (
            <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 glass rounded border border-white/15 px-3 py-2 flex items-center gap-1.5 shadow-xl shadow-black/50 print:hidden">
              <button
                onClick={() =>
                  setDemoRide((r) => (r ? { ...r, playing: !r.playing } : r))
                }
                className="btn-brand w-10 h-10 rounded flex items-center justify-center"
                aria-label={demoRide.playing ? "Pauzeren" : "Verder"}
              >
                {demoRide.playing ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <div className="flex items-center gap-1 px-1" role="group" aria-label="Snelheid">
                <Gauge className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDemoRide((r) => (r ? { ...r, speed: s } : r))}
                    className={`px-2 py-1 rounded text-[12px] font-bold transition-colors ${
                      demoRide.speed === s
                        ? "bg-yellow-400 text-black"
                        : "text-slate-400 hover:bg-white/10"
                    }`}
                    aria-pressed={demoRide.speed === s}
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setDemoRide((r) => (r ? { ...r, muted: !r.muted } : r))
                }
                className="p-2 hover:bg-white/10 rounded"
                aria-label={demoRide.muted ? "Stem aan" : "Stem uit"}
                title={demoRide.muted ? "Stem aan" : "Stem uit"}
              >
                {demoRide.muted ? (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-yellow-400" />
                )}
              </button>
              <button
                onClick={() => setDemoRide(null)}
                className="p-2 hover:bg-white/10 rounded"
                aria-label="Demo-rit stoppen"
                title="Stoppen"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* route summary card */}
          <AnimatePresence>
            {route && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="apex-print-card absolute right-4 top-4 z-20 w-[calc(100%-2rem)] md:w-[340px] glass rounded p-4 max-h-[calc(100%-2rem)] overflow-y-auto"
              >
                <h3 className="font-display font-semibold flex items-center gap-2 mb-1">
                  <Navigation className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="truncate">{route.name}</span>
                  {route.engine === "manual" && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide text-orange-300 border border-orange-400/30 bg-orange-400/10 rounded px-2 py-0.5 shrink-0"
                      title="De routing-dienst was onbereikbaar — dit is een hemelsbrede schatting over de punten, geen route over echte wegen. Herberekenen kan helpen."
                    >
                      ≈ geschat
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-sm mt-3">
                  <div className="bg-white/5 rounded p-3">
                    <p className="ticker text-slate-500 text-[10px]">
                      {P.distance}
                    </p>
                    <p className="font-bold text-white font-mono text-[15px]">
                      {route.distance ? formatDistance(route.distance) : "—"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded p-3">
                    <p className="ticker text-slate-500 text-[10px]">
                      {P.duration}
                    </p>
                    <p className="font-bold text-white font-mono text-[15px]">
                      {route.duration ? formatDuration(route.duration) : "—"}
                    </p>
                  </div>
                  {fuelAdvice(vehicle, (route.distance ?? 0) / 1000).needed && (
                    <div className="col-span-2 rounded p-3 border border-orange-400/30 bg-orange-400/[0.07] flex items-start gap-2">
                      <Fuel className="w-4 h-4 text-orange-300 shrink-0 mt-0.5" aria-hidden />
                      <p className="text-[12px] text-orange-200/90 leading-snug">
                        {P.tankWarn
                          .replace("{km}", String(Math.round((route.distance ?? 0) / 1000)))
                          .replace(
                            "{range}",
                            String(fuelAdvice(vehicle, (route.distance ?? 0) / 1000).rangeKm)
                          )}
                      </p>
                    </div>
                  )}
                  {(vehicle === "car" || vehicle === "motorcycle") &&
                    waypoints.length >= 2 && (
                      <div className="col-span-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => void compareVariants()}
                          disabled={variantLoading}
                          className="px-3 py-1.5 rounded text-[12px] font-semibold glass border border-white/10 hover:border-yellow-400/50 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                        >
                          {variantLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
                          ) : (
                            <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden />
                          )}
                          {P.variantCompare}
                        </button>
                        {waypoints.length >= 2 && (
                          <button
                            onClick={() => {
                              const doel =
                                [...waypoints].reverse().find((w) => !/^(punt|luspunt|wp)/i.test(w.name))
                                  ?.name ?? waypoints[waypoints.length - 1].name;
                              window.open(
                                bookingSearchUrl(doel, { ...defaultTravelDates(), adults: 2, rooms: 1 }),
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                            data-track="Affiliate klik"
                            data-track-partner="booking"
                            data-track-context="planner"
                            className="px-3 py-1.5 rounded text-[12px] font-semibold glass border border-white/10 hover:border-yellow-400/50 flex items-center gap-1.5 transition-colors"
                          >
                            <BedDouble className="w-3.5 h-3.5" aria-hidden />
                            {P.hotelBtn}
                            <span className="text-[9px] uppercase tracking-wide text-slate-500">partner</span>
                          </button>
                        )}
                        <button
                          onClick={() => shareImage()}
                          className="px-3 py-1.5 rounded text-[12px] font-semibold glass border border-white/10 hover:border-yellow-400/50 flex items-center gap-1.5 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" aria-hidden />
                          {P.shareImage}
                        </button>
                      </div>
                    )}
                  {variantB && (
                    <div className="col-span-2 rounded p-3 border border-white/10 bg-white/[0.03] flex flex-wrap items-center gap-3">
                      <p className="text-[12px] text-slate-300 flex-1 min-w-[200px]">
                        <b>Variant B</b> · {variantB.km.toFixed(1).replace(".", ",")} km ·{" "}
                        {variantB.avoid ? P.variantAvoid : P.variantVia}
                        {variantB.estimated ? " (geschat)" : ""}
                      </p>
                      <button
                        onClick={() => applyVariantB()}
                        className="px-3 py-1.5 rounded text-[12px] font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors"
                      >
                        {P.variantRide}
                      </button>
                      <button
                        onClick={() => setVariantB(null)}
                        className="btn-ghost h-8 w-8 rounded flex items-center justify-center"
                        title="Variant sluiten"
                        aria-label="Variant sluiten"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {elevationProfile && route.distance && (
                    <div className="col-span-2 bg-white/5 rounded p-3">
                      <p className="text-slate-400 text-[11px] uppercase tracking-wide">
                        {P.difficulty}
                      </p>
                      <p className="font-bold text-slate-100">
                        {difficultyLevel(vehicle, route.distance / 1000, elevationProfile.ascent) === "flat"
                          ? P.diffFlat
                          : difficultyLevel(vehicle, route.distance / 1000, elevationProfile.ascent) === "rolling"
                            ? P.diffRolling
                            : difficultyLevel(vehicle, route.distance / 1000, elevationProfile.ascent) === "hilly"
                              ? P.diffHilly
                              : P.diffMountain}
                        <span className="ml-2 font-mono text-[12px] font-normal text-slate-400">
                          {Math.round(elevationProfile.ascent)} hm
                          {route.distance >= 1000
                            ? ` · ${(elevationProfile.ascent / (route.distance / 1000)).toFixed(1).replace(".", ",")} hm/km`
                            : ""}
                        </span>
                      </p>
                    </div>
                  )}
                  {winding > 0 && (
                    <div className="col-span-2 bg-white/5 rounded p-3">
                      <p className="text-slate-400 text-[11px] uppercase tracking-wide">
                        {P.winding}
                      </p>
                      <p className={`font-bold ${windingInfo.color}`}>
                        {windingInfo.icon} {windingInfo.text} · {winding}°/km
                      </p>
                    </div>
                  )}
                </div>

                {/* weer op de startplek — key = geometrie, null = dienst onbereikbaar */}
                {weather?.key === geometryKey && weather.now && (
                  <div className="mt-2.5 bg-white/5 rounded p-2.5 flex items-center gap-2.5">
                    <WeatherVisual code={weather.now.code} rainMm={weather.now.rainMm} />
                    <span className="text-sm text-slate-300">
                      <strong className="text-white">{weather.now.tempC}°</strong>{" "}
                      {P.weatherAt} · {weatherLabel(weather.now.code, weather.now.rainMm).text}
                    </span>
                  </div>
                )}

                {/* hoogteprofiel — alleen zinvol bij routes van enige lengte */}
                {(route.distance ?? 0) >= MIN_DISTANCE_M && (
                  <ElevationProfile
                    profile={elevationProfile}
                    loading={elevationLoading}
                  />
                )}

                {/* routebeschrijving (afslagen) */}
                {route.turns && route.turns.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowTurns((v) => !v)}
                        className="flex-1 flex items-center justify-between px-3 py-2 bg-white/5 rounded text-sm font-semibold hover:bg-white/10 transition-colors"
                        aria-expanded={showTurns}
                      >
                        <span className="flex items-center gap-2">
                          <CornerUpRight className="w-4 h-4 text-yellow-400" />
                          {P.turnByTurn}
                        </span>
                        <span className="text-xs text-slate-400 font-normal font-mono flex items-center gap-1">
                          {route.turns.length} {P.steps}
                          {showTurns ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>
                      <button
                        onClick={handlePrint}
                        title="Routebeschrijving printen of als PDF bewaren"
                        aria-label="Routebeschrijving printen"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors print:hidden"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                    {showTurns && (
                      <ol className="mt-2 max-h-56 overflow-y-auto space-y-1 pr-1">
                        {route.turns.map((t, i) => (
                          <li key={`${i}-${t.distanceFromStart}`}>
                            <button
                              onClick={() =>
                                setFocusPoint({ coordinates: t.location, key: Date.now() })
                              }
                              title="Toon deze afslag op de kaart"
                              className="w-full flex items-start gap-2 text-left text-[13px] text-slate-300 bg-white/[0.03] hover:bg-white/[0.09] rounded px-2.5 py-1.5 transition-colors group/turn"
                            >
                              <span className="text-[10px] font-mono text-slate-600 w-4 shrink-0 text-right mt-1">
                                {i + 1}
                              </span>
                              <TurnIcon type={t.type} modifier={t.modifier} />
                              <span className="flex-1">{t.instruction}</span>
                              <span className="text-[11px] text-slate-500 whitespace-nowrap font-mono group-hover/turn:text-yellow-400/80 transition-colors">
                                {(t.distanceFromStart / 1000)
                                  .toFixed(1)
                                  .replace(".", ",")}{" "}
                                km
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-2 print:hidden">
                  <button
                    onClick={() => setShowEmbed((v) => !v)}
                    className="btn-brand py-2.5 rounded font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <MapIcon className="w-4 h-4" />
                    {showEmbed ? P.hideMap : P.showMap}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="Navigatie geopend"
                      data-track-provider="google_maps"
                      data-track-vehicle={vehicle}
                      className="btn-ghost py-2.5 rounded font-semibold text-sm flex items-center justify-center gap-1.5"
                      title={
                        importedRoute && navAnchors.length >= 2
                          ? `Navigatie via ${navAnchors.length} slimme ankers op de weg`
                          : "Route openen in Google Maps"
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                      Google Maps
                      {importedRoute && navAnchors.length >= 2 && (
                        <span className="text-[10px] font-normal text-slate-400">
                          {navAnchors.length} ankers
                        </span>
                      )}
                    </a>
                    <button
                      onClick={handleDownloadGPX}
                      className="btn-ghost py-2.5 rounded font-semibold text-sm flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      GPX
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleOpenWaze}
                      className="btn-ghost py-2.5 rounded font-semibold text-sm flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      Waze
                    </button>
                    <button
                      onClick={handleShareRoute}
                      title="Deel-link kopiëren — de hele route zit in de link, zonder account"
                      className="btn-ghost py-2.5 rounded font-semibold text-sm flex items-center justify-center gap-1.5"
                    >
                      {shareState === "idle" ? (
                        <Share2 className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                      {shareState === "copied"
                        ? "Gekopieerd!"
                        : shareState === "partial"
                          ? "Link (punten)"
                          : shareState === "failed"
                            ? "Zie chat"
                            : "Deel"}
                    </button>
                  </div>
                </div>

                {showEmbed && embedUrl && (
                  <iframe
                    src={embedUrl}
                    className="w-full h-64 rounded border border-white/10 mt-3"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps route"
                  />
                )}
                {tierOf(proState) === "free" && (
                  <p className="hidden print:block mt-8 pt-3 border-t border-slate-300 text-[10px] text-slate-500">
                    Routeboek gemaakt met Apex Routes Basis · routes.apexclusive.nl
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* waypoint list */}
          <AnimatePresence>
            {waypoints.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute left-4 bottom-24 sm:bottom-6 z-20 w-[calc(100%-2rem)] sm:w-72 glass rounded overflow-hidden print:hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <RouteIcon className="w-4 h-4 text-yellow-400" />
                    {waypoints.length} {P.points}
                  </span>
                  <div className="flex items-center gap-1">
                    {orderBeforeOptimize &&
                      orderBeforeOptimize.length === waypoints.length && (
                        <button
                          onClick={handleUndoOptimize}
                          title="Volgorde terugzetten"
                          aria-label="Volgorde terugzetten"
                          className="px-2 py-1 text-[11px] font-semibold text-yellow-300 hover:bg-white/10 rounded"
                        >
                          Volgorde terug
                        </button>
                      )}
                    <button
                      onClick={handleUndoWaypoint}
                      title="Laatste punt verwijderen"
                      aria-label="Laatste punt verwijderen"
                      className="p-1.5 hover:bg-white/10 rounded"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNewRoute}
                      title="Alle punten wissen"
                      aria-label="Alle punten wissen"
                      className="p-1.5 hover:bg-white/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowWaypointList((v) => !v)}
                      title={showWaypointList ? "Lijst inklappen" : "Lijst uitklappen"}
                      aria-label="Puntenlijst in- of uitklappen"
                      className="p-1.5 hover:bg-white/10 rounded"
                    >
                      {showWaypointList ? "−" : "+"}
                    </button>
                  </div>
                </div>
                {showWaypointList && (
                  <ul className="max-h-44 overflow-y-auto">
                    {waypoints.map((wp, i) => (
                      <li
                        key={wp.id}
                        className="flex items-center gap-2 px-4 py-2 text-sm border-b border-white/5 last:border-0"
                      >
                        <span className="w-5 h-5 rounded-sm bg-yellow-400 text-black text-[11px] font-bold flex items-center justify-center shrink-0 font-mono">
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate text-slate-200" title={wp.name}>
                          {wp.name}
                        </span>
                        {isCalculating && i === waypoints.length - 1 && (
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        )}
                        <button
                          onClick={() => handleRemoveWaypoint(wp.id)}
                          title="Punt verwijderen"
                          aria-label={`${wp.name} verwijderen`}
                          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* map controls */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3 items-end print:hidden">
            <div className="glass rounded p-1 flex">
              <button
                onClick={() => setMapStyle("dark")}
                aria-pressed={mapStyle === "dark"}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mapStyle === "dark"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4 inline mr-1" />
                {P.mapDark}
              </button>
              <button
                onClick={() => setMapStyle("satellite")}
                aria-pressed={mapStyle === "satellite"}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mapStyle === "satellite"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Satellite className="w-4 h-4 inline mr-1" />
                {P.mapSatellite}
              </button>
              <button
                onClick={() => setMapStyle("topo")}
                aria-pressed={mapStyle === "topo"}
                title="Topografisch met terreinschaduw — sterk voor wandelen en fietsen"
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  mapStyle === "topo"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mountain className="w-4 h-4 inline mr-1" />
                {P.mapTopo}
              </button>
            </div>

            {waypoints.length >= MIN_OPTIMIZE_POINTS && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleOptimizeOrder}
                title="Herschik de tussenpunten voor de kortste route (start en eind blijven staan)"
                className="px-4 py-3 glass rounded font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                {P.optimize}
              </motion.button>
            )}

            {waypoints.length >= 2 && (
              <div className="flex gap-3">
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={handleReverseRoute}
                  title="Route omkeren — vanaf de andere kant rijden"
                  className="px-4 py-3 glass rounded font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  {P.reverse}
                </motion.button>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={handleCloseLoop}
                  title="Lus sluiten — terug naar het startpunt (rondrit)"
                  className="px-4 py-3 glass rounded font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Repeat className="w-4 h-4" />
                  {P.closeLoop}
                </motion.button>
              </div>
            )}

            {waypoints.length >= 1 && (
              <div className="flex flex-wrap gap-2 items-center">
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setShowLoopGen((v) => !v)}
                  title="Genereer een rondrit van ongeveer X km vanaf je startpunt"
                  className="px-4 py-3 glass rounded font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  {P.loopGen}
                </motion.button>
                {showLoopGen && (
                  <div
                    className="flex flex-wrap gap-2"
                    onClick={(e) => {
                      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
                        "button[data-km]"
                      );
                      const v = Number(btn?.dataset.km);
                      if (Number.isFinite(v) && v > 0) handleGenerateLoop(v);
                    }}
                  >
                    {[50, 75, 100, 150, 200, 300].map((km) => (
                      <button
                        key={km}
                        data-km={km}
                        className="px-3 py-2 rounded text-[13px] font-mono font-semibold text-yellow-300 border border-yellow-400/30 bg-yellow-400/[0.07] hover:bg-yellow-400/15 transition-colors"
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {routeGeometry && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setShowPois((v) => !v)}
                aria-pressed={showPois}
                title="Tankstops, laadpalen en uitzichtpunten binnen 2 km van de route (OpenStreetMap)"
                className={`px-4 py-3 rounded font-semibold text-sm transition-all flex items-center gap-2 ${
                  showPois
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/40"
                    : "glass hover:bg-white/10"
                }`}
              >
                {poisLoading ? (
                  <span className="w-4 h-4 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
                ) : (
                  <Fuel className="w-4 h-4" />
                )}
                {showPois ? P.stopsOn : P.stopsOff}
              </motion.button>
            )}

            {waypoints.length >= 2 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleRecalculateRoute}
                className="px-4 py-3 glass rounded font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                {P.recalc}
              </motion.button>
            )}
          </div>

          {/* Stops langs de route: leesbare data-lijst onder de actieknoppen */}
          {showPois && pois.length > 0 && (
            <div className="bg-[#0e0e11] border border-white/10 rounded overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-400/90">
                  {P.stopsList}
                </p>
                <p className="font-mono text-[11px] text-slate-500">{pois.length} &middot; OSM</p>
              </div>
              <ul
                className="divide-y divide-white/5"
                onKeyDown={(e) => {
                  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                  e.preventDefault();
                  const items = Array.from(
                    e.currentTarget.querySelectorAll<HTMLButtonElement>("button")
                  );
                  const i = items.indexOf(document.activeElement as HTMLButtonElement);
                  const next =
                    items[i + (e.key === "ArrowDown" ? 1 : -1)] ??
                    items[e.key === "ArrowDown" ? 0 : items.length - 1];
                  next?.focus();
                }}
              >
                {[...pois]
                  .sort((a, b) => a.distanceM - b.distanceM)
                  .slice(0, 10)
                  .map((poi) => (
                    <li key={poi.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setFocusPoint({
                            coordinates: { lat: poi.lat, lng: poi.lng },
                            key: Date.now(),
                          })
                        }
                        title={poi.kind === "fuel" ? P.poiFuel : poi.kind === "charging" ? P.poiCharging : P.poiViewpoint}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/[0.04] transition-colors text-left"
                      >
                        {poi.kind === "fuel" ? (
                          <Fuel className="w-3.5 h-3.5 text-yellow-400/90 shrink-0" aria-hidden />
                        ) : poi.kind === "charging" ? (
                          <Zap className="w-3.5 h-3.5 text-yellow-400/90 shrink-0" aria-hidden />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-yellow-400/90 shrink-0" aria-hidden />
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] text-slate-200 truncate">{poi.name}</span>
                          <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                            {poi.kind === "fuel" ? P.poiFuel : poi.kind === "charging" ? P.poiCharging : P.poiViewpoint}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0">{poi.distanceM} m</span>
                      </button>
                    </li>
                  ))}
              </ul>
              {pois.length > 10 && (
                <p className="px-4 py-2 text-[11px] font-mono text-slate-500 border-t border-white/5">
                  {P.poiMore.replace("{n}", String(pois.length - 10))}
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Pro + Garage dialogs */}
      <ProDialog
        open={showPro}
        onClose={() => setShowPro(false)}
        onProChange={setProState}
      />
      <GaragePanel
        open={showGarage}
        onClose={() => setShowGarage(false)}
        routes={savedRoutes}
        onGoPro={() => {
          setShowGarage(false);
          setShowPro(true);
        }}
      />
    </div>
  );
}
