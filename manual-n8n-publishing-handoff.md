# Manual n8n Browser Workflow Handoff

## Purpose

This document defines the first manual browser workflow for selling StoryForge books on **Gumroad** and **Payhip**. It is intentionally a preparation and tracking workflow: StoryForge stores the source-of-truth sales package and listing status, while a user-started local browser workflow handles the logged-in storefront screens.

## Start Condition

The user starts the workflow manually after signing into Gumroad and Payhip in the browser profile used by the local automation machine. The workflow should process one prepared StoryForge package at a time until its browser steps have been tested reliably.

## Daily Prompt-Batch Contract

Before any book is created, the workflow can call StoryForge’s protected `promptAgent.prepareBatch` action with a count of `3` or `4`. StoryForge uses only the configured user-owned text-provider pool and saves each returned brief before a book begins.

| Field | Meaning | Workflow rule |
|---|---|---|
| `id` | Stable prompt brief ID | Pass this as `promptBriefId` when creating the selected book. |
| `prompt` | Complete single StoryForge story input | Use unchanged; do not add marketplace copy or rewrite it in n8n. |
| `workingTitle` | Review-friendly draft title | Display for selection only; StoryForge infers final book metadata. |
| `protagonist`, `setting`, `theme` | Originality anchors | Saved as a signature and checked against prior prompt briefs. |
| `status` | `prepared`, `consumed`, or `discarded` | Create books only from `prepared` briefs. |

The local workflow must request the list of prepared briefs, select only the approved ones, then call the existing single-prompt creation action with both `prompt` and `promptBriefId`. StoryForge marks the linked brief as `consumed`, so it cannot be used again. A discarded brief remains in history to prevent close concept repetition.

## StoryForge Package Contract

Each prepared package supplies the following fields. The browser workflow must use these values rather than inventing listing copy, prices, or asset paths.

| Field | Meaning | Browser workflow use |
|---|---|---|
| `packageId` | Stable internal package ID | Use when writing a storefront outcome back to StoryForge. |
| `idempotencyKey` | Stable per-book duplicate-prevention key | Do not create a second product if an earlier run for this package already succeeded. |
| `title` | Customer-facing book title | Product title on both storefronts. |
| `description` | Marketplace-ready description generated from book metadata | Product description base copy. |
| `tags` | Comma-separated storybook tags | Product tags where the storefront supports them. |
| `priceCents` and `currency` | Approved selling price | Convert cents into the storefront price input. |
| `pdfStorageUrl` | Finished PDF asset | Digital-download file source. |
| `coverImageUrl` | Front-cover art | Product thumbnail or cover image. |

Packages remain `needs_export` until the PDF exists, `needs_details` until a positive price is entered, and `ready` only when both requirements are met.

## Manual Workflow Sequence

1. Open StoryForge Publishing and prepare a batch of three or four original prompt briefs.
2. Select one brief and create its StoryForge book; wait for the saved book, cover, illustrations, and PDF to be ready.
3. Choose the finished book’s package with status **Ready**.
4. Open Gumroad in the saved authenticated browser profile.
5. Create the product using the StoryForge title, description, price, cover, and PDF.
6. Return to the StoryForge package and record the Gumroad state as `prepared`, `uploading`, `published`, `failed`, or `needs_login`. Save the real storefront product ID and listing URL only after the browser confirms them.
7. Repeat the same sequence for Payhip, using the exact same package values.
8. Record daily storefront totals in the command center in Pakistan time. The workflow may later submit these values itself with source `browser_worker`.

## Status and Retry Rules

| Status | Meaning | Next action |
|---|---|---|
| `not_started` | No browser work has begun. | Begin only after the package is ready. |
| `prepared` | Listing fields have been assembled but not uploaded. | Continue the browser product-creation flow. |
| `uploading` | The local workflow is actively handling the storefront. | Do not start a duplicate run. |
| `published` | A real listing URL and/or product ID was confirmed. | Do not create another product for the same package/platform. |
| `needs_login` | The storefront session expired or needs human login. | Sign in once, then retry the same package. |
| `failed` | Upload could not be completed. | Keep the error note and retry only that storefront listing. |

## Safety Boundary

The StoryForge dashboard does not click marketplace controls or create public listings by itself. The local browser workflow is responsible for the external storefront interaction. Before a browser run takes any public commercial publishing action, it must request the user’s confirmation for that day’s batch.

## What Comes Next

After the user has created and logged into Gumroad and Payhip, the next build step is to create the local n8n workflow around this package contract. The first test should use one completed StoryForge book and verify that both stores receive the expected PDF, cover, price, title, and description before increasing volume.
