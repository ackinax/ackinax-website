import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Shared label/error/hint wrapper for a form input, used by RpcLeadForm and Contact. */
export default function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-body text-sm text-foreground">{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs font-body">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs font-body">{hint}</p>
      )}
    </div>
  );
}
