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

function extractJsonObject(content) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return content.slice(start, end + 1);
}

export function parseStructuredJson(content) {
  try {
    return JSON.parse(content);
  } catch (firstError) {
    const repaired = escapeRawControlCharactersInStrings(content);
    if (repaired !== content) {
      try {
        return JSON.parse(repaired);
      } catch {
        // fall through to the extraction attempt below
      }
    }
    const extracted = extractJsonObject(content);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch {
        try {
          return JSON.parse(escapeRawControlCharactersInStrings(extracted));
        } catch {
          // fall through to final error
        }
      }
    }
    throw new Error("The writing service returned malformed JSON that could not be repaired.");
  }
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const OPENROUTER_FALLBACK_MODEL = "openrouter/free";

async function callOpenAiCompatible(baseUrl, apiKey, model, system, user, extraInstruction, maxTokens) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: `${system} Return JSON only, with no markdown code fences, no preamble, and no explanation.${extraInstruction}` },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(`Request to ${baseUrl} failed (${response.status}): ${body.slice(0, 300)}`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`${baseUrl} returned an empty response.`);
  }
  return stripCodeFences(content);
}

async function attemptWithRetry(label, call, extraInstruction) {
  const maxRetries = 3;
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      return await call(extraInstruction);
    } catch (error) {
      lastError = error;
      if (error.status === 429 && attempt < maxRetries - 1) {
        const waitMs = 4000 * (attempt + 1);
        console.warn(`[llm] ${label} rate-limited, retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
        await sleep(waitMs);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function buildProviderChain(system, user, maxTokens) {
  const chain = [];
  const add = (name, baseUrl, apiKey, model) => {
    chain.push({
      name,
      call: extraInstruction => callOpenAiCompatible(baseUrl, apiKey, model, system, user, extraInstruction, maxTokens),
    });
  };

  add(`OpenRouter (${ENV.openrouterModel})`, ENV.openrouterApiUrl, ENV.openrouterApiKey, ENV.openrouterModel);
  if (ENV.openrouterModel !== OPENROUTER_FALLBACK_MODEL) {
    add(`OpenRouter (${OPENROUTER_FALLBACK_MODEL})`, ENV.openrouterApiUrl, ENV.openrouterApiKey, OPENROUTER_FALLBACK_MODEL);
  }

  if (ENV.groqApiKey) {
    add(`Groq (${ENV.groqModel})`, "https://api.groq.com/openai/v1", ENV.groqApiKey, ENV.groqModel);
  }

  if (ENV.geminiApiKey) {
    add(`Gemini (${ENV.geminiModel})`, "https://generativelanguage.googleapis.com/v1beta/openai", ENV.geminiApiKey, ENV.geminiModel);
  }

  return chain;
}

export async function invokeJson({ system, user, maxTokens = 3000 }) {
  const runChain = async (extraInstruction) => {
    const chain = buildProviderChain(system, user, maxTokens);
    let lastError;
    for (const provider of chain) {
      try {
        return await attemptWithRetry(provider.name, provider.call, extraInstruction);
      } catch (error) {
        lastError = error;
        console.warn(`[llm] ${provider.name} failed entirely (${error.message}), trying next provider if any...`);
      }
    }
    throw lastError || new Error("No text-generation provider is configured.");
  };

  try {
    const content = await runChain("");
    return parseStructuredJson(content);
  } catch (firstError) {
    const content = await runChain(" This is critical: your entire reply must be a single valid JSON object and nothing else.");
    return parseStructuredJson(content);
  }
}
