# Marketplace Automation Research Notes

## 2026-08-19

- Etsy’s official Open API v3 listings tutorial confirms that authenticated seller integrations can create draft listings, upload listing images, upload downloadable product files, and publish through listing state updates. The required authorization scopes include `listings_r` and `listings_w`; publication should remain a deliberate final step after review.
- Gumroad’s official API guidance confirms that a creator publishing only to their own account can use a manually generated access token. For a multi-account product, it supports OAuth authorization via a redirect URI. Final implementation must validate the precise product-creation and file-upload endpoints before credentials are requested.
- AWS distribution should be treated as a direct-hosted storefront/download channel: store exported PDFs and cover images in S3-compatible storage and serve them through a CDN or signed-download endpoint. Amazon S3 presigned URLs grant time-limited object access, while CloudFront signed URLs add policy-based controls such as timing and IP restrictions. It is distinct from marketplace listing creation.

## Hosting and Agent Fit

- Google Cloud’s current Always Free Compute Engine allowance is one non-preemptible e2-micro instance in specific US regions, 30 GB-months of standard persistent disk, and 1 GB of outbound network transfer per month. This is too small and bandwidth-constrained for a reliable always-on browser automation worker. The separate 90-day trial has $300 in credit and ends or stops resources unless the billing account is upgraded.
- ChatGPT’s consumer browser agent can preserve cookies across sessions, but its official safety model uses confirmation for high-impact actions and may require supervised takeover for logins. It is useful for assisted browser work and prompt ideation, not as the durable unattended commercial publishing worker or a programmatic LLM backend for StoryForge.
- OpenAI’s official billing guidance states that API use is billed and managed separately from a ChatGPT subscription. ChatGPT Pro therefore does not supply the programmatic model capacity required for StoryForge’s scheduled prompt agent; an API billing account and API key would be required if OpenAI models are selected for that backend role.

## Google Cloud Runtime Selection

- Google Cloud documents Cloud Run as a stateless request-driven container service with configured request-response timeouts. It is appropriate for dashboard APIs, webhooks, and short deterministic tasks, but not for retaining an authenticated browser profile across daily commercial publishing runs.
- Compute Engine with a persistent disk is the suitable browser-worker host because the VM’s browser profile, installed browser runtime, encrypted operating-system state, and automation logs can remain available after reboots. The worker should use a dedicated non-personal account and a least-privilege service account for Google storage access.

## First Marketplace Rollout

- Etsy requires an existing account, desktop shop setup, selected language/country/currency, a unique shop name, payment and billing details, identity verification, and two-factor authentication before the shop can be opened. This makes its first-time onboarding more involved.
- Gumroad’s product flow begins from the Products dashboard: select a product type, set pricing and product information, add content, and publish. Its simpler product-first flow makes it the practical first browser-automation target for a digital StoryForge PDF, while Etsy should be added after one successful manual marketplace run.

## Additional Distribution Options

- Payhip supports file uploads for digital products, sends buyers to a download page after purchase, and pays creators through connected payment processors. It is a useful simple storefront after Gumroad, subject to payment-processor availability in the seller's country.
- Google Play Books Partner Center accepts PDF and EPUB uploads and provides catalog, analytics, reports, pricing, payment, and multi-user controls. It is a later-stage book-distribution channel because its publisher setup and country-specific payment availability require more verification than a simple download storefront.
