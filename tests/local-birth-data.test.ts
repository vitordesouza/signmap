import { afterEach, expect, it, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";
import { readFileSync } from "node:fs";
import { localBirthData } from "../scripts/local-birth-data";
vi.mock("node:fs", () => ({ readFileSync: vi.fn() }));
afterEach(() => vi.resetAllMocks());
function request() {
  let middleware!: (req: IncomingMessage, res: ServerResponse, next: () => void) => void;
  const plugin = localBirthData();
  const configure = plugin.configureServer as (server: ViteDevServer) => void;
  configure({
    middlewares: {
      use: (handler: typeof middleware) => {
        middleware = handler;
      },
    },
  } as unknown as ViteDevServer);
  const res = { statusCode: 200, setHeader: vi.fn(), end: vi.fn() };
  middleware(
    { url: "/__local/birth-data", method: "GET" } as IncomingMessage,
    res as unknown as ServerResponse,
    vi.fn(),
  );
  return res;
}
it("only registers as a dev plugin and returns no prefill when the ignored file is absent", () => {
  expect(localBirthData().apply).toBe("serve");
  vi.mocked(readFileSync).mockImplementation(() => {
    throw Object.assign(new Error("Missing"), { code: "ENOENT" });
  });
  expect(request().statusCode).toBe(204);
});
it("validates private prefill and disables caching", () => {
  const draft = {
    name: "Local example",
    email: "",
    gender: "",
    date: "2000-01-01",
    time: "12:00",
    language: "English",
    place: null,
  };
  vi.mocked(readFileSync).mockReturnValue(JSON.stringify(draft));
  const response = request();
  expect(response.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  expect(JSON.parse(response.end.mock.calls[0][0])).toEqual(draft);
  vi.mocked(readFileSync).mockReturnValue('{"name":"invalid"}');
  expect(request().statusCode).toBe(500);
});
