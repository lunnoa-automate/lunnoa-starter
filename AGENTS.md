# Working in this repo

A Next.js (App Router, TypeScript) app built on a Lunnoa Automate deployment
with `@lunnoa/client`. The human may not be a developer: explain in plain language.

## Before anything else

- If `.claude/skills/` (or `.cursor/skills/`) is missing, run `npm install`.
  It copies the Lunnoa skills that match the installed SDK version.
- If `.env` is missing, copy `.env.example` to `.env` and ask the human for the values.
- If `lunnoa/lunnoa.lock.json` is missing, nothing was pushed from this repo yet.
  `npx lunnoa-client push` creates the example workflow and the example agent, so Run and chat work.

## Project layout

```text
app/                         Next.js pages and components (your app code)
  page.tsx                   imports the workflow and agent files this app uses
  user-workflows.tsx         sign-in as a Lunnoa user, then this app's workflows and agents
  run-workflow.tsx           runs a workflow from lunnoa/ by slug, form built from its trigger inputs
  chat-agent.tsx             chats with an agent from lunnoa/ by slug
  workflow-list.tsx          workflow list and the sync badge
lib/
  lunnoa.ts                  turns a workflow or agent file into props for client components
  lunnoa.generated.ts        typed client from `npm run lunnoa:codegen` (when you need it)
lunnoa/                      agent and workflow definitions, synced with Lunnoa
  agents/<slug>.json         one agent; greeter.json is an example. Its prompt is in <slug>.instructions.md
  workflows/<slug>.json      one workflow; hello-lunnoa.json is an example to replace
  lunnoa.lock.json           written by the first push or pull; commit it
BRIEF.md                     the build brief you write with the human
```

Only definition files live in `lunnoa/`. App code lives in `app/` and `lib/`
and refers to agents and workflows by slug. Pull and push never touch app code.
Codegen goes to `lib/` (`npm run lunnoa:codegen`), not `src/lunnoa`.

## How to build a feature

1. Load the **lunnoa-solution-design** skill first. Interview the human.
2. Reuse before you create. Inspect the workspace (reads `.env`):
   - `npx lunnoa-client status` (what is in `lunnoa/` and what changed in the UI)
   - `npx lunnoa-client workflows list --json` and `agents list --json` (slug and `codeSource`)
   - `npx lunnoa-client entity-types list --json` and `tables list --json`
   - `npx lunnoa-client tools list --for-agent --json`
   To change an agent or workflow that already exists in Lunnoa, `npx lunnoa-client pull <slug>` and edit that file.
3. Write or update `BRIEF.md` and get the human's approval **before coding**.
4. Implement with the **lunnoa-client** skill, in small slices:
   - agents and workflows as JSON in `lunnoa/` (see "Agents and workflows"), then `npx lunnoa-client push`;
   - app code in `app/` that uses them by slug (see "Use a definition in app code").
5. End each slice with a plain-language check the human can do (e.g. "open the app, enter a
   name, press Run, and you should see Hello, Ada" or "say hello to Greeter and you should
   see one short sentence").

## Agents and workflows

Keep agent and workflow definitions in `lunnoa/` as JSON. Start from
`lunnoa/workflows/hello-lunnoa.json` and `lunnoa/agents/greeter.json`. The `$schema` line gives the editor validation.

- Take catalogue ids from `tools list` / `tools get <id> --json` and model ids from `ai-connections list --json`. Never invent them.
- `greeter.json` sets `model` to the Lunnoa platform default (`deepseek-ai/DeepSeek-V4-Pro`) and leaves out `aiConnection`. The first push attaches this workspace's connection and rewrites the file with the stored settings. Commit that rewrite. It contains a connection id for this deployment only.
- Give every step a `key`. Later steps and the app read its output with `={{step:<key>,…}}` or by that key. Trigger inputs are `={{step:trigger,<input id>}}`.
- An agent's prompt goes in `lunnoa/agents/<slug>.instructions.md`; the JSON holds `"instructions": { "file": "<slug>.instructions.md" }`.
- Run `npx lunnoa-client status` before editing, and `npx lunnoa-client pull` before `npx lunnoa-client push`.
- Commit `lunnoa/lunnoa.lock.json` with the JSON files. Push rewrites each file the way Lunnoa stored it; commit that too.
- Deleting a file does not delete the agent or workflow in Lunnoa. Ask the human to delete it in the UI.
- Use a TypeScript `defineAgent` or `defineWorkflow` file only when the definition needs code. Deploy it with `npx lunnoa-client agents deploy` or `npx lunnoa-client workflows deploy`. That locks the resource in the UI (`codeSource: generated`). JSON push sets `codeSource: synced`. `codeSource` replaces `managedByCode` on agents and workflows.
- Do not pass `--force` unless the human agrees. A conflict means the file and the UI both changed. Read the diff (`--- local` / `+++ server`) and ask.
- A scheduled pull that opens a pull request, and a push on main, are in the Lunnoa docs: [Sync agents and workflows with the UI](https://docs.lunnoa.com/guides/develop/client/sync). Do not add that GitHub workflow to this repo.

## Use a definition in app code

Copy these two patterns. Ids differ per deployment, so the app finds the resource by slug.
Never hard-code an id. Never upsert or push from the app. Definitions change through `lunnoa/` and the CLI.

### Workflow

1. Import the file in a server component and turn it into props: `appWorkflow(file)` from
   `lib/lunnoa.ts` (`app/page.tsx`). It reads the slug, the Manually Run inputs and the last step's key.
2. In the client, list workflows with the signed-in user's session
   (`expansion: ['slug', 'codeSyncStatus']`) and find the one with that slug.
3. Run it with `client.workflows.executeAndWait(id, inputs, { expansion: ['nodes'] })` and read the
   step output by `key` from `execution.nodes` (`app/run-workflow.tsx`).

### Agent

1. Import the file and turn it into props with `appAgent(file)` (`app/page.tsx`). It reads the slug
   and `settings.suggestedPrompts`.
2. List agents with the same session (`expansion: ['slug', 'codeSyncStatus']`) and find the one with that slug.
3. Chat with `useAgentChat(agent.id)` from `@lunnoa/client/react` (`app/chat-agent.tsx`). The first message creates the task.

## Hard rules

- People sign in as Lunnoa users (`app/user-workflows.tsx`). Do not call Lunnoa
  with `LUNNOA_API_KEY` on their behalf.
- `LUNNOA_API_KEY` is for CLI discovery, codegen, deploy, status, pull and push only. Never put `lna_` keys
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
