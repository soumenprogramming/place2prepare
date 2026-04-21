# Place2Prepare

Full-stack placement preparation platform: **Next.js 14 (App Router)** frontend and **Spring Boot** backend with PostgreSQL, JWT auth, OAuth2 (Google/GitHub), courses, lessons, quizzes, live sessions, notifications, payments, and a public marketing site (SEO, blog, pricing, FAQ).

## Repository layout

| Area | Path |
|------|------|
| Frontend | `app/`, `components/`, `lib/` |
| Marketing content | `content/blog/*.md` (Markdown + front matter) |
| Static assets | `public/` (OG image, blog cover art) |
| Backend | `src/main/java/...`, `src/main/resources/application.properties` |
| Build | `package.json`, `build.gradle` |

## Prerequisites

- **Node.js 18+** and npm
- **Java 17** and Gradle (wrapper: `./gradlew`)
- **PostgreSQL** (or compatible JDBC URL in `application.properties`)

## Quick start

### 1. Database

Create a database and user matching `spring.datasource.*` in `src/main/resources/application.properties`, or override the URL and credentials via environment variables / your own `application-local.properties` (not committed).

### 2. Backend

```bash
./gradlew bootRun
```

Default API: `http://localhost:8080`.

**Security note:** `application.properties` may contain OAuth client secrets for local development. For any shared or production deployment, move secrets to environment variables or a secrets manager and **never commit real credentials**.

Important Spring properties:

| Property | Purpose |
|----------|---------|
| `APP_FRONTEND_BASE_URL` | Frontend origin for OAuth redirects and CORS (must match the URL users use in the browser). |
| `app.jwt.secret` | JWT signing secret (use a long random value in production). |
| `app.admin.setup-key` | Key used for the initial admin registration flow. |
| `app.payments.*` | Payments feature flag, provider (`mock` or `stripe`), pricing, Stripe keys. |
| `app.notifications.*` | Log / email notification toggles; `spring.mail.*` when email is enabled. |

### 3. Frontend

```bash
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

Default UI: `http://localhost:3000`.

**Align URLs:** `NEXT_PUBLIC_SITE_URL` (Next.js) and `APP_FRONTEND_BASE_URL` (Spring) should be the same origin (e.g. both `http://localhost:3000` locally, both `https://yourdomain.com` in production).

### 4. Verify

- Open `/` — marketing landing, header/footer, blog teaser.
- Register a student at `/register`, or use admin flow at `/admin-register` with `app.admin.setup-key`.
- Authenticated areas: `/dashboard`, `/courses`, `/live`, `/billing` (when payments are enabled).

## Product surface (high level)

1. **Auth** — Register, login, logout, OAuth, password reset, consistent API errors on the client.
2. **Student dashboard** — Enrolled courses, progress, plan type (Basic vs Premium).
3. **Catalog** — Browse and search courses before enrolling.
4. **Enrollment** — Rules, limits, server-side Premium content gating.
5. **Lessons** — Markdown/content, completion feeding progress.
6. **Practice** — Quizzes, attempts, review with explanations.
7. **Live sessions** — Calendar, join links, admin CRUD, reminders.
8. **Notifications** — In-app feed, pluggable email, hooks from admin and live-session flows.
9. **Payments** — Mock or Stripe-oriented checkout, webhooks, invoices, downgrade.
10. **Marketing** — SEO metadata, `robots.txt`, `sitemap.xml`, static pages (`/about`, `/pricing`, `/faq`, `/testimonials`), file-backed blog under `/blog`.

## Blog

Add `content/blog/your-slug.md` with YAML front matter:

```yaml
---
title: Your title
description: One-line summary for SEO cards
author: Your Name
date: 2026-04-21
tags: [dsa, placements]
cover: /blog/optional-cover.svg
---
```

Body is GitHub-flavoured Markdown. Posts appear on `/blog` and in the sitemap automatically after build.

## Social preview (Open Graph)

- Default image: `public/og-default.svg` (see `lib/marketing/site.ts` → `SITE_OG_IMAGE`).
- Many social crawlers prefer **1200×630 PNG**; you can replace `SITE_OG_IMAGE` with `/og-default.png` after exporting a PNG to `public/`.
- Blog posts can set `cover` in front matter (see `public/blog/*.svg` for examples).

## Favicon

`app/icon.svg` is picked up by Next.js as the app icon; no separate `favicon.ico` is required unless you want legacy `.ico` support.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |
| `./gradlew compileJava` | Compile backend |
| `./gradlew bootRun` | Run backend |

## Licence

Private / unlicensed unless you add a `LICENSE` file.
