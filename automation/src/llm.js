import { ENV } from "./env.js";

function escapeRawControlCharactersInStrings(value) {
  let output = "";
  let inString = false;
  let escaped = false;
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (!inString) {
      if (character === '"') inString = true;
      output += character;
      continue;
    }
    if (escaped) {
      escaped = false;
      output += character;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      output += character;
      continue;
    }
    if (character === '"') {
      inString = false;
      output += character;
      continue;
    }
    if (code < 0x20) {
      output += character === "\n" ? "\\n" : character === "\r" ? "\\r" : character === "\t" ? "\\t" : `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }
    output += character;
  }
  return output;
}

export function parseStructuredJson(content) {
  try {
    return JSON.parse(content);
  } catch (firstError) {
    const repaired = escapeRawControlCharactersInStrings(content);
    if (repaired === content) throw firstError;
    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error("The writing service returned malformed JSON that could not be repaired.");
    }
  }
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

export async function invokeJson({ system, user, maxTokens = 3000 }) {
  const call = async (extraInstruction = "") => {
    const response = await fetch(`${ENV.openrouterApiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.openrouterApiKey}`,
      },
      body: JSON.stringify({
        model: ENV.openrouterModel,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: `${system} Return JSON only, with no markdown code fences, no preamble, and no explanation.${extraInstruction}` },
          { role: "user", content: user },
        ],
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`OpenRouter request failed (${response.status}): ${body.slice(0, 300)}`);
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenRouter returned an empty response.");
    }
    return stripCodeFences(content);
  };

  try {
    const content = await call();
    return parseStructuredJson(content);
  } catch (firstError) {
    const content = await call(" This is critical: your entire reply must be a single valid JSON object and nothing else.");
    return parseStructuredJson(content);
  }
}
