import { HONEYPOT_FIELD } from "@/lib/leadFields";

/**
 * Spam honeypot: a field a real person never sees and never fills, so any
 * content in it marks the submission as automated. Shared by RpcLeadForm and
 * Contact so the two forms cannot drift apart.
 *
 * Hidden by moving it off-screen rather than `display: none` - some bots skip
 * undisplayed inputs, and off-screen positioning still keeps it out of the
 * layout. `aria-hidden` and `tabIndex={-1}` keep it away from screen readers
 * and keyboard navigation, and `autoComplete="off"` plus a field name no
 * autofill heuristic recognises keep a password manager from filling it for a
 * real person - a false positive here costs a real lead, so it matters more
 * than catching every bot.
 */
export default function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Subject</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
