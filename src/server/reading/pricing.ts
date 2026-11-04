// Standard token prices verified 2026-11-02 against the official model page.
// https://developers.openai.com/api/docs/models/gpt-6.1-terra
// Estimates before promotional credits; not proof of billed charges or remaining grant.
export function estimateCost(
  model: string,
  input: number | undefined,
  output: number | undefined,
  cached = 0,
) {
  if (model !== "gpt-6.1-terra" || input == null || output == null) return null;
  return (input - cached + cached * 0.05 + output * 5) / 1_000_000;
}
