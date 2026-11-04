import type { Workflow } from '@lunnoa/client';

import { authMode, lunnoaServer } from '@/lib/lunnoa';

import { UserWorkflows } from './user-workflows';
import { ErrorNote, WorkflowList } from './workflow-list';

// Read env at request time so one Docker image works with any configuration.
export const dynamic = 'force-dynamic';

export default function Home() {
  const mode = authMode();
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Lunnoa starter</h1>
        <p className="text-sm text-neutral-500">
          Auth mode <code>{mode}</code>. Workflows in your Lunnoa workspace:
        </p>
      </header>
      {mode === 'user' ? <UserWorkflows baseUrl={process.env.LUNNOA_URL ?? ''} /> : <ServerWorkflows />}
    </main>
  );
}

async function ServerWorkflows() {
  let workflows: Workflow[];
  try {
    workflows = await lunnoaServer().workflows.list({ expansion: ['description', 'isActive'] });
  } catch (error) {
    return <ErrorNote message={error instanceof Error ? error.message : String(error)} />;
  }
  return <WorkflowList workflows={workflows} />;
}
