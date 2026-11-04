# Lunnoa starter

The quickest way to build your own app on top of [Lunnoa](https://lunnoa.com) with an AI coding agent (Claude Code, Cursor, Codex).

It is deliberately small: a Next.js app that connects to your Lunnoa workspace and lists its workflows. Your coding agent adds the rest, guided by the Lunnoa skills that `npm install` puts into `.claude/skills/` and `.cursor/skills/`.

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
| `LUNNOA_URL` | Your Lunnoa address |
| `LUNNOA_AUTH_MODE` | `server` or `user` (see below) |
| `LUNNOA_API_KEY` | An `lna_...` key from **Adminspace → API keys**. Ask for a minimal role, not Admin |

Run `npm run dev` and open http://localhost:3000. If you see your workflows, you are connected.

**3. Open the folder in your coding agent and describe your idea**

For example: *"I want a page where our sales team sees open invoices and can approve them."* The agent interviews you, writes `BRIEF.md` for your approval, then builds it in small steps you can check.

## Auth modes

One variable, `LUNNOA_AUTH_MODE`, decides how the app talks to Lunnoa:

- **`server`** (default): the app's server holds the API key and calls Lunnoa (see `lib/lunnoa.ts`). Use this when your app has its own users, or none. The key never reaches the browser.
- **`user`**: people sign in with their own Lunnoa account in the browser, and their permissions apply (see `app/user-workflows.tsx`). Your Lunnoa admin must add the app's URL to `CORS_ALLOWED_ORIGINS`.

## Deploy

The app builds into a small Docker image (Next.js `output: 'standalone'`), so it runs anywhere Docker runs: Dokploy, Coolify, a plain VM, or Kubernetes. Configuration comes from environment variables at runtime, so one image works for every environment.

```bash
docker build -t my-lunnoa-app .
docker run -p 3000:3000 --env-file .env my-lunnoa-app
```

**Example: Dokploy**

1. Create an **Application** and connect your Git repository.
2. Set **Build Type** to **Dockerfile** (path `Dockerfile`).
3. Under **Environment**, add `LUNNOA_URL`, `LUNNOA_AUTH_MODE`, and `LUNNOA_API_KEY`.
4. Under **Domains**, add your domain with container port `3000`, then **Deploy**.

In `user` mode, add that domain to Lunnoa's `CORS_ALLOWED_ORIGINS`.

Coolify, Kubernetes and others work the same way: build the `Dockerfile`, set the env vars, expose port 3000. Vercel also works if you prefer it.

## Useful commands

```bash
npm run dev                                   # local dev server
npx lunnoa-client workflows list              # what's in your workspace (reads .env)
npx lunnoa-client tools list --for-agent      # catalogue actions you can use
npx lunnoa-client --help                      # all SDK CLI commands
```

SDK docs: [`@lunnoa/client`](https://github.com/lunnoa-automate/lunnoa_client).
