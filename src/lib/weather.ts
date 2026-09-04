/**
 * Weer op de startplek (Open-Meteo, keyless). Klein en bewust eenvoudig:
 * een chip in de samenvatting, geen volledige weerpagina.
 */
import type { Coordinates } from "@/types";

export interface WeatherNow {
  tempC: number;
  rainMm: number;
  code: number;
}

/** WMO-weercode → korte NL-beschrijving + emoji. */
export function weatherLabel(code: number, rainMm: number): { text: string } {
  if (rainMm >= 1) return { text: "regen" };
  if (rainMm > 0) return { text: "motregen" };
  if (code === 0) return { text: "zon" };
  if (code <= 2) return { text: "zonnig met wolken" };
  if (code === 3) return { text: "bewolkt" };
  if (code <= 48) return { text: "mist" };
  if (code <= 57) return { text: "druppels" };
  if (code <= 67) return { text: "regen" };
  if (code <= 77) return { text: "sneeuw" };
  if (code <= 82) return { text: "buien" };
  if (code <= 86) return { text: "sneeuwbuien" };
  if (code >= 95) return { text: "onweer" };
  return { text: "wisselend" };
}

export async function fetchWeatherNow(start: Coordinates): Promise<WeatherNow | null> {
  try {
    const res = await fetch(
      `/api/weather?lat=${start.lat.toFixed(4)}&lng=${start.lng.toFixed(4)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code?: string;
      current?: { temperature_2m?: number; precipitation?: number; weather_code?: number };
    };
    if (data.code !== "Ok" || !data.current) return null;
    const temp = data.current.temperature_2m;
    if (typeof temp !== "number") return null;
    return {
      tempC: Math.round(temp),
      rainMm: data.current.precipitation ?? 0,
      code: data.current.weather_code ?? 3,
    };
  } catch {
    return null;
  }
}
