import { UserWorkflows } from './user-workflows';

// Read env at request time so one Docker image works with any deployment URL.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Lunnoa starter</h1>
        <p className="text-sm text-neutral-500">
          Sign in with your Lunnoa account to see workflows in your workspace.
        </p>
      </header>
      <UserWorkflows baseUrl={process.env.LUNNOA_URL ?? ''} />
    </main>
  );
}
