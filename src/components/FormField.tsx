import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/**
 * The asterisk is decorative and hidden from assistive tech, which would
 * otherwise announce a bare "star"; the visually-hidden word carries the
 * same meaning to a screen reader instead. Exported so the "How can we
 * reach you?" group heading - required as a group rather than per field -
 * can mark itself the same way.
 */
export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive ml-0.5">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

/** Shared label/error/hint wrapper for a form input, used by RpcLeadForm and Contact. */
export default function FormField({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-body text-sm text-foreground">
        {label}
        {required && <RequiredMark />}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs font-body">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs font-body">{hint}</p>
      )}
    </div>
  );
}
