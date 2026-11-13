'use client';

import type { Agent } from '@lunnoa/client';
import { useAgentChat } from '@lunnoa/client/react';
import { useState, type FormEvent } from 'react';

import type { AppAgent } from '@/lib/lunnoa';

import { CodeSyncBadge, ErrorNote } from './workflow-list';

const inputClass = 'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm';

/** Chats with an agent from `lunnoa/agents/` as the signed-in user. `agent` is the same slug in Lunnoa. */
export function ChatAgent({ definition, agent }: { definition: AppAgent; agent?: Agent }) {
  return (
    <section className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{definition.name}</p>
          {definition.description && <p className="text-sm text-neutral-500">{definition.description}</p>}
        </div>
        <CodeSyncBadge status={agent?.codeSyncStatus} />
      </div>
      {agent ? (
        <Thread agentId={agent.id} agentName={definition.name} prompts={definition.prompts} />
      ) : (
        <p className="text-sm text-neutral-500">
          Not in Lunnoa yet. Run <code>npx lunnoa-client push</code>, then reload this page.
        </p>
      )}
    </section>
  );
}

function Thread({ agentId, agentName, prompts }: { agentId: string; agentName: string; prompts: string[] }) {
  const { messages, send, stop, status, error } = useAgentChat(agentId);
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const busy = status === 'submitted' || status === 'streaming';

  async function submit(message: string) {
    const next = message.trim();
    if (!next || busy) return;
    setText('');
    setSendError(null);
    try {
      await send(next);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(text);
  }

  const shownError = sendError ?? error?.message;

  return (
    <div className="space-y-3">
      {messages.length > 0 && (
        <ul className="space-y-3">
          {messages.map((message) => {
            const body = messageText(message);
            if (!body && message.role !== 'assistant') return null;
            return (
              <li key={message.id} className="text-sm">
                <p className="font-medium">{message.role === 'user' ? 'You' : agentName}</p>
                <p className="whitespace-pre-wrap text-neutral-700">{body || '…'}</p>
              </li>
            );
          })}
        </ul>
      )}
      {messages.length === 0 && prompts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={busy}
              onClick={() => void submit(prompt)}
              className="rounded-full border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      {busy && <p className="text-sm text-neutral-500">Replying…</p>}
      {shownError && <ErrorNote message={shownError} />}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span>Message</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy || text.trim().length === 0}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
          {busy && (
            <button type="button" onClick={() => void stop()} className="rounded-md border border-neutral-300 px-4 py-2 text-sm">
              Stop
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function messageText(message: { parts: ReadonlyArray<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('');
}
