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

## Agents and workflows

Keep agent and workflow definitions in `lunnoa/` as JSON.

```text
lunnoa/agents/<slug>.json
lunnoa/agents/<slug>.instructions.md
lunnoa/workflows/<slug>.json
lunnoa/lunnoa.lock.json
```

- Run `npx lunnoa-client status` before editing, and `npx lunnoa-client pull` before `npx lunnoa-client push`.
- Commit `lunnoa/lunnoa.lock.json` with the JSON files.
- Use a TypeScript `defineAgent` or `defineWorkflow` file only when the definition needs code. Deploy it with `npx lunnoa-client agents deploy` or `npx lunnoa-client workflows deploy`. That locks the resource in the UI (`codeSource: generated`). JSON push sets `codeSource: synced`. `codeSource` replaces `managedByCode` on agents and workflows.
- Do not pass `--force` unless the human agrees. A conflict means the file and the UI both changed. Read the diff (`--- local` / `+++ server`) and ask.
- A scheduled pull that opens a pull request, and a push on main, are in the Lunnoa docs: [Sync agents and workflows with the UI](https://docs.lunnoa.com/guides/develop/client/sync). Do not add that GitHub workflow to this repo.

## Hard rules

- People sign in as Lunnoa users (`app/user-workflows.tsx`). Do not call Lunnoa
  with `LUNNOA_API_KEY` on their behalf.
- `LUNNOA_API_KEY` is for CLI discovery, codegen, deploy, and pull/push only. Never put `lna_` keys
  in browser code, `'use client'` files, or `NEXT_PUBLIC_*` vars.
- The deployment must allow this app's origin via `CORS_ALLOWED_ORIGINS`.
- Never invent catalogue action ids; get them from `tools list` / `tools get <id> --json`.
- Agents have no schedules or webhooks; wrap them in a workflow.
- Connections and OAuth secrets stay in Lunnoa; never ask for them in this app.
- Deploy is a Docker image (`Dockerfile`, Next.js standalone). Config comes from env vars at runtime.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
