# Lunnoa starter

The quickest way to build your own app on top of [Lunnoa](https://lunnoa.com) with an AI coding agent (Claude Code, Cursor, Codex).

It is deliberately small: a Next.js app that connects to your Lunnoa workspace, runs an example workflow, chats with an example agent, and lists the workspace's workflows. The workflow and the agent live in this repo as JSON. Your coding agent adds the rest, guided by `AGENTS.md` and the Lunnoa skills that `npm install` puts into `.claude/skills/` and `.cursor/skills/`.

## Quick start

**1. Create your app**

```bash
npx @lunnoa/client init my-app --url https://lunnoa.your-company.example
cd my-app
npm install
```

(Or click **Use this template** on GitHub, clone it, and run `npm install`.)

**2. Configure `.env`**

`init` creates `.env` for you. Otherwise copy `.env.example` to `.env` and fill in:

| Variable | What it is |
|---|---|
| `LUNNOA_URL` | Your Lunnoa address. The app signs people in as Lunnoa users |
| `LUNNOA_API_KEY` | An `lna_...` key for CLI commands only (discovery, codegen, status, pull, push, deploy). Push needs a role that can create workflows and agents. The running app does not use it |

Ask a Lunnoa admin to add the app's URL to `CORS_ALLOWED_ORIGINS`. People who are not in the workspace yet are added in Lunnoa (invite, SSO, or SCIM), then they sign in here.

Run `npm run dev` and open http://localhost:3000. Sign in. If you see your workflows, you are connected.

**3. Try the examples**

`lunnoa/workflows/hello-lunnoa.json` is a small workflow kept in code, and `lunnoa/agents/greeter.json` is a small agent (its prompt is `greeter.instructions.md`). Send both to Lunnoa:

```bash
npx lunnoa-client push
```

Reload the app. **Hello Lunnoa** and **Greeter** show the badge **Synced with code**. Enter a name and press **Run** to see the greeting. Press **Say hello** to chat with Greeter. Change either one in the Lunnoa UI and its badge turns into **Changed in UI, not yet in code** until you run `npx lunnoa-client pull` and push again.

The first push fills in this workspace's model connection and rewrites `greeter.json`. Commit that file with `lunnoa/lunnoa.lock.json`. The connection id in it belongs to this deployment.

**4. Open the folder in your coding agent and describe your idea**

For example: *"I want a page where our sales team sees open invoices and can approve them."* The agent interviews you, writes `BRIEF.md` for your approval, then builds it in small steps you can check.

## Auth

People sign in with their Lunnoa account in the browser (`app/user-workflows.tsx`). Their permissions, agent shares, and task history apply. The app does not call Lunnoa with the API key on their behalf.

## Deploy

The app builds into a small Docker image (Next.js `output: 'standalone'`), so it runs anywhere Docker runs: Dokploy, Coolify, a plain VM, or Kubernetes. Configuration comes from environment variables at runtime, so one image works for every environment. The container needs `LUNNOA_URL` only. Keep `LUNNOA_API_KEY` on the machine that runs CLI commands.

```bash
docker build -t my-lunnoa-app .
docker run -p 3000:3000 -e LUNNOA_URL=https://lunnoa.your-company.example my-lunnoa-app
```

**Example: Dokploy**

1. Create an **Application** and connect your Git repository.
2. Set **Build Type** to **Dockerfile** (path `Dockerfile`).
3. Under **Environment**, add `LUNNOA_URL`.
4. Under **Domains**, add your domain with container port `3000`, then **Deploy**.

Add that domain to Lunnoa's `CORS_ALLOWED_ORIGINS`.

Coolify, Kubernetes and others work the same way: build the `Dockerfile`, set the env vars, expose port 3000. Vercel also works if you prefer it.

## Project layout

```text
app/        pages and components: sign-in, run this app's workflows, chat with its agents, list the workspace
lib/        shared code: lunnoa.ts reads definition files; codegen output goes here too
lunnoa/     agent and workflow definitions synced with Lunnoa (agents/, workflows/, lunnoa.lock.json)
BRIEF.md    the build brief your coding agent writes with you
AGENTS.md   instructions for coding agents (CLAUDE.md is the same for Claude Code)
```

App code refers to agents and workflows by slug. `app/page.tsx` imports `lunnoa/workflows/hello-lunnoa.json` and `lunnoa/agents/greeter.json`. The signed-in page finds each one in Lunnoa by slug, runs the workflow, and chats with the agent.

## Agent and workflow definitions

Saved agents and workflows live in `lunnoa/` as JSON (`agents/<slug>.json`, `agents/<slug>.instructions.md`, `workflows/<slug>.json`). Commit `lunnoa/lunnoa.lock.json` with them. Replace the examples with your own agents and workflows; deleting a file does not delete the agent or workflow in Lunnoa.

```bash
npx lunnoa-client status
npx lunnoa-client pull
npx lunnoa-client push
```

`status` before you edit. `pull` before you `push`. `--force` overwrites one side. Ask before you use it.

A TypeScript file is only for a definition that needs code. `npx lunnoa-client agents deploy` and `workflows deploy` on a `.ts` file lock that resource in the UI. A `.json` path is a push.

A scheduled pull that opens a pull request, and a push when `main` changes, are written up in the docs: [Sync agents and workflows with the UI](https://docs.lunnoa.com/guides/develop/client/sync). This starter does not include that workflow. A new repository would fail until the secrets exist.

## Useful commands

```bash
npm run dev                                   # local dev server
npx lunnoa-client workflows list              # what's in your workspace (reads .env)
npx lunnoa-client status                      # local files vs the UI
npm run lunnoa:codegen                        # typed client in lib/lunnoa.generated.ts
npx lunnoa-client tools list --for-agent      # catalogue actions you can use
npx lunnoa-client --help                      # all SDK CLI commands
```

SDK docs: [`@lunnoa/client`](https://github.com/lunnoa-automate/lunnoa_client).
