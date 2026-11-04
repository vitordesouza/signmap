/** Direct OpenAI calls use the credited organization without Gateway funding or fallback. */
export function readingConfigured(env: NodeJS.ProcessEnv = process.env) {
  return (
    env.READING_ENABLED === "true" &&
    !!env.READING_MODEL &&
    !!env.OPENAI_API_KEY &&
    env.READING_SAFEGUARDS_CONFIRMED === "true"
  );
}
