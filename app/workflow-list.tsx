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
            {workflow.slug && <p className="font-mono text-xs text-neutral-500">{workflow.slug}</p>}
            {workflow.description && <p className="text-sm text-neutral-500">{workflow.description}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <CodeSyncBadge status={workflow.codeSyncStatus} />
            <span className="text-xs text-neutral-500">{workflow.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

const SYNC_LABELS: Record<string, string> = {
  in_sync: 'Synced with code',
  changed_in_ui: 'Changed in UI, not yet in code',
  locked: 'Managed by code',
};

/** Same wording as the Lunnoa UI. `none` (built in the UI only) shows nothing. */
export function CodeSyncBadge({ status }: { status?: Workflow['codeSyncStatus'] }) {
  const label = status ? SYNC_LABELS[status] : undefined;
  if (!label) return null;
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${
        status === 'changed_in_ui' ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-700'
      }`}
    >
      {label}
    </span>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>;
}
