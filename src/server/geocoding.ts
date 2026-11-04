import { z } from "zod";
import { locationSchema } from "../schemas/chart";
import { ApiError } from "./errors";
const cache = new Map<string, { value: unknown; expires: number }>();
async function lookup(path: string, params: Record<string, string>) {
  const key = path + "?" + new URLSearchParams(params);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  try {
    const response = await fetch("https://geocoding-api.open-meteo.com/v1/" + key, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw Error("Upstream error");
    const value: unknown = await response.json();
    if (cache.size >= 256) cache.delete(cache.keys().next().value!);
    cache.set(key, { value, expires: Date.now() + 24 * 60 * 60 * 1000 });
    return value;
  } catch {
    throw new ApiError(
      "City search is temporarily unavailable. Please try again.",
      502,
      "GEOCODING_UNAVAILABLE",
    );
  }
}
const upstreamPlace = z.object({
  id: z.number(),
  name: z.string(),
  admin1: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string(),
});
function place(value: unknown) {
  const p = upstreamPlace.parse(value);
  return locationSchema.parse({
    id: p.id,
    name: p.name,
    region: p.admin1 ?? "",
    country: p.country ?? "",
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
  });
}
export async function searchLocations(query: string) {
  const q = query.trim();
  if (q.length < 2) return { results: [] };
  if (q.length > 120) throw new ApiError("Please use a shorter city name.");
  const payload = z
    .object({ results: z.array(z.unknown()).optional() })
    .parse(await lookup("search", { name: q, count: "8", language: "en", format: "json" }));
  return {
    results: (payload.results ?? []).flatMap((p) => {
      const result = upstreamPlace.safeParse(p);
      if (!result.success) return [];
      const l = place(result.data);
      return [{ id: l.id, name: l.name, region: l.region, country: l.country }];
    }),
  };
}
export async function getLocation(id: number) {
  return place(await lookup("get", { id: String(id) }));
}
