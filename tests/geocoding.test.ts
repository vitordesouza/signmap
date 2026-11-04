import { it, expect, vi, afterEach } from "vitest";
import { getLocation, searchLocations } from "../src/server/geocoding";
afterEach(() => vi.unstubAllGlobals());
it("does not call upstream for short searches", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  expect(await searchLocations("x")).toEqual({ results: [] });
  expect(fetch).not.toHaveBeenCalled();
});
it("normalizes provider results and resolves coordinates server-side", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 777,
        name: "Town",
        admin1: "Region",
        country: "Country",
        latitude: 12,
        longitude: 34,
        timezone: "UTC",
      }),
    }),
  );
  expect(await getLocation(777)).toEqual({
    id: 777,
    name: "Town",
    region: "Region",
    country: "Country",
    latitude: 12,
    longitude: 34,
    timezone: "UTC",
  });
});
it("returns a recoverable upstream failure", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Error("Offline")));
  await expect(searchLocations("test-offline")).rejects.toMatchObject({
    status: 502,
    code: "GEOCODING_UNAVAILABLE",
  });
});
