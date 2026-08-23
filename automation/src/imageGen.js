import { ENV } from "./env.js";

const MAX_PROMPT_LENGTH = 1800;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function truncate(value, length) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (clean.length <= length) return clean;
  const cut = clean.slice(0, Math.max(0, length - 1)).trimEnd();
  const boundary = cut.lastIndexOf(" ");
  return `${boundary > length * 0.65 ? cut.slice(0, boundary) : cut}…`;
}

export function compressPrompt(prompt) {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  if (normalized.length <= MAX_PROMPT_LENGTH) return normalized;

  const sceneMatch = prompt.match(/Scene direction:\s*([\s\S]*?)(?:\n\s*Do not add|$)/i);
  const bibleMatch = prompt.match(/Recurring character bible[^:]*:\s*([\s\S]*?)(?:\n\s*Scene direction:|$)/i);
  const style = truncate(prompt.match(/^Create [\s\S]*?\./i)?.[0] || "Premium children's storybook illustration.", 260);
  const composition = /horizontal landscape[^.]*\./i.exec(prompt)?.[0] || "Horizontal landscape composition with a clear focal subject.";
  const scene = truncate(sceneMatch?.[1] || normalized, 880);
  const characters = truncate(bibleMatch?.[1] || "Preserve recurring character identity, clothing, palette, and proportions.", 520);
  const concise = [
    style,
    composition,
    `Characters: ${characters}`,
    `Scene: ${scene}`,
    "Visual-only artwork; no text, captions, speech bubbles, logos, watermarks, numbers, or letterforms.",
  ].join(" ");
  return truncate(concise, MAX_PROMPT_LENGTH);
}

function minimalPrompt(visualStyle) {
  return `Children's storybook illustration in ${visualStyle}. Warm, gentle, whimsical scene. No text, no letters, no words, no watermark.`;
}

async function callWorker(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch(ENV.cloudflareImageEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "image/jpeg" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Cloudflare Worker error (${response.status}): ${text.slice(0, 300)}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`Cloudflare Worker returned a non-image response (${contentType || "no content-type"})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) throw new Error("Cloudflare Worker returned an empty image.");
    return { buffer, contentType: contentType.split(";")[0] };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateIllustration({ prompt, visualStyle, label }) {
  const attempts = [
    compressPrompt(prompt),
    truncate(compressPrompt(prompt), 900),
    minimalPrompt(visualStyle),
  ];

  let lastError = "";
  for (let i = 0; i < attempts.length; i += 1) {
    try {
      const result = await callWorker(attempts[i]);
      return result;
    } catch (error) {
      lastError = error.message || String(error);
      console.warn(`[image] ${label}: attempt ${i + 1}/${attempts.length} failed - ${lastError}`);
      if (i < attempts.length - 1) await sleep(1500 * (i + 1));
    }
  }
  console.error(`[image] ${label}: all attempts failed. Last error: ${lastError}`);
  return null;
}

export async function generateBatch(jobs, concurrency = 2) {
  const results = new Array(jobs.length).fill(null);
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await generateIllustration(jobs[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  return results;
}
