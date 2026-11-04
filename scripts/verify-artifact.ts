/** Local packaging smoke check. Requires `pnpm build:vercel` and network access to Open-Meteo.
 * Runs the exported web handler from a temporary copy with no access to project source paths.
 * This does not substitute for a live Linux/Vercel preview test.
 */
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { DEFAULT_SETTINGS, chartResponseSchema } from "../src/schemas/chart";
const source = resolve(".vercel/output/functions/__server.func");
const temporary = await mkdtemp(join(tmpdir(), "mapa-artifact-"));
const previous = process.cwd();
try {
  await cp(source, temporary, { recursive: true, dereference: true });
  const config = JSON.parse(await readFile(join(temporary, ".vc-config.json"), "utf8"));
  assert.equal(config.runtime, "nodejs24.x");
  for (const file of ["sepl_18.se1", "semo_18.se1", "seas_18.se1"])
    assert.ok((await readFile(join(temporary, "ephemeris", file))).byteLength > 1000);
  const linux = await readFile(
    join(temporary, "node_modules/sweph/prebuilds/linux-x64/sweph.node"),
  );
  assert.equal(linux.subarray(0, 4).toString("hex"), "7f454c46");
  process.chdir(temporary);
  const { default: app } = await import(pathToFileURL(join(temporary, "index.mjs")).href);
  const privateResponse: Response = await app.fetch(
    new Request("http://localhost/__local/birth-data"),
  );
  assert.equal(privateResponse.status, 404, "Local prefill must not exist in production");
  const home: Response = await app.fetch(new Request("http://localhost/"));
  assert.equal(home.status, 200);
  assert.ok((await home.text()).includes("Alex Morgan"), "Production must use the neutral example");
  const response: Response = await app.fetch(
    new Request("http://localhost/api/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId: 5128581,
        date: "1994-09-18",
        time: "14:30",
        settings: DEFAULT_SETTINGS,
      }),
    }),
  );
  const payload = await response.json();
  assert.equal(response.status, 200, JSON.stringify(payload));
  const chart = chartResponseSchema.parse(payload);
  assert.equal(chart.points.length, 19);
  assert.ok(chart.aspects.some((a) => a.a === "rising" || a.b === "rising"));
  console.log(
    `Isolated Vercel artifact: ${chart.points.length} points, ${chart.aspects.length} aspects; native engine, ephemeris files, schema and Linux binary packaged. Runtime execution tested on ${process.platform}/${process.arch}, not on Vercel.`,
  );
} finally {
  process.chdir(previous);
  await rm(temporary, { recursive: true, force: true });
}
