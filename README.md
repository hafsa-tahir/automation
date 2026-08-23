# StoryForge AI

StoryForge AI is a full-stack storybook creation platform for turning a story idea into a structured, illustrated, editable, and printable children’s book. The application is designed around a warm editorial interface rather than a chat-first AI experience. It uses the platform’s server-side authentication, relational database, S3-compatible file storage, built-in LLM, and built-in image generation service.

## Product workflow

The author enters one story prompt. StoryForge infers audience, genre, tone, moral, length, characters, visual direction, authoring metadata, and story structure automatically before generating a 4:3 landscape children’s-book format. The generation pipeline persists a high-level story plan, a permanent character bible, a separate page outline, a structured page manuscript, scene-specific page layout recommendations, and illustration prompts. Illustrations advance through a resumable, persisted job in small batches and are refreshed in the editor while processing. Artwork persists under `users/{userId}/books/{bookId}/pages/{pageNumber}/`, while covers live under the associated `cover/` path and exports under `exports/`.

## Landscape book composition

StoryForge renders each page as a professionally composed landscape spread, not a generic image-plus-paragraph template. The planner selects from four controlled compositions—illustration left, illustration right, bottom reading band, and cinematic spread—using the scene’s action, emotional pace, and text density. In every option, text is typeset by the application in a dedicated reading area with print-safe margins, readable serif typography, and an unobtrusive folio. Generated images are expressly instructed not to include words, typography, labels, or watermarks.

The product may be informed by a user-supplied reading reference, but it must only adapt general non-infringing principles such as landscape pacing, scene-led artwork, independent reading panels, and stable page rhythm. It never copies that reference’s text, characters, or copyrighted visual material.

| Layer | Responsibility |
| --- | --- |
| React client | Landing experience, protected workspace, creation wizard, book editor, reader, and export controls. |
| tRPC server | Ownership-aware procedures, input validation, generation coordination, and error reporting. |
| Built-in LLM | Character bible, story plan and pages, art prompts, and editor rewrites. |
| Built-in image service | Cover and individual page illustration generation, with no text requested in image prompts. |
| MySQL via Drizzle | User-owned books, characters, pages, jobs, generated images, and export metadata. |
| S3-compatible storage | Generated illustrations and printable PDF objects, referenced by database keys and URLs. |

## Database model

Every book has a `userId` and every book-dependent record references its owning book. Server procedures first retrieve a book with both its ID and authenticated user ID before accessing pages, characters, jobs, illustrations, or exports. This enforces account-level ownership without relying on client-side filtering.

| Table | Purpose |
| --- | --- |
| `books` | Book settings, author attribution, landscape format, status, cover metadata, title, and character bible. |
| `characters` | Visual identity anchors—face, proportions, clothing, shoes, palette, and illustration description—used by every generated illustration. |
| `book_pages` | Structured scene content, AI-selected landscape composition, editing settings, and illustration references. |
| `generation_jobs` | Generation lifecycle (`queued`, `processing`, `completed`, `failed`) and user-facing stage metadata. |
| `generated_images` | Prompt, storage location, model, status, and failure details for image work. |
| `exports` | Print-PDF storage location and export lifecycle. |

## Required environment

The managed project automatically injects the values below. No third-party AI key is needed or used. The LLM and image provider are called only from server code using the managed built-in services. Keep server credentials secret at all times; never expose them in client bundles.

| Variable | Purpose | Client exposure |
| --- | --- | --- |
| `DATABASE_URL` | Managed MySQL connection used only by the server. | Never expose. |
| `JWT_SECRET` | Session-cookie signing material. | Never expose. |
| `BUILT_IN_FORGE_API_URL` | Server endpoint for built-in LLM, image generation, and storage services. | Never expose. |
| `BUILT_IN_FORGE_API_KEY` | Server credential for built-in generation and storage services. | Never expose. |
| `LLM_PROVIDER` | Primary text provider. Set to `groq` or `gemini`; any other value keeps the built-in Manus LLM. | Never expose. |
| `LLM_FALLBACK_PROVIDER` | Optional secondary text provider used only after confirmed Gemini quota exhaustion. Defaults to `manus`; supported values are `manus`, `groq`, and `gemini`. | Never expose. |
| `GROQ_API_KEY` | Server-only Groq Bearer credential. | Never expose. |
| `GROQ_API_KEYS` | Optional comma-separated Groq credentials used for quota-aware rotation. | Never expose. |
| `GROQ_API_URL` | Optional Groq API origin; defaults to `https://api.groq.com`. | Never expose. |
| `GROQ_LLM_MODEL` | Optional Groq model ID; defaults to `openai/gpt-oss-120b`, selected for the documented structured-output compatibility. | Never expose. |
| `GEMINI_API_KEY` | Server-only Gemini API key. | Never expose. |
| `GEMINI_API_KEYS` | Optional comma-separated Gemini credentials used for quota-aware rotation. | Never expose. |
| `GEMINI_API_URL` | Optional Gemini API origin; defaults to `https://generativelanguage.googleapis.com`. | Never expose. |
| `GEMINI_LLM_MODEL` | Optional Gemini model ID; defaults to `gemini-3.6-flash`, the currently available model returned by the authenticated API. | Never expose. |
| `HF_LLM_API_URL` | Optional Hugging Face text-router origin; defaults to `https://router.huggingface.co/v1`. | Never expose. |
| `HF_LLM_MODEL_PRIMARY` | Primary Hugging Face text model; defaults to `openai/gpt-oss-120b:fastest`. | Never expose. |
| `HF_LLM_MODEL_SECONDARY` | Secondary Hugging Face text model; defaults to `openai/gpt-oss-20b:fastest`. | Never expose. |
| `IMAGE_PROVIDER` | Set to `cloudflare_workers_ai` for the deployed Cloudflare Worker, `huggingface` for Hugging Face, or leave unset for the built-in provider. | Never expose. |
| `IMAGE_FALLBACK_PROVIDER` | Optional fallback image provider, currently `manus` when an external provider is temporarily unavailable. | Never expose. |
| `CLOUDFLARE_IMAGE_ENDPOINT` | Server-only URL for the Cloudflare Worker that accepts POST JSON and returns JPEG bytes. | Never expose. |
| `HF_TOKEN` | Server-only Hugging Face token with Inference Providers permission. | Never expose. |
| `HF_API_URL` | Optional Hugging Face router origin; defaults to `https://router.huggingface.co`. | Never expose. |
| `HF_IMAGE_MODEL` | Optional text-to-image model; defaults to `stabilityai/stable-diffusion-3-medium-diffusers`. | Never expose. |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Managed authentication configuration. | Only values explicitly prefixed with `VITE_` are available to the client. |

### Optional Groq BYOK configuration

StoryForge can use Groq directly through its OpenAI-compatible Chat Completions API without changing the storybook pipeline. In the project’s server-side Secrets configuration, set `LLM_PROVIDER=groq` and provide `GROQ_API_KEY`. Optionally set `GROQ_LLM_MODEL` to a valid Groq model ID; if the field is blank or contains a placeholder, StoryForge uses `openai/gpt-oss-120b`. The adapter sends the existing StoryForge messages to `https://api.groq.com/openai/v1/chat/completions`, overrides the Manus-only model identifier with the configured Groq model, and leaves story planning, character-bible generation, page outlining, manuscript writing, illustration prompts, image generation, persistence, retries, and PDF export unchanged. The key remains server-side and is never exposed to the React client.

Groq’s strict JSON Schema support is model-dependent. StoryForge’s current prompts and parsing remain unchanged, but choose a Groq model documented to support the JSON behavior required by the current pipeline. If Groq is not desired, omit `LLM_PROVIDER` or set it to another value to retain the built-in provider.

### Gemini provider configuration

Set `LLM_PROVIDER=gemini` to activate Gemini with the server-side `GEMINI_API_KEY`. Set `LLM_PROVIDER=huggingface` to use the Hugging Face text router with the server-side `HF_TOKEN`; StoryForge will try `HF_LLM_MODEL_PRIMARY` and then `HF_LLM_MODEL_SECONDARY` if the first model is unavailable. Set `LLM_PROVIDER=groq` to use Groq when valid Groq credentials are available. The adapter calls Gemini REST `generateContent`, maps existing StoryForge system/user messages into Gemini `systemInstruction` and `contents`, converts the existing OpenAI-style `outputSchema` into Gemini’s `responseSchema`, and normalizes Gemini candidates back into the existing `invokeLLM` response shape. The story planner, single-prompt inference, character bible, page outline, manuscript, editor rewrites, illustration prompts, image generation, persistence, retry behavior, and PDF export are unchanged. `GEMINI_LLM_MODEL` is optional; if omitted, the server uses `gemini-3.6-flash`.

When Gemini returns a confirmed daily/free-tier quota exhaustion response, StoryForge checks the configured Gemini pool, marks the failed key unavailable for a short cooldown, and tries the next healthy Gemini key. Only after the entire primary pool is unavailable does it attempt `LLM_FALLBACK_PROVIDER`. The default fallback is the built-in Manus provider, which requires no additional key. To use Groq as the fallback instead, set `LLM_FALLBACK_PROVIDER=groq` and provide valid Groq credentials. Fallback is not triggered for ordinary malformed requests. Authentication and forbidden responses are skipped per key, while other non-quota errors remain visible. If every pool is unavailable, StoryForge preserves the prompt as a safe draft and shows the Writing paused recovery state.

Provide multiple credentials through `GEMINI_API_KEYS` or `GROQ_API_KEYS` as comma-separated server-only values. Rotation provides redundancy; it does not combine quotas from keys belonging to the same provider project or bypass provider terms. Health checks happen as part of the first real generation request because a models endpoint can authenticate a key without proving that generation quota is available. Hugging Face uses one HF token with two model candidates rather than pretending that two model IDs create two separate quotas.

### Cloudflare Workers AI image provider configuration

Set `IMAGE_PROVIDER=cloudflare_workers_ai` and configure `CLOUDFLARE_IMAGE_ENDPOINT` with the deployed Worker URL. StoryForge sends each existing illustration prompt server-side as `POST { "prompt": "..." }`, accepts the Worker’s raw `image/jpeg` response, stores the returned bytes through the existing `storagePut()` flow, and returns the unchanged `{ url, key }` contract. No Cloudflare API key is required because the Worker handles Workers AI authentication internally. The adapter uses a 120-second timeout, retries transient 429/5xx/network failures with bounded exponential backoff, rejects invalid or empty image responses, and preserves page-level failure/retry status. When configured, `IMAGE_FALLBACK_PROVIDER=manus` can attempt the built-in provider after a temporary Cloudflare failure. The existing bounded illustration batches, progress tracking, layout, and PDF export remain unchanged.

### Hugging Face image provider configuration

Set `IMAGE_PROVIDER=huggingface` to route only image generation through Hugging Face. Provide `HF_TOKEN` with Inference Providers permission; the token remains server-side. The adapter calls the configured model through `https://router.huggingface.co/hf-inference/models/{model}`, sends the existing StoryForge prompt, accepts raw image bytes, stores them through the existing `storagePut()` flow, and returns the same `{ url, key }` contract. The existing bounded illustration batches, page-level retries, progress tracking, layout, and PDF export are unchanged. The default model is `stabilityai/stable-diffusion-3-medium-diffusers`; override it with `HF_IMAGE_MODEL` only when that model is available to the account. Hugging Face Inference Providers include limited account credits and are not guaranteed to provide unlimited free image generation.

## Local development

Install dependencies with `pnpm install`, then start the app with `pnpm dev`. Run `pnpm check` for TypeScript validation and `pnpm test` to exercise the authentication guard, single-prompt inference and creation contract, character/prompt construction, and PDF composition. The managed runtime configures its database, authentication, storage, and built-in generation credentials automatically.

## Activating live generation

No external credentials are needed. To use live generation, ensure the project is opened within the managed environment where the injected built-in service credentials are present, sign in, enter one prompt on **Create book**, and select **Generate book**. StoryForge infers the hidden book configuration, creates text and character structure, then returns a resumable illustration job. Progress is persisted through the exact visible stages **Creating characters…**, **Writing pages…**, and **Creating illustrations…**.

## Export behavior

The export control is enabled only after a cover and every story-page illustration are ready. It creates an actual 864×648 landscape PDF document on the server, containing a cover, title page, adaptive art-and-reading layouts, story text, page numbers, and a back cover; it does not export a browser or dashboard screenshot.

## Known operational constraints

Each illustration request can take time and is intentionally represented as a real generation state rather than fabricated percentage progress. The current hosted runtime has request limits, so especially long books should be generated page-by-page after the manuscript is created if a single session is interrupted. Completed manuscript data and already generated images remain stored and can be retried individually.

## Single-prompt automation contract

The supported creation entry point is `books.generateFromPrompt`, which accepts only `{ prompt: string }`. The server uses the built-in LLM to infer the title, audience, genre, tone, moral, page count, language, visual direction, story structure, characters, scenes, narration, ending, and illustration requirements before running the existing manuscript pipeline. It returns `{ bookId, jobId, pageCount, metadata }` after the manuscript and page records are persisted.

Illustrations remain a resumable job because each built-in image request can be long-running and the managed runtime is request-bounded. An automation agent should poll `books.get({ bookId })`, read the latest job’s `status`, `currentStage`, and `progressMetadata`, and call `books.processNextIllustration({ bookId, jobId })` until it returns `done: true`. This continuation creates the cover and page illustrations in small persisted batches, preserves completed work, and supports safe retry after transient failures. When the image service reports exhausted access, the job becomes paused/failed with the story content retained rather than retrying indefinitely.

This contract keeps the user-facing experience to exactly one prompt while giving later agents one creation input plus a stable job identifier and resumable continuation procedure. The editor automatically follows the same contract for human authors.

## Generation performance architecture

The measured bottleneck is illustration generation, not story quality or page planning. The story plan, character bible, page outline, and manuscript remain intentionally dependency-ordered because each stage consumes the previous stage’s structured output; the character bible is generated once and reused in every illustration prompt. Illustration work now selects up to four pending pages per persisted job cycle and runs those independent provider calls concurrently with `Promise.allSettled`. A transient provider failure retries only its page with exponential backoff; exhausted-service and other non-retryable failures pause the job without discarding completed pages.

`books.processNextIllustration({ bookId, jobId })` is the resumable queue step. It returns the persisted completion count and `done` state, so a future automation agent can submit one prompt, poll `books.get`, and continue queued illustration batches without regenerating the manuscript, character bible, page outline, or completed images. The editor refreshes at a measured interval rather than refetching after every batch, and progress metadata reports story, character bible, illustration count, book assembly, and quality-check states. Book assembly and quality check remain explicitly unstarted until the printable export path performs those operations; no progress is fabricated.

The illustration wave size is controlled by the optional server setting `STORYFORGE_ILLUSTRATION_CONCURRENCY`. It is clamped to a safe range of 1–4 and defaults to 4; this changes only how many independent page requests are in flight, not the prompt, model, image resolution, or book quality. If provider capacity is lower, set it to 2 or 1 without changing the rest of the pipeline.
