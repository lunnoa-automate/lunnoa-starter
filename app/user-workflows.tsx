'use client';

import { isLoginRequires2FA, type Workflow } from '@lunnoa/client';
import { LunnoaAuthProvider, useLunnoaAuth } from '@lunnoa/client/react';
import { useEffect, useState, type FormEvent } from 'react';

import type { AppWorkflow } from '@/lib/lunnoa';

import { RunWorkflow } from './run-workflow';
import { ErrorNote, WorkflowList } from './workflow-list';

/** The browser signs in as a Lunnoa user and calls Lunnoa directly with their JWT. */
export function UserWorkflows({ baseUrl, appWorkflows }: { baseUrl: string; appWorkflows: AppWorkflow[] }) {
  if (!baseUrl) return <ErrorNote message="Set LUNNOA_URL in .env (see .env.example)." />;
  return (
    <LunnoaAuthProvider baseUrl={baseUrl}>
      <Session appWorkflows={appWorkflows} />
    </LunnoaAuthProvider>
  );
}

function Session({ appWorkflows }: { appWorkflows: AppWorkflow[] }) {
  const { status, user, logout } = useLunnoaAuth();
  if (status === 'loading') return <p className="text-sm text-neutral-500">Loading…</p>;
  if (status === 'unauthenticated') return <LoginForm />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>Signed in as {user?.email}</span>
        <button className="underline" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
      <Workflows appWorkflows={appWorkflows} />
    </div>
  );
}

function Workflows({ appWorkflows }: { appWorkflows: AppWorkflow[] }) {
  const { client } = useLunnoaAuth();
  const [workflows, setWorkflows] = useState<Workflow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client.workflows
      .list({ expansion: ['description', 'isActive', 'slug', 'codeSyncStatus'] })
      .then(setWorkflows, (err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, [client]);

  if (error) return <ErrorNote message={error} />;
  if (!workflows) return <p className="text-sm text-neutral-500">Loading workflows…</p>;
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">This app&apos;s workflows</h2>
        {appWorkflows.map((definition) => (
          <RunWorkflow
            key={definition.slug}
            definition={definition}
            workflow={workflows.find((workflow) => workflow.slug === definition.slug)}
          />
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">All workflows in your workspace</h2>
        <WorkflowList workflows={workflows} />
      </section>
    </div>
  );
}

const inputClass = 'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm';

function LoginForm() {
  const { login, verify2faLogin, error } = useLunnoaAuth();
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      if (sessionToken) {
        await verify2faLogin({ sessionToken, token: String(form.get('code')) });
        return;
      }
      const result = await login({ email: String(form.get('email')), password: String(form.get('password')) });
      if (isLoginRequires2FA(result)) setSessionToken(result.sessionToken);
    } catch {
      // The provider exposes the message as `error`.
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-3">
      {sessionToken ? (
        <label className="block space-y-1 text-sm">
          <span>Two-factor code</span>
          <input name="code" required autoComplete="one-time-code" className={inputClass} />
        </label>
      ) : (
        <>
          <label className="block space-y-1 text-sm">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
          </label>
        </>
      )}
      {error && <ErrorNote message={error} />}
      <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">
        Sign in to Lunnoa
      </button>
    </form>
  );
}
