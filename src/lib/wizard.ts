import {
  Waypoint,
  Route,
  Coordinates,
  VehicleType,
} from "@/types";
import { parseUserInput, generateBotResponse, corridorDisplayName } from "./parser";
import { buildTurnByTurn } from "./navigation";
import {
  geocodeAddress,
  calculateRoute,
  calculateWindingScore,
  generateRouteSkeleton,
  estimateLoopRadiusKm,
  nearestKnownPlaceName,
  parseWithAI,
  formatDistance,
  formatDuration,
  haversineKm,
  MAX_WAYPOINTS,
} from "./routing";

export type WizardState =
  | "initial"
  | "asking_start"
  | "asking_destination"
  | "asking_distance"
  | "building"
  | "complete";

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quickReplies?: string[];
  routePreview?: {
    distance?: number;
    duration?: number;
    windingScore?: number;
  };
}

export interface WizardContext {
  state: WizardState;
  vehicle: VehicleType;
  startLocation: string | null;
  startCoords: Coordinates | null;
  endLocation: string | null;
  endCoords: Coordinates | null;
  roundTrip: boolean;
  /** tussenstops uit de AI-laag ("met stop in Durbuy") — geocodeerd bij het bouwen */
  viaStops: string[];
  distance: number | null;
  style: "scenic" | "direct" | "mixed";
  corridor: string | null;
  waypoints: Waypoint[];
  route: Route | null;
}

/** Scenic corridors met ingebouwde coördinaten: bouwt instant, ook offline. */
const SCENIC_CORRIDORS: Record<
  string,
  { center: Coordinates; stops: { name: string; coordinates?: Coordinates }[] }
> = {
  mergellandroute: {
    center: { lat: 50.8, lng: 5.8 },
    stops: [
      { name: "Maastricht", coordinates: { lat: 50.8511, lng: 5.6909 } },
      { name: "Eijsden", coordinates: { lat: 50.7781, lng: 5.7219 } },
      { name: "Slenaken", coordinates: { lat: 50.7553, lng: 5.833 } },
      { name: "Gulpen", coordinates: { lat: 50.813, lng: 5.8893 } },
      { name: "Valkenburg", coordinates: { lat: 50.8644, lng: 5.833 } },
    ],
  },
  "zwarte-woud": {
    center: { lat: 48.6, lng: 8.3 },
    stops: [
      { name: "Baden-Baden", coordinates: { lat: 48.7606, lng: 8.2396 } },
      { name: "Mummelsee", coordinates: { lat: 48.5922, lng: 8.2058 } },
      { name: "Freudenstadt", coordinates: { lat: 48.4636, lng: 8.411 } },
      { name: "Schiltach", coordinates: { lat: 48.2947, lng: 8.3377 } },
    ],
  },
  eifel: {
    center: { lat: 50.6, lng: 6.3 },
    stops: [
      { name: "Monschau", coordinates: { lat: 50.5479, lng: 6.2408 } },
      { name: "Rursee", coordinates: { lat: 50.6361, lng: 6.4353 } },
      { name: "Nideggen", coordinates: { lat: 50.6947, lng: 6.4853 } },
    ],
  },
  ardennen: {
    center: { lat: 50.35, lng: 5.7 },
    stops: [
      { name: "Durbuy", coordinates: { lat: 50.5292, lng: 5.4558 } },
      { name: "La Roche-en-Ardenne", coordinates: { lat: 50.1794, lng: 5.5786 } },
      { name: "Houffalize", coordinates: { lat: 50.1306, lng: 5.7906 } },
      { name: "Bastenaken", coordinates: { lat: 50.0856, lng: 5.7681 } },
    ],
  },
  vogezen: {
    // de Route des Crêtes loopt over de kam van noord naar zuid
    center: { lat: 48.03, lng: 7.02 },
    stops: [
      { name: "Gérardmer", coordinates: { lat: 48.0725, lng: 6.8783 } },
      { name: "Col de la Schlucht", coordinates: { lat: 48.0625, lng: 7.0264 } },
      { name: "Le Markstein", coordinates: { lat: 47.9203, lng: 7.0339 } },
      { name: "Grand Ballon", coordinates: { lat: 47.9019, lng: 7.0994 } },
      { name: "Munster", coordinates: { lat: 48.04, lng: 7.1372 } },
    ],
  },
  sauerland: {
    center: { lat: 51.24, lng: 8.36 },
    stops: [
      { name: "Winterberg", coordinates: { lat: 51.1939, lng: 8.5306 } },
      { name: "Willingen", coordinates: { lat: 51.2925, lng: 8.6083 } },
      { name: "Meschede", coordinates: { lat: 51.3494, lng: 8.2831 } },
      { name: "Schmallenberg", coordinates: { lat: 51.1489, lng: 8.2861 } },
    ],
  },
  mullerthal: {
    center: { lat: 49.81, lng: 6.31 },
    stops: [
      { name: "Echternach", coordinates: { lat: 49.8117, lng: 6.42 } },
      { name: "Berdorf", coordinates: { lat: 49.8206, lng: 6.3411 } },
      { name: "Beaufort", coordinates: { lat: 49.8339, lng: 6.2911 } },
      { name: "Larochette", coordinates: { lat: 49.7883, lng: 6.2214 } },
      { name: "Consdorf", coordinates: { lat: 49.7833, lng: 6.3333 } },
    ],
  },
};

let uidCounter = 0;
function uid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}`;
}

function normalize(text: string): string {
  // emoji's en hoofdletters er af voor makkelijke matching van quick replies
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
    .trim()
    .toLowerCase();
}

export class RouteWizard {
  private context: WizardContext;
  private onUpdate: (messages: ConversationMessage[]) => void;

  constructor(onUpdate: (messages: ConversationMessage[]) => void) {
    this.context = this.getInitialContext();
    this.onUpdate = onUpdate;
  }

  private getInitialContext(): WizardContext {
    return {
      state: "initial",
      vehicle: "car",
      startLocation: null,
      startCoords: null,
      endLocation: null,
      endCoords: null,
      roundTrip: true,
      viaStops: [],
      distance: null,
      style: "scenic",
      corridor: null,
      waypoints: [],
      route: null,
    };
  }

  getContext(): WizardContext {
    return this.context;
  }

  getMessages(): ConversationMessage[] {
    const messages: ConversationMessage[] = [];

    if (this.context.state === "initial") {
      messages.push({
        id: "greeting",
        role: "assistant",
        content: `Welkom bij **Apex Routes**!\n\nIk help je met het plannen van de perfecte route. Vertel me wat je wilt rijden — bijvoorbeeld:\n\n• *"Rondrit door Zuid-Limburg, 100 km"*  \n• *"Motor tocht van Maastricht naar Slenaken"*  \n• *"Fietsroute vanaf Utrecht, 40 km"*  \n\nOf klik gewoon op de kaart om te beginnen! `,
        quickReplies: ["Auto", "Motor", "Fiets", "Verras me"],
      });
    } else if (this.context.state === "asking_start") {
      messages.push({
        id: "ask_start",
        role: "assistant",
        content: `**Waar wil je starten?**\n\nTyp een stad of adres, of gebruik je huidige locatie.`,
        quickReplies: ["Mijn locatie", "Maastricht", "Amsterdam", "Utrecht"],
      });
    } else if (this.context.state === "asking_destination") {
      messages.push({
        id: "ask_destination",
        role: "assistant",
        content: `**Waar wil je naartoe?**\n\nTyp een bestemming (bv. *"naar Valkenburg"*), of kies voor een rondrit als je terug wilt komen bij het startpunt.`,
        quickReplies: ["Liever een rondrit", "Naar Valkenburg", "Naar Gulpen"],
      });
    } else if (this.context.state === "asking_distance") {
      messages.push({
        id: "ask_distance",
        role: "assistant",
        content: `**Hoe ver wil je rijden?**\n\nKies een afstand of typ zelf een aantal kilometers (of bv. *"2 uur"*).`,
        quickReplies: [
          "50 km (kort)",
          "100 km (gemiddeld)",
          "150 km (lang)",
          "250 km (expert)",
        ],
      });
    } else if (this.context.state === "complete" && this.context.route) {
      const route = this.context.route;
      const winding =
        route.windingScore !== undefined ? `${route.windingScore}°/km` : "";
      messages.push({
        id: "route_complete",
        role: "assistant",
        content: `**Route gevonden!**\n\n**${formatDistance(route.distance ?? 0)}** · **${formatDuration(route.duration ?? 0)}** rijtijd${winding ? ` · slinger-score **${winding}**` : ""}\n\nDe route staat nu op de kaart. Open hem in Google Maps voor turn-by-turn navigatie, of download hem als GPX voor TomTom, Calimoto of Kurviger.\n\nWil je nog iets veranderen of een nieuwe route plannen?`,
        quickReplies: [
          "Meer punten toevoegen",
          "Nieuwe route",
          "In Google Maps openen",
        ],
        routePreview: {
          distance: route.distance,
          duration: route.duration,
          windingScore: route.windingScore,
        },
      });
    }

    return messages;
  }

  private assistantMsg(
    content: string,
    quickReplies?: string[]
  ): ConversationMessage[] {
    const m: ConversationMessage = { id: uid("bot"), role: "assistant", content };
    if (quickReplies) m.quickReplies = quickReplies;
    return [m];
  }

  /**
   * Verwerkt een gebruikersbericht en geeft alléén assistent-berichten terug.
   * (Het gebruikersbericht zelf voegt de UI toe — geen duplicaten.)
   */
  async processInput(text: string): Promise<ConversationMessage[]> {
    const intent = parseUserInput(text);
    const norm = normalize(text);

    // ---- optionele AI-verrijking (vult alléén gaten) ----
    const ai = await parseWithAI(text);
    if (ai) {
      const nz = (s: unknown) => (typeof s === "string" ? s.trim() : "");
      if (!intent.startLocation && nz(ai.start)) intent.startLocation = nz(ai.start);
      if (!intent.endLocation && nz(ai.bestemming)) intent.endLocation = nz(ai.bestemming);
      if (!intent.distance && isFinite(parseFloat(String(ai.km)))) {
        intent.distance = Math.max(2, Math.round(parseFloat(String(ai.km))));
      }
      const aiVehicle = nz(ai.voertuig).toLowerCase();
      if (!intent.vehicle) {
        if (/motor/.test(aiVehicle)) intent.vehicle = "motorcycle";
        else if (/fiets/.test(aiVehicle)) intent.vehicle = "bicycle";
        else if (/wandel/.test(aiVehicle)) intent.vehicle = "pedestrian";
        else if (/auto|cabrio/.test(aiVehicle)) intent.vehicle = "car";
      }
      const stijl = nz(ai.stijl).toLowerCase();
      if (stijl.includes("kronkel") || stijl.includes("scenic")) intent.style = "scenic";
      else if (stijl.includes("direct")) intent.style = "direct";

      // tussenstops ("met stop in Durbuy") — maximaal 3, alleen zinnige namen
      this.context.viaStops = Array.isArray(ai.tussenstops)
        ? (ai.tussenstops as unknown[])
            .filter((s): s is string => typeof s === "string" && s.trim().length >= 2)
            .map((s) => s.trim().slice(0, 40))
            .slice(0, 3)
        : [];
    }

    // ---- context bijwerken ----
    if (intent.vehicle) this.context.vehicle = intent.vehicle;
    if (intent.roundTrip) this.context.roundTrip = true;
    else if (intent.endLocation) this.context.roundTrip = false; // expliciet "naar X" = enkele reis
    if (intent.distance) this.context.distance = intent.distance;
    if (intent.corridor) this.context.corridor = intent.corridor;
    if (intent.style === "scenic") this.context.style = "scenic";
    if (intent.style === "direct") this.context.style = "direct";
    // expliciete "van X naar Y" wint het van een toevallige corridor-match
    if (intent.startLocation && intent.endLocation) {
      this.context.corridor = null;
      intent.corridor = null;
    }

    // ---- quick replies & korte commando's ----
    if (/nieuwe route|opnieuw beginnen/.test(norm)) {
      this.reset();
      return this.getMessages();
    }

    if (/meer punten/.test(norm)) {
      return this.assistantMsg(
        "Klik op de kaart om punten toe te voegen — de route wordt meteen opnieuw berekend. Je kunt punten ook verslepen of verwijderen via de puntenlijst linksonder.",
        ["Nieuwe route"]
      );
    }

    if (/google maps/.test(norm)) {
      if (this.context.route || this.context.waypoints.length >= 2) {
        return this.assistantMsg(
          "Geopend in een nieuw tabblad! Gebruik anders de knop **Google Maps** in de route-samenvatting (rechtsboven op de kaart). Voor 100% exacte turn-by-turn (elke bocht) kun je ook de **GPX** downloaden en openen in OsmAnd, Kurviger, Calimoto of TomTom."
        );
      }
      return this.assistantMsg(
        "Er is nog geen route om te openen. Plan er eerst één — bv. *\"Rondrit door Zuid-Limburg, 100 km\"* — of importeer een GPX-bestand.",
        ["Verras me", "Nieuwe route"]
      );
    }

    if (/mijn locatie/.test(norm)) {
      const located = await this.locateUser();
      if (located) {
        this.context.state = this.context.roundTrip
          ? "asking_distance"
          : "asking_destination";
        return this.assistantMsg(
          `**Startpunt ingesteld:** je huidige locatie (${nearestKnownPlaceName(this.context.startCoords!)}).\n\n${
            this.context.roundTrip
              ? "Hoe ver wil je rijden?"
              : "Waar wil je naartoe?"
          }`
        );
      }
      return this.assistantMsg(
        "Ik kon je locatie niet bepalen (toegang geweigerd of niet beschikbaar). Typ een stad of adres als startpunt.",
        ["Maastricht", "Amsterdam"]
      );
    }

    if (/verras/.test(norm)) {
      this.context.roundTrip = true;
      this.context.distance = 100;
      this.context.corridor = "mergellandroute";
      this.context.style = "scenic";
      this.context.state = "building";
      return this.assistantMsg(
        "**Verrassing!** Ik plan een klassieke: de **Mergellandroute** in Zuid-Limburg — zo'n 100 km heuvels, haarspeldbochten en het mooiste stukje Nederland.",
        ["100 km is goed", "Maak er 150 km van"]
      );
    }

    if (/liever een rondrit|rondrit maar|maak een rondrit/.test(norm)) {
      this.context.roundTrip = true;
      this.context.state = "asking_distance";
      return this.assistantMsg("Top, een rondrit! Hoe ver wil je rijden?", [
        "50 km (kort)",
        "100 km (gemiddeld)",
        "150 km (lang)",
      ]);
    }

    // ---- state-afhankelijke stappen ----
    if (this.context.state === "asking_start") {
      const place = intent.startLocation || text.trim().slice(0, 48);
      const coords = await geocodeAddress(place);
      if (coords) {
        this.context.startCoords = coords;
        this.context.startLocation = place;
        this.context.state = this.context.roundTrip
          ? this.context.distance
            ? "building"
            : "asking_distance"
          : "asking_destination";
        return this.assistantMsg(
          `**Startpunt ingesteld:** ${place}\n\n${
            this.context.roundTrip && !this.context.distance
              ? "Hoe ver wil je rijden?"
              : this.context.roundTrip
                ? "Ik reken je rondrit uit!"
                : "Waar wil je naartoe?"
          }`
        );
      }
      return this.assistantMsg(
        `Ik kon **${place}** niet vinden. Probeer een grotere plaats in de buurt, of klik op de kaart om te starten.`,
        ["Mijn locatie", "Maastricht"]
      );
    }

    if (this.context.state === "asking_destination") {
      if (intent.endLocation) {
        const coords = await geocodeAddress(intent.endLocation);
        if (coords) {
          this.context.endCoords = coords;
          this.context.endLocation = intent.endLocation;
          this.context.roundTrip = false;
          this.context.state = this.context.distance ? "building" : "asking_distance";
          return this.assistantMsg(
            `**Bestemming ingesteld:** ${intent.endLocation}\n\n${
              this.context.distance ? "Ik reken je route uit!" : "Hoe ver mag de route zijn (via mooie wegen)?"
            }`
          );
        }
        return this.assistantMsg(
          `Ik kon **${intent.endLocation}** niet vinden. Probeer het opnieuw met bv. *"naar Valkenburg"*.`
        );
      }
      return this.assistantMsg(
        "Typ je bestemming als *\"naar Valkenburg\"* — of kies hieronder."
      );
    }

    if (this.context.state === "asking_distance") {
      const km =
        intent.distance ??
        (norm.match(/(\d+)/) ? parseInt(norm.match(/(\d+)/)![1], 10) : null);
      if (km && km >= 2) {
        this.context.distance = Math.min(2000, km);
        this.context.state = "building";
        return this.assistantMsg(
          `**${this.context.distance} km** — begrepen. Ik ga de route uitrekenen!`
        );
      }
      return this.assistantMsg("Hoeveel kilometer mag het zijn? Kies hieronder of typ een getal.");
    }

    // ---- initiële vrije tekst (ook bij "complete": dan is het een nieuwe wens) ----
    if (
      this.context.state === "initial" ||
      this.context.state === "building" ||
      this.context.state === "complete"
    ) {
      if (intent.startLocation && !this.context.startCoords) {
        const coords = await geocodeAddress(intent.startLocation);
        if (coords) {
          this.context.startCoords = coords;
          this.context.startLocation = intent.startLocation;
        }
      }
      if (intent.endLocation && !this.context.endCoords) {
        const coords = await geocodeAddress(intent.endLocation);
        if (coords) {
          this.context.endCoords = coords;
          this.context.endLocation = intent.endLocation;
        }
      }

      const understood = generateBotResponse(intent).trim();
      const hasEnough =
        !!this.context.corridor ||
        !!(this.context.startCoords && this.context.endCoords) ||
        !!(this.context.startCoords && this.context.distance) ||
        !!(!this.context.startCoords && this.context.distance);

      if (!hasEnough) {
        // alleen voertuig of losse wensen → vraag om startpunt
        this.context.state = "asking_start";
        return this.assistantMsg(
          `${understood ? understood + "\n\n" : ""}**Waar wil je starten?**`,
          ["Mijn locatie", "Maastricht", "Amsterdam"]
        );
      }

      if (this.context.startCoords && !this.context.endCoords && !this.context.distance && !this.context.corridor) {
        this.context.state = this.context.roundTrip ? "asking_distance" : "asking_destination";
        return this.assistantMsg(
          `**Startpunt ingesteld:** ${this.context.startLocation}\n\n${
            this.context.roundTrip ? "Hoe ver wil je rijden?" : "Waar wil je naartoe?"
          }`
        );
      }

      const reply =
        (understood ? `${understood}\n\n` : "") +
        `Dat klinkt als een geweldige ${intent.vehicle === "motorcycle" ? "rit" : "tocht"}! Ik ga de route voor je uitrekenen.`;
      this.context.state = "building";
      return this.assistantMsg(reply);
    }

    return this.assistantMsg(
      "Ik snap 'm nog niet helemaal. Probeer bv. *\"Rondrit door Zuid-Limburg, 100 km\"* of *\"Van Maastricht naar Slenaken\"*.",
      ["Nieuwe route", "Meer punten toevoegen"]
    );
  }

  private locateUser(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.context.startCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          this.context.startLocation = "Mijn locatie";
          resolve(true);
        },
        () => resolve(false),
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  private pushWaypoint(list: Waypoint[], name: string, coordinates: Coordinates): Waypoint {
    const wp: Waypoint = { id: uid("wp"), name, coordinates };
    list.push(wp);
    return wp;
  }

  async buildRoute(): Promise<ConversationMessage[]> {
    try {
      const waypoints: Waypoint[] = [];
      const ctx = this.context;

      if (ctx.corridor && SCENIC_CORRIDORS[ctx.corridor]) {
        const corridor = SCENIC_CORRIDORS[ctx.corridor];
        if (ctx.startCoords) {
          this.pushWaypoint(waypoints, ctx.startLocation || "Startpunt", ctx.startCoords);
        }
        for (const stop of corridor.stops) {
          const coords =
            stop.coordinates ??
            (await geocodeAddress(stop.name)) ??
            null;
          if (coords) this.pushWaypoint(waypoints, stop.name, coords);
        }
        if (ctx.roundTrip && waypoints.length > 1) {
          // gevraagde afstand groter dan de corridor zelf? → lus uitbreiden
          // met een ring rond het corridor-centrum tot de doelafstand.
          const targetKm = ctx.distance || 0;
          if (targetKm >= 60) {
            let estKm = 0;
            for (let i = 0; i < waypoints.length - 1; i++) {
              estKm += haversineKm(
                waypoints[i].coordinates,
                waypoints[i + 1].coordinates
              );
            }
            estKm *= 1.25;
            const remaining = targetKm - estKm;
            if (remaining > targetKm * 0.3) {
              const ring = generateRouteSkeleton(
                corridor.center,
                estimateLoopRadiusKm(remaining, 6),
                6
              );
              for (const coords of ring) {
                this.pushWaypoint(waypoints, nearestKnownPlaceName(coords), coords);
              }
            }
          }
          // lus sluiten: eerste punt nogmaals als eindpunt (met eigen id)
          this.pushWaypoint(waypoints, `${waypoints[0].name} (einde)`, {
            ...waypoints[0].coordinates,
          });
        }
      } else if (ctx.startCoords && ctx.endCoords && !ctx.roundTrip) {
        // A → B over echte wegen — eventuele AI-tussenstops ertussen
        this.pushWaypoint(waypoints, ctx.startLocation || "Startpunt", ctx.startCoords);
        for (const stop of ctx.viaStops) {
          const coords = await geocodeAddress(stop);
          if (coords) this.pushWaypoint(waypoints, stop, coords);
        }
        this.pushWaypoint(waypoints, ctx.endLocation || "Bestemming", ctx.endCoords);
      } else if (ctx.startCoords) {
        // rondrit rond het startpunt
        const targetKm = ctx.distance || 100;
        const radius = estimateLoopRadiusKm(targetKm, 8);
        const skeleton = generateRouteSkeleton(ctx.startCoords, radius, 8);
        const startName = ctx.startLocation || nearestKnownPlaceName(ctx.startCoords);
        this.pushWaypoint(waypoints, startName, ctx.startCoords);
        for (const coords of skeleton) {
          this.pushWaypoint(waypoints, nearestKnownPlaceName(coords), coords);
        }
        this.pushWaypoint(waypoints, `${startName} (einde)`, { ...ctx.startCoords });
      } else {
        // geen start bekend → demo-rondrit door Zuid-Limburg
        const center = { lat: 50.8, lng: 5.8 };
        const targetKm = ctx.distance || 100;
        const skeleton = generateRouteSkeleton(
          center,
          estimateLoopRadiusKm(targetKm, 8),
          8
        );
        for (const coords of skeleton) {
          this.pushWaypoint(waypoints, nearestKnownPlaceName(coords), coords);
        }
        if (waypoints.length > 1) {
          this.pushWaypoint(waypoints, `${waypoints[0].name} (einde)`, {
            ...waypoints[0].coordinates,
          });
        }
      }

      if (waypoints.length > MAX_WAYPOINTS) waypoints.length = MAX_WAYPOINTS;
      this.context.waypoints = waypoints;

      if (waypoints.length >= 2) {
        const routeData = await calculateRoute(
          waypoints.map((w) => w.coordinates),
          { vehicleType: this.context.vehicle }
        );

        const name = this.routeName(routeData.distance);

        this.context.route = {
          id: uid("route"),
          name,
          waypoints,
          geometry: routeData.geometry,
          distance: routeData.distance,
          duration: routeData.duration,
          engine: routeData.estimated ? "manual" : "osrm",
          windingScore: calculateWindingScore(routeData.geometry),
          turns: buildTurnByTurn(routeData),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.context.state = "complete";
      } else {
        this.context.state = "asking_start";
        return this.assistantMsg(
          "Ik kon niet genoeg punten bepalen. Typ een startpunt (bv. een stad) en probeer het opnieuw."
        );
      }

      return this.getMessages();
    } catch (error) {
      console.error("Route build error:", error);
      this.context.state = "initial";
      return this.assistantMsg(
        "Sorry, er ging iets mis bij het berekenen van de route. Probeer het opnieuw met een andere locatie."
      );
    }
  }

  private routeName(distanceMeters: number): string {
    const km = Math.round((distanceMeters || 0) / 100) / 10;
    if (this.context.corridor) {
      return `${corridorDisplayName(this.context.corridor)} — ${km.toString().replace(".", ",")} km`;
    }
    if (this.context.startLocation && this.context.endLocation) {
      return `${this.context.startLocation} → ${this.context.endLocation}`;
    }
    if (this.context.startLocation) {
      return `Rondrit ${this.context.startLocation} — ${km.toString().replace(".", ",")} km`;
    }
    return `Route ${new Date().toLocaleDateString("nl-NL")}`;
  }

  reset(): void {
    this.context = this.getInitialContext();
  }
}
