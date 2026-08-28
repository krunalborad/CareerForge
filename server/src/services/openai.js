import OpenAI from "openai";

let client = null;
export function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (!client) client = new OpenAI({ apiKey: key });
  return client;
}

/** Ask the LLM for JSON. Returns null when no key is configured or on failure. */
export async function askJSON(system, user) {
  const ai = getClient();
  if (!ai) return null;
  try {
    const res = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return JSON.parse(res.choices[0].message.content);
  } catch (e) {
    console.warn("OpenAI failed, falling back to offline engine:", e.message);
    return null;
  }
}
