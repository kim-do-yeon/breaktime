// Empty / no-results state. Covers: 0 PTO, all-blackout, out-of-coverage.
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
      <div className="mb-3 text-4xl" aria-hidden>
        {icon ?? "🗓️"}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="max-w-sm text-sm text-gray-500">{message}</p>
    </div>
  );
}
