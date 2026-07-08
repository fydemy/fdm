# Fydemy

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Open-source platform for product applications, reviewer decisions, public launches, and shared materials — built for the [Fydemy](https://fydemy.com) community.

## Features

**Applicants**

- Apply with product name, description, logo, pitch deck upload, and team members
- Confirmation email (via Resend) to the applicant and every team member
- After approval, publish launches (markdown, YouTube, social embeds)
- Read materials published by reviewers

**Reviewers**

- Approve or reject applications with optional notes
- Approval / rejection emails via Resend templates
- Monitor launches across approved products
- Create multi-section markdown materials for approved applicants

**Public site**

- Featured launches on the home page
- Browse and view individual launch pages
- SEO-friendly metadata, sitemap, and robots

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | shadcn/ui, Tailwind CSS |
| API | tRPC 11 |
| Database | PostgreSQL + Prisma |
| Auth | better-auth (Google OAuth) |
| Email | Resend |

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js 20+)
- PostgreSQL 14+
- Google OAuth credentials
- Resend API key (optional in local dev if you skip email flows)

## Getting started

```bash
git clone https://github.com/fydemy/fdm.git
cd fdm
bun install
cp .env.example .env
```

### Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (app) |
| `DIRECT_URL` | Direct Postgres URL (Prisma migrations / push) |
| `BETTER_AUTH_SECRET` | Random secret for session signing |
| `BETTER_AUTH_URL` | Public app URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | From address, e.g. `Fydemy <onboarding@resend.dev>` |
| `RESEND_CC_EMAIL` | Optional CC address on every transactional email |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, for uploads) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 ID (e.g. `G-XXXXXXXXXX`). Omit to disable. |

Generate a secret:

```bash
openssl rand -base64 32
```

### Database and dev server

```bash
bunx prisma db push
bunx prisma generate
bun dev
```

Visit [http://localhost:3000](http://localhost:3000), sign in with Google, and open `/dashboard`.

### User roles

Roles are stored on the `user` table (`applicant`, `founder`, `reviewer`, `mentor`):

| Role | Access |
| --- | --- |
| `applicant` | Default for new users — apply and manage pending applications |
| `founder` | Set automatically when an application is approved — launches and materials |
| `reviewer` | Review applications, manage materials, feature launches (`/dashboard/review`) |
| `mentor` | View approved applications and edit files in reviewer-labeled mentor folders (`/dashboard/mentor`) |

Assign staff roles directly in the database, e.g. with Prisma Studio:

```bash
bunx prisma studio
```

### Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/), create an OAuth client and add authorized redirect URIs for better-auth, typically:

```
http://localhost:3000/api/auth/callback/google
```

Use your production origin in place of `localhost` when deploying.

### Supabase Storage

File uploads (pitch decks, logos, editor images) use [Supabase Storage](https://supabase.com/docs/guides/storage).

1. Create a Supabase project and add `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to `.env`.
2. In **Storage**, create three buckets:

| Bucket | Public | Purpose |
| --- | --- | --- |
| `logos` | Yes | Product logos |
| `images` | Yes | WYSIWYG inline images |
| `pitchdecks` | No | Application pitch decks (served via `/api/pitchdecks/...` with auth) |

For public buckets (`logos`, `images`), enable public access in the bucket settings or add a policy allowing public `SELECT`.

Objects are stored as `{userId}/{filename}` within each bucket.

## Project structure

```
src/
  app/                 # App Router pages and API routes
  components/          # UI and feature components
  lib/                 # Auth, email, Prisma, tRPC, helpers
prisma/
  schema.prisma        # Database schema
```

## Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Development server |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun run lint` | ESLint |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Security

Report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the [MIT License](LICENSE).
