# Working in this repo

A Next.js (App Router, TypeScript) app built on a Lunnoa Automate deployment
with `@lunnoa/client`. The human may not be a developer: explain in plain language.

## Before anything else

- If `.claude/skills/` (or `.cursor/skills/`) is missing, run `npm install`.
  It copies the Lunnoa skills that match the installed SDK version.
- If `.env` is missing, copy `.env.example` to `.env` and ask the human for the values.

## How to build a feature

1. Load the **lunnoa-solution-design** skill first. Interview the human.
2. Reuse before you create. Inspect the workspace (reads `.env`):
   - `npx lunnoa-client entity-types list --json`
   - `npx lunnoa-client tables list --json`
   - `npx lunnoa-client workflows list --json`
   - `npx lunnoa-client agents list --json`
   - `npx lunnoa-client tools list --for-agent --json`
3. Write or update `BRIEF.md` and get the human's approval **before coding**.
4. Implement with the **lunnoa-client** skill.
5. Build in small slices. End each slice with a plain-language check the
   human can do (e.g. "open /invoices and you should see 3 rows").

## Hard rules

- Never put `lna_` keys in browser code, `'use client'` files, or `NEXT_PUBLIC_*` vars.
  Pattern A calls go through `lib/lunnoa.ts` (server only).
- `LUNNOA_AUTH_MODE` picks the auth pattern: `server` (Pattern A, API key on the
  server) or `user` (Pattern B, browser login). Keep both paths working.
- Never invent catalogue action ids; get them from `tools list` / `tools get <id> --json`.
- Agents have no schedules or webhooks; wrap them in a workflow.
- Connections and OAuth secrets stay in Lunnoa; never ask for them in this app.
- Deploy is a Docker image (`Dockerfile`, Next.js standalone). Config comes from env vars at runtime.
