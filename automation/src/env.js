// Reads and validates configuration from environment variables.
// In GitHub Actions these come from repo/organization Secrets.
// Locally, copy .env.example to .env and use `node --env-file=.env src/run.js` (Node 20.6+).

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}. See automation/.env.example.`);
  }
  return value.trim();
}

function optional(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export const ENV = {
  // Text generation (OpenRouter - has free-tier models)
  openrouterApiKey: required("OPENROUTER_API_KEY"),
  openrouterModel: optional("OPENROUTER_MODEL", "google/gemma-4-31b-it:free"),
  openrouterApiUrl: optional("OPENROUTER_API_URL", "https://openrouter.ai/api/v1"),

  // Image generation (your existing Cloudflare Worker)
  cloudflareImageEndpoint: required("CLOUDFLARE_IMAGE_ENDPOINT"),

  // Storage (Google Drive - free 15GB on a personal Gmail account, no card)
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  googleRefreshToken: required("GOOGLE_REFRESH_TOKEN"),
  googleDriveFolderId: required("GOOGLE_DRIVE_FOLDER_ID"), // the folder you created to hold all generated books

  // Publishing (Gumroad)
  gumroadAccessToken: optional("GUMROAD_ACCESS_TOKEN"), // optional: if missing, skip publishing, just generate + store
  gumroadDefaultPriceCents: Number(optional("GUMROAD_DEFAULT_PRICE_CENTS", "499")),

  // Backup text providers - tried only if OpenRouter is exhausted. Both are
  // optional; leave the API key blank to skip that provider entirely.
  groqApiKey: optional("GROQ_API_KEY"),
  groqModel: optional("GROQ_MODEL", "llama-3.3-70b-versatile"),
  geminiApiKey: optional("GEMINI_API_KEY"),
  geminiModel: optional("GEMINI_MODEL", "gemini-2.5-flash"),

  // Batch behavior
  booksPerDay: Number(optional("BOOKS_PER_DAY", "3")),
  authorName: optional("AUTHOR_NAME", "StoryForge"),
};
