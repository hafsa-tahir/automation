function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}.`);
  }
  return value.trim();
}

function optional(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export const ENV = {
  openrouterApiKey: required("OPENROUTER_API_KEY"),
  openrouterModel: optional("OPENROUTER_MODEL", "google/gemma-2-9b-it:free"),
  openrouterApiUrl: optional("OPENROUTER_API_URL", "https://openrouter.ai/api/v1"),
  cloudflareImageEndpoint: required("CLOUDFLARE_IMAGE_ENDPOINT"),
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  googleRefreshToken: required("GOOGLE_REFRESH_TOKEN"),
  googleDriveFolderId: required("GOOGLE_DRIVE_FOLDER_ID"),
  gumroadAccessToken: optional("GUMROAD_ACCESS_TOKEN"),
  gumroadDefaultPriceCents: Number(optional("GUMROAD_DEFAULT_PRICE_CENTS", "499")),
  booksPerDay: Number(optional("BOOKS_PER_DAY", "3")),
  authorName: optional("AUTHOR_NAME", "StoryForge"),
};
