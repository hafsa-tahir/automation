# Project TODO

- [x] Define shared StoryForge domain types for books, characters, pages, media assets, generation jobs, and export records.
- [x] Create secure database tables and foreign-key relationships for books, characters, pages, generated images, generation jobs, and exports.
- [x] Add ownership-scoped database helpers and protected tRPC procedures so users can only access their own books and related data.
- [x] Implement provider abstractions backed solely by the platform built-in LLM and built-in image-generation service.
- [x] Implement validated multi-stage story generation: planner, character bible, page outline, full page text, and illustration prompts.
- [x] Persist generation job states and exact stage labels: Creating characters…, Writing pages…, Creating illustrations….
- [x] Implement asynchronous illustration generation with secure S3-compatible per-user/book/page storage keys and retryable failures.
- [x] Build a premium warm, editorial, and magical public landing page with the exact hero headline and animated calls to action.
- [x] Build authenticated dashboard book cards with exact statuses Draft, Generating, Ready, and Exported plus Open, Edit, Duplicate, and Delete actions.
- [x] Build the six-step creation wizard for story idea, book settings, character builder, visual style, title, and review.
- [x] Build an editor that saves story text, layout, image placement, text settings, and background choices on individual pages.
- [x] Add real server-side rewrite commands and illustration regeneration to the book editor.
- [x] Build accessible book preview with cover/page navigation, reading mode, fullscreen control, and zoom.
- [x] Implement server-side printable PDF book export containing cover, title page, story pages, page numbers, and back cover.
- [x] Add clear configuration/setup states without representing unavailable AI generation as completed work.
- [x] Document application architecture, required environment variables, operational limitations, and activation steps in README.md.
- [x] Add and run Vitest coverage for protected data access, story-plan validation, generation state changes, page persistence, and PDF composition.
- [x] Verify desktop and mobile layouts, inspect server/browser logs, and capture visual verification screenshots.
- [x] Persist and validate separate LLM planner and page-outline stages before full manuscript generation.
- [x] Refactor illustration generation into persisted job processing with polling-based progress refresh and retry support.
- [x] Add editor controls for image position, image size, and text position, then persist and verify each field.
- [x] Add a dedicated reader-mode control and keyboard-accessible navigation feedback to the book preview.
- [x] Add clear user-facing unavailable-service states for generation or storage configuration failures.
- [x] Extend Vitest coverage for generation job state transitions and ownership-scoped page persistence.
- [x] Add persistence-level test coverage for saving and reloading image position, image size, and text position.
- [x] Add an explicit user-facing storage configuration state for export and media persistence failures.
- [x] Add ownership-scoped page read and update tests that prove cross-user access is rejected.
- [x] Add an integration-style tRPC page composition save-and-reload round-trip test using the same update and read procedures as the editor.
- [x] Add an integration-style tRPC cross-user page read and update test with ownership-separated fixture records.
- [x] Extract non-infringing children’s-book structure and layout principles from the supplied PDF reference.
- [x] Expand the book/page model for landscape orientation, adaptive composition selection, print-safe margins, and story-specific page treatments.
- [x] Enhance story planning and page outlining so each scene supplies a professional layout recommendation tied to narrative action and text density.
- [x] Update the character bible contract with face characteristics, body proportions, shoes, and persistent illustration descriptions.
- [x] Rebuild the editor and reader around landscape page spreads with full-bleed artwork, independent reading areas, adaptive layouts, and consistent folio treatment.
- [x] Update printable PDF export to use the same landscape composition system rather than portrait web-page proportions.
- [x] Add tests for layout recommendation validation, landscape export dimensions, and character-bible completeness.
- [x] Re-verify desktop and mobile responsive states plus the reader/export composition contracts against the original non-infringing design principles.
- [x] Verify the live landscape reader route on desktop and mobile with a finished book record.
- [x] Inspect a rendered landscape PDF export to confirm its visual page composition matches the new design system.
- [x] Investigate reported slow end-to-end book generation and identify the dominant waiting stages from runtime evidence.
- [x] Reduce avoidable client-side generation delay while preserving resumable, persistent illustration jobs.
- [x] Add clear progress guidance that distinguishes planning, manuscript writing, and per-page illustration work.
- [x] Test the revised generation orchestration and report practical timing expectations to the user.
- [x] Mark exhausted built-in image-generation jobs as failed with a clear retry/support state instead of leaving them in processing.
- [x] Inspect the reported failed illustration record and identify its exact persisted failure cause.
- [x] Ensure failed page-level illustration retries provide the correct recovery guidance without discarding story content.
- [x] Validate the page-level recovery state and report the next safe action.
- [x] Disable direct per-page illustration retries while the latest job reports exhausted image-service availability.
- [x] Add server-side exhausted-service guarding for direct page illustration requests.
- [x] Add test coverage for the exhausted-service retry guard and unified recovery guidance.
- [x] Add router-level coverage proving direct page illustration generation rejects an exhausted service with the shared recovery message.
- [x] Add shared recovery-path coverage for both batched and direct illustration attempts against the same paused-state guidance.
- [x] Add router-level coverage proving batched illustration processing returns the same exhausted-service recovery message as direct page retries.

- [x] Replace the multi-step creation wizard with one required story-prompt input labeled "What story do you want to create?".
- [x] Add automatic AI inference for title, audience, complexity, structure, characters, setting, tone, ending, metadata, and illustration requirements from the single prompt.
- [x] Preserve existing story generation, illustration, landscape layout, editing, preview, and export behavior after the simplified input flow.
- [x] Add a single-prompt backend/API contract suitable for future automation agents without requiring separate configuration fields.
- [x] Add tests for single-prompt validation, inferred defaults, and programmatic generation request handling.
- [x] Verify the simplified creation UI on desktop and mobile, then save a checkpoint.


- [x] Add a server-side single-prompt generation procedure that creates the book and starts the manuscript/illustration job flow without relying on BookEditor auto-start.
- [x] Add router/integration tests proving the one-prompt API starts a generation workflow and returns the created book and job identifiers.
- [x] Verify the single-prompt flow through generation start, editor load, preview, and export behavior without altering existing user books.
- [x] Save a new checkpoint after the verified single-prompt implementation.


- [x] Document the backend’s resumable illustration-job contract for automation agents, including the single-prompt request, job identifier, polling, and per-step illustration continuation.
- [x] Add a focused test proving the single-prompt generation response exposes the resumable illustration job state and continuation contract.
- [x] Verify the created-book editor and reader handoff using the new server-side generation response without invoking exhausted live image generation.

- [x] Add explicit test assertions for generateFromPrompt job progress metadata and continuation with processNextIllustration.
- [x] Add a router handoff test that reloads the generated book by returned bookId for editor and preview navigation.
- [x] Save a checkpoint after the single-prompt workflow evidence is complete.

- [x] Add a preview-route handoff assertion that derives `/books/{bookId}/preview` from the single-prompt generation response.

- [x] Inspect the failing books insert schema contract and identify which inferred fields exceed database limits or violate nullability/type expectations.
- [x] Normalize single-prompt inferred metadata before persistence without losing the prompt or core story direction.
- [x] Add regression tests for long inferred visual/style metadata and successful book creation from the provided prompt shape.
- [x] Run the corrected insert path and save a checkpoint.

- [x] Measure current stage timings and request concurrency for story planning, character bible, page outline, manuscript, illustrations, assembly, quality check, and PDF export.
- [x] Identify unnecessary sequential waits, duplicate AI requests, polling overhead, and provider-safe concurrency limits from the current implementation.
- [x] Define a persistent queue/job contract with truthful stage progress and automation-safe polling.
- [x] Implement safe parallel page illustration processing with per-page retries and exponential backoff.
- [x] Reuse cached story plan, page outline, character bible, and image prompts without lowering quality.
- [x] Add real-time progress for Story, Character Bible, Illustrations, Book Assembly, and Quality Check.
- [x] Add performance and failure-recovery tests, then compare measured behavior against the current baseline.
- [x] Save a checkpoint after the optimized generation flow is verified.

- [x] Record baseline and optimized stage timing/concurrency evidence from real request logs or a documented runtime benchmark.
- [x] Make illustration concurrency configurable with a safe provider-friendly default and document the chosen limit.
- [x] Advance book assembly and quality-check progress only when their real export operations run, including resumed-job refresh behavior.
- [x] Add a measured regression comparison against the prior two-page illustration flow.
- [x] Save a new checkpoint after these measured verification gaps are resolved.

- [x] Instrument real text, illustration-batch, assembly, quality-check, and export stage durations in persisted job metadata.
- [x] Mark Book Assembly as started before PDF composition and Quality Check only after PDF validation/storage succeeds.
- [x] Add a deterministic wave-count regression benchmark for the old two-page and new configurable illustration queue.
- [x] Save the fresh optimization checkpoint after the instrumentation and export-stage verification pass.

- [x] Persist illustration-batch duration for each completed queue wave.
- [x] Persist a distinct export/storage duration for the printable-book export stage.
- [x] Save a checkpoint after the complete optimization instrumentation pass.

- [x] Persist a distinct `export` timing entry alongside assembly and quality-check durations.
- [x] Add regression coverage for the distinct export timing metadata.
- [x] Save the final optimization checkpoint.

- [x] Inspect the exhausted LLM failure path and persisted text-generation job state.
- [x] Normalize exhausted LLM errors into a paused/retryable state without discarding story text or completed illustrations.
- [x] Prevent repeated unavailable-service retries and show clear recovery guidance in the editor.
- [x] Add regression coverage and save a checkpoint after validation.
- [x] Block the empty-state Generate storybook CTA while the LLM service is paused.
- [x] Add a deliberate retry action for LLM-paused books that can be used after service access is restored.
- [x] Add UI/state regression coverage for the paused LLM recovery flow.
- [x] Save a checkpoint after the recovery flow is validated.

- [x] Confirm Groq’s OpenAI-compatible API contract and StoryForge’s current LLM abstraction.
- [x] Add server-side Groq provider configuration with a securely managed GROQ_API_KEY and provider/model settings.
- [x] Preserve all existing story prompts, structured parsing, generation stages, image generation, and recovery behavior.
- [x] Add provider-selection regression tests and verify the full test suite and TypeScript build.
- [x] Document exact configuration and save a checkpoint.
- [x] Add a live Groq chat-completions regression test using the existing JSON response contract.
- [x] Confirm the configured Groq model supports the response mode used by StoryForge without changing pipeline stages or prompts.
- [x] Save a final checkpoint after live provider verification.
- [x] Close Groq credential validation as externally blocked: supplied keys consistently return Groq’s exact generic `{"error":{"message":"Forbidden"}}` response with HTTP 403; Gemini remains the validated active provider.
- [x] Make `GROQ_LLM_MODEL` optional in the secure-entry request and use the real default `openai/gpt-oss-120b` when omitted.
- [x] Close the Groq optional-model follow-up as externally blocked; the optional model configuration is implemented, but live Groq authentication remains unavailable and is not required for the active Gemini provider.

- [x] Add secure Gemini API-key configuration without exposing the key to the client.
- [x] Validate Gemini authentication and preserve the existing storybook generation pipeline.
- [x] Document Gemini provider settings and save a checkpoint if the provider is enabled successfully.

- [x] Route StoryForge server-side LLM calls through Gemini when `LLM_PROVIDER=gemini`.
- [x] Preserve existing prompts, JSON-schema parsing, generation stages, image generation, recovery behavior, and PDF export.
- [x] Add live Gemini chat and provider-routing regression tests, then run the full suite.
- [x] Document Gemini activation and save a checkpoint.

- [x] Evaluate Pollinations endpoint compatibility and current StoryForge image-generation boundary (endpoint requires authentication; not selected).
- [x] Close Pollinations integration as not selected: the official endpoint required authentication and Hugging Face successfully met the image-provider requirement.
- [x] Validate one generated image and the unchanged illustration recovery flow using the selected Hugging Face provider.
- [x] Document the selected provider and save a checkpoint after successful validation.

- [x] Evaluate Google Imagen image endpoint and current StoryForge image-generation boundary (superseded: native Gemini image quota was 0).
- [x] Close Imagen integration as blocked/not selected: Google returned HTTP 429 with image quota 0, so Hugging Face was selected instead.
- [x] Close Imagen validation as blocked by Google’s HTTP 429 image quota response; the selected Hugging Face provider was validated through the unchanged page/job recovery flow instead.
- [x] Document the selected image-provider route and save a checkpoint after Hugging Face recovery validation.

- [x] Check Hugging Face Inference API image endpoint access and free-tier requirements.
- [x] Run one Hugging Face image-generation request and inspect returned image bytes.
- [x] Report whether Hugging Face is viable for StoryForge image generation without changing the pipeline.

- [x] Inspect the active image/LLM provider configuration and latest generation errors.
- [x] Reproduce the failure through the single-prompt book-generation flow.
- [x] Apply the smallest safe fix and add dedicated auto-resume regression coverage.
- [x] Verify the recovered flow: the live editor resumed incomplete illustrations and displayed completed artwork; save a checkpoint.
- [x] Resume illustration processing automatically when `generateFromPrompt` returns a processing job, so the editor does not stop after manuscript creation.

- [x] Inspect the latest manuscript failure and active Gemini provider response.
- [x] Reproduce the manuscript failure through the actual router book-generation procedure using the exact observed Gemini 429 quota payload.
- [x] Replace the generic manuscript failure with specific Gemini-quota recovery handling and add regression coverage.
- [x] Verify manuscript recovery handling through persisted paused-state regression coverage; live Gemini retry remains blocked until its quota cooldown/access returns, then save a checkpoint.

- [x] Inspect the current reader, cover presentation, and supplied reference behavior.
- [x] Add realistic left/right page-turn navigation with click targets, keyboard controls, and reduced-motion support.
- [x] Improve the completed-book cover presentation and add purchase-oriented product details without changing PDF composition.
- [x] Verify desktop/mobile reader behavior, add regression coverage, and save a checkpoint.
- [x] Make live Gemini/Hugging Face smoke tests report quota-unavailable as an explicit skipped validation instead of failing unrelated UI checkpoints.

- [x] Stop automatic LLM retries for provider-reported Gemini daily/free-tier quota exhaustion and preserve exact cooldown guidance.
- [x] Add regression coverage proving quota-exhausted 429 responses make one upstream request and enter the existing Writing paused recovery state.
- [x] Verify the fix with the full test suite and save a recovery checkpoint.

- [x] Add configurable automatic LLM fallback that activates only after confirmed Gemini quota exhaustion.
- [x] Preserve existing prompts, structured outputs, generation stages, and paused-state behavior when fallback is unavailable or fails.
- [x] Add fallback routing tests, verify the full suite, and save a checkpoint.

- [x] Diagnose why the running StoryForge instance still surfaces Gemini quota exhaustion after fallback was implemented.
- [x] Make fallback activation and provider status observable, and fix any configuration or runtime gap without losing drafts.
- [x] Validate both fallback success and fallback-failure paused recovery, then save a checkpoint.

- [x] Add secure multi-key configuration for Gemini and Groq provider pools without exposing credentials to the client.
- [x] Check provider keys at prompt submission, skip keys marked exhausted or unauthorized, and select a healthy key before starting story generation.
- [x] Persist short cooldowns and provider-selection diagnostics without storing raw keys or leaking them in errors.
- [x] Add rotation tests, preserve safe draft recovery, and save a checkpoint.

- [x] Select two currently available Hugging Face text-model/provider combinations suitable for StoryForge structured generation.
- [x] Add secure Hugging Face text-model configuration alongside existing Gemini, Groq, and image settings.
- [x] Add both Hugging Face text models to quota-aware provider rotation without changing prompts, images, or PDF output.
- [x] Validate structured output and provider fallback behavior, then save a checkpoint.

- [x] Treat Hugging Face HTTP 402 monthly-credit exhaustion as a temporary provider-unavailable state and preserve fallback recovery.
- [x] Record the live validation result that both selected HF text models returned 402 because included credits are depleted; do not claim a successful generation smoke test.

- [x] Identify the user’s existing GitHub repository and verify the current StoryForge working tree and remote branch.
- [x] Configure safe automatic commit/push behavior without committing secrets, logs, local assets, or generated artifacts.
- [x] Commit and push the complete current StoryForge codebase, then verify the remote branch and commit contents.

- [x] Treat Hugging Face image HTTP 402 monthly-credit exhaustion as a provider-unavailable state without losing completed illustrations.
- [x] Add or verify a safe image-provider fallback path that can resume only incomplete pages.
- [x] Add regression coverage for image fallback, paused recovery, and resumable page continuation, then save a checkpoint.

- [x] Distinguish dual image-provider exhaustion from a single-provider failure in the shared recovery message.
- [x] Show clear guidance that immediate retries will not help until at least one image provider’s access is restored.
- [x] Add regression coverage for the combined Hugging Face and built-in image-service exhaustion error, then checkpoint the fix.

- [x] Add Cloudflare Worker as the active server-side image provider using the configured public endpoint and no client secret.
- [x] Preserve existing illustration prompts, S3 storage, bounded retries, concurrency, page status, and fallback behavior while bypassing slow built-in generation when Cloudflare is selected.
- [x] Run a real Worker JPEG smoke test and StoryForge image-path regression coverage, then save a checkpoint.

- [x] Add a dedicated visual-only Cloudflare illustration prompt compressor with a hard 1,800-character safety limit.
- [x] Retry the specific Cloudflare prompt-length error once after compression, while retrying only temporary 429/5xx/timeouts with bounded backoff.
- [x] Remove automatic Manus image fallback when Cloudflare is active and preserve page-level failed status plus specific retry behavior.
- [x] Run a real Cloudflare test, record exact prompt length, prove Manus was not called, and save a checkpoint.

- [x] Replace card-like reader transitions with a realistic bound-book spread turn using physical page depth, spine, shadows, and direction-aware motion.
- [x] Increase generated page content within the existing age-appropriate story contract without placing text inside illustrations.
- [x] Verify official Cloudflare Workers AI free limits, distinguish request limits from compute/credit limits, and estimate book capacity from actual image usage.
- [x] Add reader/content regression coverage, run full validation, and save a checkpoint.

- [x] Identify the active text provider, configured pool keys/models, and exact runtime failure causing manuscript drafts to pause.
- [x] Ensure Gemini, Groq, and Hugging Face text candidates are tried only when configured and healthy, with accurate no-provider guidance.
- [x] Add regression coverage for successful provider fallback and safe draft preservation, then run validation and save a checkpoint.

- [x] Inspect the latest live manuscript failure after the empty-content fix and identify the active provider/model response.
- [x] Restore a working manuscript path or surface an exact actionable credential/model error instead of a generic pause.
- [x] Validate the real prompt-to-manuscript path, preserve safe drafts, and checkpoint the result.

- [x] Verify the deployed active LLM provider and fallback provider instead of assuming the fallback is usable.
- [x] Configure the first provider with a confirmed working credential/model, or return a precise secure-entry requirement if none is available.
- [x] Test a real prompt-to-manuscript completion after provider selection and save a checkpoint.

- [x] Verify whether GEMINI_API_KEYS and GROQ_API_KEYS secure values are present in the project runtime without exposing key contents.
- [x] Fix any mismatch between secure-entry storage, environment mapping, and provider-pool construction for plural keys.
- [x] Validate that all entered candidates are counted and attempted in order, then save a checkpoint.

- [x] Add a secure OpenRouter API-key entry box and server-side environment mapping.
- [x] Validate the key through the existing OpenAI-compatible provider boundary before enabling OpenRouter rotation.

- [x] Test the secure OpenRouter value through the actual chat-completions endpoint, not only the models listing endpoint.
- [x] Distinguish a network/security-layer block from an invalid key or model response and document the exact result.
- [x] Enable OpenRouter only after a successful chat response, then run provider-pool validation and checkpoint the result.

- [x] Replace the unsupported free OpenRouter model slug with the provider-recommended `openai/gpt-oss-120b` model.
- [x] Add OpenRouter to secure server-side provider routing and ordered fallback configuration.
- [x] Validate real structured JSON chat output through OpenRouter and run the complete StoryForge suite.

- [x] Resolve exact OpenRouter IDs and availability for Gemma 4 and OpenAI: NVIDIA: Nemotron 3 Ultra.
- [x] Replace the current OpenRouter model configuration with the verified requested model candidates.
- [x] Test both requested models through structured chat completions and run regression validation.

- [x] Reproduce the story-generation request that returns `Unexpected token '<'` and capture its HTTP status, URL, and content type.
- [x] Trace the HTML response to the incorrect route, dev-server fallback, or backend error source.
- [x] Fix the root cause, add regression coverage, and verify story generation returns JSON.

- [x] Reproduce the `GEMINI provider has no healthy keys` state and inspect the configured fallback order.
- [x] Ensure an exhausted or cooled-down Gemini pool advances to the validated OpenRouter model pool.
- [x] Add regression coverage for no-healthy-key fallback and validate the full generation recovery path.

- [x] Reproduce the reader spread with clipped text, center-spine overlap, and the right page pushed off-screen.
- [x] Fix landscape spread geometry and contain story text within each page leaf.
- [x] Add reader layout regression coverage and verify desktop/mobile screenshots.

- [x] Refine the reader to keep the book fixed while right-click turns the right leaf forward and left-click turns the left leaf backward around the center spine.
- [x] Verify page turns stay contained within the book frame and preserve keyboard navigation.

- [x] Reproduce the malformed JSON control-character failure and identify the exact parser boundary.
- [x] Recover safely from raw control characters in provider JSON while retaining strict schema validation.
- [x] Add regression coverage and verify malformed provider output advances to a healthy fallback instead of pausing the book.

- [x] Inspect the latest paused book and identify each attempted provider, error class, and fallback result.
- [x] Distinguish external quota/rate-limit constraints from remaining StoryForge routing or parsing defects.
- [x] Improve user-facing provider-attempt diagnostics and safe retry guidance for the observed failure.

- [x] Inspect why Gemini remains selected in the active runtime despite configured OpenRouter models.
- [x] Make OpenRouter Gemma 4 and Nemotron the only default manuscript providers, with Gemini excluded unless explicitly enabled.
- [x] Verify a fresh generation request no longer pauses on Gemini no-healthy-key status.

- [x] Validate only the exact user-selected OpenRouter key through one real chat-completions request.
- [x] Confirm the selected key’s configured Gemma 4 and Nemotron model result without switching text providers again.

- [x] Reuse the already stored OpenRouter credential without requesting another key entry, and report its safe provider label plus real chat result.

- [x] Identify the manuscript stage that received structurally malformed OpenRouter JSON with a missing property colon.
- [x] Retry irreparable structured-output parsing failures through the next OpenRouter model before pausing the book.
- [x] Add regression coverage for malformed JSON structure and validate the OpenRouter stage-recovery path.

- [x] Reproduce the current narrow center text strip, off-screen right page, and incorrect reader geometry shown in the user screenshot.
- [x] Rebuild the reader as a fixed two-leaf landscape book with a true center-spine pivot and no clipped or displaced pages.
- [x] Verify left/right page-turn containment against the supplied reference on desktop and mobile.

- [x] Reproduce the four-column-looking leaf composition, oversized text, bottom clipping, and heavy center divider in the latest reader screenshot.
- [x] Redesign each visible landscape leaf as one complete page surface with contained copy, illustration balance, and a thin spine.
- [x] Verify a full reading spread and directional turns on desktop and mobile without clipped text or extra internal columns.

- [x] Map each stored story page to one open spread with its illustration-only left leaf and text-only right leaf.
- [x] Replace the current two-story-page spread with the requested one-scene-per-spread reader markup and styling.
- [x] Upgrade the turn animation to a physical center-spine paper leaf with depth and moving shadows.
- [x] Verify next/previous scene spreads and desktop/mobile containment against the supplied reference behavior.

- [x] Identify the bright center-spine and leaf-edge styling responsible for the white vertical stripe.
- [x] Replace the white binding stripe with a thin, soft natural paper crease.
- [x] Verify the refined spine on a full scene spread without affecting page turns.

- [x] Identify every center-spine and leaf-edge overlay that still creates a visible vertical line.
- [x] Remove all visible center line styling while preserving the illustration-left/text-right page meeting and turns.
- [x] Verify a seamless scene spread on desktop and mobile.

- [x] Inspect the uploaded Tavi PDF and document its visual pagination/layout defects.
- [x] Trace the PDF renderer’s current page model and identify why it differs from the corrected reader scene layout.
- [x] Export one scene per illustration-left/text-right spread and verify the rendered PDF pages.

- [x] Inspect the current reader shell against the reference’s cover, page-stack, gutter, perspective, and shadow cues.
- [x] Rebuild the reader as a dimensional open book with visible cover thickness, page edges, recessed gutter, and cast shadow.
- [x] Replace the flat turn with a curved two-sided paper leaf that pivots around the spine and casts moving shadows.
- [x] Verify the 3D book form and next/previous motion on desktop and mobile.

- [x] Refine the cover page so its title treatment feels intentionally composed within the physical book shell.
- [x] Increase desktop reading-spread type size and improve line spacing, column width, and illustration-to-copy separation.
- [x] Preserve a legible, balanced mobile text layout after the typography changes.
- [x] Add regression coverage and visually verify the refined cover and reader typography.

- [x] Inspect why the current book cover renders only the brown fallback instead of the generated artwork.
- [x] Render a real full-bleed cover image, falling back to the first completed scene illustration when no dedicated cover image exists.
- [x] Preserve legible title, author, and cover-stamp contrast over generated artwork.
- [x] Add regression coverage and visually verify the corrected cover image path.

- [x] Inspect the current reader’s cover thickness, page-stack layers, perspective, and cast-shadow cues.
- [x] Strengthen the 3D physical-book form with a thicker dimensional cover, layered page edges, and a clearer table-level cast shadow.
- [x] Preserve the illustration-left/text-right spread, cover art, controls, and mobile reader behavior.
- [x] Add regression coverage and visually verify the enhanced 3D book effect.

- [x] Audit the current StoryForge generation, export, and asset outputs for automation-ready handoff.
- [x] Verify the current supported publishing paths and requirements for Etsy, Gumroad, and AWS-hosted distribution.
- [x] Design at least two safe automation approaches, including an approval step before public listing publication.
- [x] Plan the selected implementation with secure credential handling, status tracking, and retry-safe publishing jobs.

- [x] Validate the daily-agent model against the user’s persistent authenticated browser sessions and scheduled-run constraints.
- [x] Define browser-driven flows for StoryForge generation, Etsy/Gumroad/AWS upload, and per-platform sales collection.
- [x] Add a dashboard data model for daily books, upload outcomes, listing URLs, sales, revenue, retries, and browser-session health.
- [ ] Implement a controlled 9:00 AM browser-first daily publishing agent after the user confirms the publishing and failure rules.

- [x] Design daily batch capacity for 3–4 StoryForge books beginning at 9:00 AM Pakistan time.
- [x] Add an LLM prompt-agent contract that generates original, commercially appropriate children’s-story prompts from a persistent system prompt.
- [x] Assess free Google VM resources and ChatGPT Pro’s practical role in the browser-first automation stack.
- [x] Define the single daily public-publishing confirmation gate required before the batch makes marketplace listings live.

- [x] Select the appropriate Google Cloud service for the persistent authenticated browser worker and document why it fits the daily publishing workload.
- [x] Define the Compute Engine worker, scheduler, encrypted browser-profile, storage, and dashboard handoff architecture.

- [x] Verify whether self-hosted n8n can serve as a free manually started orchestrator for the StoryForge browser-publishing batch.
- [x] Compare local self-hosted n8n with hosted n8n and a persistent browser worker, including cookie persistence and browser-runtime requirements.
- [x] Define the first manual n8n workflow: prompt creation, StoryForge generation wait, package export, upload preparation, and dashboard update.

- [x] Compare Etsy, Gumroad, and direct AWS delivery by account setup, digital-product upload complexity, browser automation stability, and sales visibility.
- [x] Select a first marketplace and define the staged rollout order for browser automation.

- [x] Research additional digital-product and self-publishing platforms that can distribute StoryForge PDF books.
- [x] Compare each candidate’s setup friction, PDF product fit, payout availability, and browser automation practicality.
- [x] Define a phased distribution order beyond Gumroad, Etsy, and AWS delivery.

- [x] Define a reusable sales package for the selected Gumroad and Payhip storefronts: PDF, cover, title, description, price, tags, and product metadata.
- [x] Design the first manually started browser workflow that prepares Gumroad and Payhip listings from one finished StoryForge book.
- [x] Add dashboard records, idempotency keys, and retry states for Gumroad and Payhip publishing attempts.

- [x] Audit every active LLM and image-generation provider, key source, and fallback route for built-in service usage.
- [x] Enforce BYOK-only generation so story prompts, manuscript writing, cover/page illustration, and future automation never silently use built-in provider keys.
- [x] Expose user-owned provider health and the active provider in the dashboard without revealing credentials.
- [x] Add regression coverage proving the system pauses safely rather than falling back to a built-in provider when user-owned keys are unavailable.

- [x] Record the user’s confirmation that the active Cloudflare Workers AI endpoint is their configured image provider.
- [x] Revalidate the locked OpenRouter text route and configured Cloudflare image route without exposing credentials.
- [x] Publish the final provider-routing status for the upcoming Gumroad and Payhip automation work.

- [x] Audit existing StoryForge book, export, and dashboard fields to define the reusable Gumroad/Payhip sales-package contract.
- [x] Add database records for publishing packages, Gumroad/Payhip listing attempts, idempotency keys, and daily sales snapshots.
- [x] Add protected backend procedures for creating a package, recording a storefront result, and summarizing daily publishing activity.
- [x] Build a manual publishing command center showing prepared books, per-storefront upload status, listing links, and daily sales totals.
- [x] Add regression coverage, visually verify the dashboard, and document the handoff contract for the future local n8n browser workflow.

- [x] Trace the current saved-draft prompt-inference failure through the active OpenRouter provider response and generation error mapping.
- [x] Replace the vague saved-draft writing failure message with provider-specific quota/retry guidance that does not expose credentials.
- [x] Add regression coverage and validate the corrected provider-limit recovery path.

- [x] Audit the active BYOK fallback order and provider health state after OpenRouter free-model exhaustion.
- [x] Enable configured user-owned Groq, Hugging Face, or Gemini providers to handle text generation only when OpenRouter is exhausted.
- [x] Preserve BYOK-only policy and show precise fallback/retry guidance without exposing credentials.
- [x] Add regression coverage and validate the multi-provider failover path.

- [x] Define a BYOK prompt-agent system prompt and persistent prompt-brief record for 3–4 original children’s-story ideas per Pakistan-time batch.
- [x] Add prompt originality safeguards that compare new themes, protagonists, and settings with previous generated briefs.
- [x] Add protected procedures to prepare, review, and consume a prompt brief for manual StoryForge generation.
- [x] Extend the Publishing command center with a manual prompt-batch preparation view and document its local n8n handoff.

- [ ] Verify one selected prompt brief can produce a finished book and a ready internal Gumroad/Payhip sales package.
- [ ] Confirm the user’s logged-in Gumroad and Payhip browser profile is ready for the first manual storefront test.
- [ ] Run one controlled publishing-preparation test without making any public listing live.
- [ ] Record the test outcome, listing links if any, and the browser-worker next steps in the Publishing command center.

- [x] Trace the strict story-outline page-count check that paused the current 12-page generation after a 10-page provider response.
- [x] Repair short story outlines to the requested page count, or retry the planning stage through the next user-owned provider before pausing.
- [x] Preserve scene sequencing, title/metadata consistency, and truthful progress while repairing an outline.
- [x] Add regression coverage and validate the exact 10-page-for-12-page recovery path.

- [x] Trace the Cloudflare 4006 daily-neuron exhaustion path through image-provider classification and paused-job persistence.
- [x] Show a precise user-owned Cloudflare daily-allocation pause message with safe retry guidance and no built-in fallback implication.
- [x] Preserve completed illustration pages and add regression coverage for the Cloudflare 4006 recovery path.

- [x] Treat Groq JSON-schema validation rejections as a skippable BYOK provider failure and continue to the next configured text provider.
- [x] Add regression coverage for Groq structured-output rejection and verify the fallback chain preserves the saved draft.

- [x] Reconcile the prior Cloudflare free-tier books-per-day estimate with the observed 10,000-neuron exhaustion response and available generation evidence.
- [x] Publish a conservative, evidence-based daily book target that distinguishes estimates from Cloudflare allocation guarantees.

- [x] Verify a newly received Cloudflare 4006 failure renders the precise StoryForge pause guidance instead of raw provider JSON.
- [x] Correct the first-failure display path and add regression coverage if the raw provider error can still reach the editor.

- [x] Verify the specified GitHub repository and synchronize it with the current StoryForge source version.
- [x] Add robust environment-file exclusions to `.gitignore` and confirm no secrets are staged or committed.
