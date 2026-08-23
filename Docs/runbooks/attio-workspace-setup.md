---
title: Attio AckiNax workspace setup
---

# Attio AckiNax workspace setup

One-time setup for the dedicated AckiNax Attio workspace, plus the standing
retention task that keeps it accurate afterward. See
`Docs/plans/2026-08-23-001-feat-attio-lead-sync-plan.md` for the plan this
supports.

**Status: not yet run.** No Attio credentials were available in the session
that wrote the sync code, so every item below is an outstanding manual step.
`worker/attio/schema.ts`'s `DEAL_OWNER_EMAIL` is a placeholder until step 5
below is done - the sync gate (U7) treats it the same as an unset API key
and skips silently-but-visibly rather than sending Attio a Deal with no
owner.

## Manual prerequisites (do these first, in order)

1. **Enable the Deals object.** Attio ships every workspace with Deals
   present but disabled. In the AckiNax workspace: Settings → Objects →
   Deals → enable. There is no API for this step.

2. **Issue two API keys** (KTD10 - one key for both purposes would leave a
   credential in the production Worker capable of rewriting the CRM schema):
   - **Setup key** - scopes: `object_configuration:read-write`,
     `record_permission:read`, `user_management:read`. Used only by
     `scripts/attio-setup.ts` from a local shell. **Never store this as a
     Worker secret.**
   - **Runtime key** - scopes: `record_permission:read-write`,
     `object_configuration:read`, `note:read-write`. This is the one placed
     via `wrangler secret put ATTIO_API_KEY` and mirrored into `.dev.vars`
     for local `wrangler dev` runs (`.dev.vars` is already gitignored).
   - **Rotation:** record the date each key was issued below. Rotate the
     runtime key immediately if it is ever exposed (logs, a misconfigured
     error response, a compromised deploy credential) - `wrangler secret put`
     with the same name overwrites it in place.
   - _Setup key issued:_ `<date>` · _Runtime key issued:_ `<date>`

3. **Sign Attio's Data Processing Addendum**
   (`https://attio.com/legal/attio-data-processing-addendum`). Record here
   the processing region and transfer mechanism it names - U8's privacy
   notice quotes this directly rather than guessing:
   - _Processing region:_ `<fill in from the signed DPA>`
   - _Transfer mechanism:_ `<fill in from the signed DPA>`

4. **Optional: set Deal value currency to EUR** in the workspace UI (Q2).
   Site pricing is in EUR; Attio defaults new workspaces to USD, and
   `currency_code` is not documented as patchable per-attribute via the API.

## Running the script

```bash
ATTIO_API_KEY=<setup key> bun run attio:setup
```

Safe to re-run: every create call treats a 409 conflict as success, so a
partial or repeated run converges rather than duplicating.

The script:
- Prints the current People and Deals attribute schema.
- Probes whether People and Deals accept a unique custom attribute (RK1,
  Q3) by attempting to create one and archiving it immediately.
- Reshapes the Deals `stage` statuses into the AckiNax ladder (KD6): New
  Lead, Qualifying, Technical Evaluation, Commercial Discussion, Contract,
  Won, Lost.
- Creates the `ackinax_sub_type` and `lead_source` selects on Deals.
- Creates the `telegram` text attribute on People.
- Lists workspace members so the Deal owner can be chosen.

**After running it:**

5. Copy the full output below, under "Latest run".
6. Set `DEAL_OWNER_EMAIL` in `worker/attio/schema.ts` to the chosen
   workspace member's email address.
7. Record the RK1 and Q3 answers in the table below.

## Latest run

_Not yet run. Paste the script's full output here once it has been._

| Question | Answer |
|---|---|
| RK1 - does People accept a unique custom attribute? | _pending_ |
| Q3 - does Deals accept a unique text attribute? | _pending_ |
| Resolved `DEAL_OWNER_EMAIL` | _pending_ |

## Standing task: lead retention review

Per U8 / KD-Q1, unconverted leads are retained for 24 months from last
contact. Attio has no auto-deletion, so this is a recurring manual task,
not a one-time setting:

1. Query Deals in an open stage (not Won/Lost) whose associated Person has
   no interaction (email, calendar, note) in the last 24 months.
2. Review the list; delete the Person and Deal for anything that is
   genuinely a dead, unconverted lead past the retention window.
3. Cadence: quarterly. _Owner:_ `<name>`. _Last review:_ `<date>`.
