import type { ReactNode } from "react";
import { CircleOff } from "lucide-react";

type Props = { title: string; description?: string; action?: ReactNode; compact?: boolean };

export function EmptyState({ title, description, action, compact = false }: Props) {
  return (
    <div role="status" className={`app-surface-2 app-border flex flex-col items-center rounded-xl border border-dashed text-center ${compact ? "gap-1 p-4" : "gap-2 p-8"}`}>
      <CircleOff className="app-muted h-5 w-5" aria-hidden="true" />
      <p className="app-text text-sm font-semibold">{title}</p>
      {description ? <p className="app-muted max-w-sm text-xs leading-5">{description}</p> : null}
      {action}
    </div>
  );
}
