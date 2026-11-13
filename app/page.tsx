import { appWorkflow } from '@/lib/lunnoa';
import helloLunnoa from '@/lunnoa/workflows/hello-lunnoa.json';

import { UserWorkflows } from './user-workflows';

// Read env at request time so one Docker image works with any deployment URL.
export const dynamic = 'force-dynamic';

// Workflows this app runs: one import per file in lunnoa/workflows, found in Lunnoa by slug.
const appWorkflows = [appWorkflow(helloLunnoa)];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Lunnoa starter</h1>
        <p className="text-sm text-neutral-500">
          Sign in with your Lunnoa account to run this app&apos;s workflows and see the rest of your workspace.
        </p>
      </header>
      <UserWorkflows baseUrl={process.env.LUNNOA_URL ?? ''} appWorkflows={appWorkflows} />
    </main>
  );
}
