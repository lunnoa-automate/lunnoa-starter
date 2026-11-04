import type { Workflow } from '@lunnoa/client';

export function WorkflowList({ workflows }: { workflows: Workflow[] }) {
  if (workflows.length === 0) {
    return <p className="text-sm text-neutral-500">Connected. No workflows in this workspace yet.</p>;
  }
  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
      {workflows.map((workflow) => (
        <li key={workflow.id} className="flex items-start justify-between gap-4 p-4">
          <div>
            <p className="font-medium">{workflow.name}</p>
            {workflow.description && <p className="text-sm text-neutral-500">{workflow.description}</p>}
          </div>
          <span className="shrink-0 text-xs text-neutral-500">{workflow.isActive ? 'Active' : 'Inactive'}</span>
        </li>
      ))}
    </ul>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>;
}
