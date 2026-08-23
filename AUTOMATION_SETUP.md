# StoryForge Daily Automation - Setup Guide

This adds a standalone `automation/` folder to your repo. It does NOT touch
your existing app code. It's a separate, self-contained script that GitHub
Actions runs on a schedule to generate books and (optionally) publish them
to Gumroad. No database, no server, no hosting required for this part.

## 1. Copy these files into your repo

- `automation/` (the whole folder)
- `.github/workflows/daily-publish.yml`

Commit and push them to your GitHub repository.

## 2. Create the accounts you need (free, some require a card for verification)

| Service | What for | Card needed? |
|---|---|---|
| OpenRouter (openrouter.ai) | Story text generation | No |
| Cloudflare account | You likely already have this for the image Worker | No for Workers AI; Yes for R2 |
| Cloudflare R2 | Stores generated images + PDFs | Yes (never charged within free 10GB) |
| Gumroad | Sells the finished books | No |

### Getting your OpenRouter key
1. Sign up at openrouter.ai
2. Go to Keys → Create Key
3. Free models end in `:free`, e.g. `google/gemma-2-9b-it:free` (already the default)

### Setting up Cloudflare R2
1. In the Cloudflare dashboard, go to R2 → Create bucket (e.g. `storyforge-books`)
2. R2 → Manage API Tokens → Create API Token (needs read+write on the bucket) → note the Access Key ID and Secret Access Key
3. Your Account ID is shown on the right sidebar of the Cloudflare dashboard
4. Enable public access on the bucket (R2 → your bucket → Settings → Public Access) to get a `pub-xxxx.r2.dev` URL - that's your `R2_PUBLIC_BASE_URL`

### Getting your Gumroad access token
1. Go to gumroad.com/oauth/applications → create an application
2. Generate an access token with the `edit_products` scope
3. Leave `GUMROAD_ACCESS_TOKEN` blank in setup if you just want books generated and stored first, and add publishing later - the script handles this gracefully either way.

**Important honest note**: Gumroad's public API officially supports creating,
updating, and enabling/disabling products - so the listing (name, price,
description, tags) will be created automatically. Whether the actual PDF file
attaches automatically via API is unconfirmed in their documentation. The
script tries it; if it doesn't work, the product is left as an unpublished
draft and the run log tells you to upload the file manually from the R2 link
- one drag-and-drop instead of a fully manual listing.

## 3. Add GitHub Secrets and Variables

In your repo: Settings → Secrets and variables → Actions

**Secrets** (sensitive):
- `OPENROUTER_API_KEY`
- `CLOUDFLARE_IMAGE_ENDPOINT`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `GUMROAD_ACCESS_TOKEN` (optional)

**Variables** (non-sensitive, optional - defaults are fine):
- `OPENROUTER_MODEL`
- `GUMROAD_DEFAULT_PRICE_CENTS`
- `BOOKS_PER_DAY`
- `AUTHOR_NAME`

## 4. Test it

- Go to your repo's Actions tab → "Daily Storybook Generation & Publishing" → Run workflow (this uses the `workflow_dispatch` trigger, no need to wait for the schedule)
- Watch the log - it prints progress for each book, each page, and a summary at the end
- Check your R2 bucket for the generated images/PDFs

To test locally first (recommended before relying on Actions):
```bash
cd automation
npm install
cp .env.example .env   # fill in your real values
node --env-file=.env src/run.js
```

## 5. Adjust the daily behavior

- Change `BOOKS_PER_DAY` to generate more or fewer books per run
- Edit `automation/src/ideas.js` → `THEMES` array to steer what kinds of stories get made, or replace `brainstormIdeas()` entirely with a fixed list if you'd rather choose ideas yourself
- Change the cron schedule in `.github/workflows/daily-publish.yml` (remember: cron times are UTC)

## What this does NOT include yet

- The full StoryForge web app (login, dashboard, manual editing) - that's a
  separate piece we can host later (Render, GCP VM, etc.) whenever you want it
- Payhip publishing - flagged in the original repo's research as needing
  browser automation since their API support is unconfirmed; start with
  Gumroad and revisit this once it's generating revenue to justify the extra
  complexity
