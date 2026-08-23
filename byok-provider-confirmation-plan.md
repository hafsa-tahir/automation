# StoryForge BYOK Provider Confirmation Plan

## Goal

Confirm, document, and lock the user-owned provider configuration that StoryForge will use before building the Gumroad/Payhip publishing automation. The system must use only user-controlled text and illustration services, must never silently fall back to a built-in generation service, and must clearly report its active provider without exposing credentials.

## Current Known Configuration

| Capability | Current active route | Current model or service | Built-in fallback status |
|---|---|---|---|
| Story planning, manuscript writing, and future prompt-agent work | OpenRouter | Gemma 4 first; NVIDIA Nemotron 3 Ultra second | Disabled |
| Page and cover illustration generation | Cloudflare Workers AI endpoint | Cloudflare-hosted image-generation worker | Disabled |
| Alternative text providers retained as user-key options | Groq, Gemini, Hugging Face | Provider-specific configured models | Disabled unless explicitly selected with a user key |
| Alternative image provider retained as a user-key option | Hugging Face | Configured Hugging Face image model | Disabled unless explicitly selected with the user token |

The application has already been changed to reject a built-in provider name or a missing valid provider configuration. It pauses the generation job rather than silently spending a built-in credit.

## Decision Required

The only unresolved ownership question is the Cloudflare Workers AI endpoint. An endpoint can be externally hosted without revealing which account owns it, so its URL alone does not demonstrate that the Cloudflare account and associated usage are the user’s.

The user should choose one of the following image-provider policies before automation begins:

| Choice | Configuration | Advantages | Risk or prerequisite |
|---|---|---|---|
| A. User-owned Cloudflare endpoint | Store a private Cloudflare Worker endpoint from the user’s own Cloudflare account. | Fast current image route; consistent with the existing pipeline. | The user must create or confirm ownership of the Cloudflare Worker and its usage limits. |
| B. User-owned Hugging Face token | Select Hugging Face as the active image provider and store the user’s token. | Direct BYOK credential ownership is clear. | Previous free included image credits were exhausted; paid credits or a viable model allocation may be needed. |
| C. Pause illustrations until another provider is connected | Keep text generation active but block images. | No ambiguity over image-service ownership or spend. | Books cannot finish illustration generation until a provider is connected. |

## Implementation Steps After Approval

1. **Confirm the image-provider choice.** Record the selected provider policy and ensure that its credential or endpoint is entered through a secure configuration field, never in source code or Git history.

2. **Validate only metadata-safe health checks.** Run a small text request through OpenRouter and a small image-service health/generation request through the selected image provider. Log only provider name, model, status, and timestamps; redact all credentials.

3. **Lock the production provider order.** Keep OpenRouter’s user key as the active text route, with its two selected models in sequence. Enable only explicitly chosen user-key fallback providers. Set the selected image provider as the sole active illustration route unless the user explicitly adds another user-owned fallback.

4. **Verify the editor status indicator.** Confirm the book editor reports `Your providers only`, identifies the active text and illustration providers, and never displays raw key values or endpoint secrets.

5. **Run regression and live-safe validation.** Confirm that malformed responses, quota exhaustion, or missing user keys pause the job with clear retry guidance and do not invoke a built-in service.

6. **Use the confirmed provider contract in automation.** The future n8n/browser publishing workflow will call StoryForge only after the provider status is healthy. The dashboard will store provider names and health events so a daily batch can explain why a book was paused.

## Test Plan

| Test | Expected result |
|---|---|
| Built-in provider selected in configuration | Generation rejects the configuration with a BYOK-only error. |
| Valid OpenRouter key and model pool | Story stages use the configured OpenRouter model sequence. |
| Selected image provider unavailable or quota-limited | Illustration job pauses; no built-in image request is attempted. |
| Provider-status endpoint | Shows provider names, configuration health, and BYOK-only policy without any secrets. |
| Full regression suite | Story generation, PDF export, reader, and existing external-provider tests continue to pass. |

## Assumptions and Risks

The current OpenRouter key and the two configured OpenRouter models are assumed to be user-supplied. The Cloudflare endpoint is treated as an external route but not assumed to be user-owned until the user confirms it or provides an endpoint from their own account. Free-tier quotas are unsuitable for the planned three-to-four-books-per-day automation volume, so availability and usage limits must be tested before scheduling a daily batch. Public marketplace publication will retain a confirmation gate at the time of the external commercial action.
