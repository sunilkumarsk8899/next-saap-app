'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 rounded-md border border-rose-400/50 bg-rose-950/30 p-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-rose-200">{error.message}</p>
      <button className="rounded bg-rose-600 px-3 py-2 text-sm font-medium" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
