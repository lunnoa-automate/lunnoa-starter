'use client';

import type { Workflow } from '@lunnoa/client';
import { useLunnoaAuth } from '@lunnoa/client/react';
import { useState, type FormEvent } from 'react';

import type { AppWorkflow } from '@/lib/lunnoa';

import { CodeSyncBadge, ErrorNote } from './workflow-list';

const inputClass = 'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm';

/** Runs a workflow from `lunnoa/workflows/` as the signed-in user. `workflow` is the same slug in Lunnoa. */
export function RunWorkflow({ definition, workflow }: { definition: AppWorkflow; workflow?: Workflow }) {
  const { client } = useLunnoaAuth();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workflow) return;
    const form = new FormData(event.currentTarget);
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const execution = await client.workflows.executeAndWait(
        workflow.id,
        Object.fromEntries(definition.inputs.map((field) => [field.id, form.get(field.id)])),
        { expansion: ['nodes'] },
      );
      if (execution.status !== 'SUCCESS') throw new Error(execution.statusMessage ?? `Run ended with ${execution.status}`);
      setResult(describeOutput(execution.nodes?.find((node) => node.key === definition.resultKey)?.output));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{definition.name}</p>
          {definition.description && <p className="text-sm text-neutral-500">{definition.description}</p>}
        </div>
        <CodeSyncBadge status={workflow?.codeSyncStatus} />
      </div>
      {workflow ? (
        <form onSubmit={onSubmit} className="space-y-3">
          {definition.inputs.map((field) => (
            <label key={field.id} className="block space-y-1 text-sm">
              <span>{field.label}</span>
              {field.options ? (
                <select name={field.id} required={field.required} className={inputClass}>
                  {field.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.id}
                  required={field.required}
                  type={field.inputType === 'number' || field.inputType === 'date' ? field.inputType : 'text'}
                  className={inputClass}
                />
              )}
            </label>
          ))}
          <button type="submit" disabled={running} className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50">
            {running ? 'Running…' : 'Run'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-500">
          Not in Lunnoa yet. Run <code>npx lunnoa-client push</code>, then reload this page.
        </p>
      )}
      {result !== null && <p className="rounded-md bg-neutral-50 p-3 text-sm">{result}</p>}
      {error && <ErrorNote message={error} />}
    </section>
  );
}

function describeOutput(output: unknown): string {
  if (output && typeof output === 'object' && 'result' in output && typeof output.result === 'string') {
    return output.result;
  }
  return JSON.stringify(output ?? null);
}
