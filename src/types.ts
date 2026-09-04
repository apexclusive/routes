export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  description?: string;
}

export type VehicleType = "car" | "motorcycle" | "bicycle" | "pedestrian";

/** Één afslag-instructie uit de routebeschrijving (NL). */
export interface TurnInstruction {
  instruction: string;
  /** Afstand vanaf start (meters) waar de afslag plaatsvindt. */
  distanceFromStart: number;
  /** Lengte van de stap na de afslag (meters). */
  distanceAfter: number;
  /** Wegnaam waarop gevlogen wordt. */
  road?: string;
  /** OSRM-modifier: left/right/uturn/sharp left/slight right/... */
  modifier?: string;
  /** OSRM-type: turn/roundabout/fork/arrive/... */
  type: string;
  location: Coordinates;
}

export interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
  geometry?: GeoJSON.LineString;
  distance?: number; // meters
  duration?: number; // seconds
  engine?: "osrm" | "osrm-match" | "valhalla" | "manual";
  windingScore?: number;
  turns?: TurnInstruction[];
  legs?: RouteLeg[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteLeg {
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
  name?: string;
}

export interface RoutePreferences {
  avoidHighways: boolean;
  avoidTollRoads: boolean;
  vehicleType: VehicleType;
  scenicMode: boolean;
  maxDistance?: number;
  maxDuration?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RouteAnalysis {
  windingScore: number;
  deadEnds: number;
  uTurns: number;
  repeatedRoadPercent: number;
  curveCount: number;
}

export type RouteStatus = "idle" | "calculating" | "success" | "error";

export interface SavedRoute extends Route {
  userId?: string;
  isFavorite: boolean;
  tags?: string[];
}

// GeoJSON types
export namespace GeoJSON {
  export interface Position extends Array<number> {
    0: number;
    1: number;
  }

  export interface LineString {
    type: "LineString";
    coordinates: Position[];
  }

  export interface Feature<G = LineString | null, P = Record<string, unknown>> {
    type: "Feature";
    geometry: G;
    properties: P;
  }

  export interface FeatureCollection<
    G = LineString | null,
    P = Record<string, unknown>,
  > {
    type: "FeatureCollection";
    features: Feature<G, P>[];
  }
}