---
title: Attio AckiNax workspace setup
---

# Attio AckiNax workspace setup

One-time setup for the dedicated AckiNax Attio workspace, plus the standing
retention task that keeps it accurate afterward. See
`Docs/plans/2026-08-23-001-feat-attio-lead-sync-plan.md` for the plan this
supports.

**Status: verified end-to-end locally.** `scripts/attio-setup.ts` has been
run successfully against the live AckiNax workspace, `DEAL_OWNER_EMAIL` is
set in `worker/attio/schema.ts`, RK1/Q3 are confirmed (see Latest run
below), and the DPA is covered (step 3 - auto-incorporated by reference,
no separate signature needed). The AE1->AE2 duplicate-submission test has
been run locally (`wrangler dev` + `.dev.vars`) and passed: a second
submission via different channels (shared Telegram handle) correctly
matched the existing Person, enriched it with the new phone number, and
appended a second Note to the same open Deal rather than creating
duplicates. Test records were deleted from the workspace afterward.

While testing, found and fixed a real bug: Attio's `personal-name`
attribute (People's `name` field) requires `first_name` and `last_name`
alongside `full_name` - undocumented in the OpenAPI reference, confirmed
empirically against the live API. The original code sent only
`full_name` as a bare object, which Attio silently rejected on every
single lead with a name filled in (`worker/attio/person.ts`, see git
history). Fixed and covered by new tests.

Still outstanding: hold off on setting the runtime key as a **production**
Worker secret until KD7's spam hardening ships (step 2 below).

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
     **Do not set this as a production Worker secret until KD7's spam
     hardening (Turnstile, honeypot, the `ratelimit` binding) has shipped** -
     until then the sync must stay off by the plan's own design, and setting
     the key alone would turn writes on. `.dev.vars` for local `wrangler dev`
     is fine in the meantime.
   - **Rotation:** record the date each key was issued below. Rotate the
     runtime key immediately if it is ever exposed (logs, a misconfigured
     error response, a compromised deploy credential) - `wrangler secret put`
     with the same name overwrites it in place.
   - _Setup key issued:_ 2026-08-24 (rotated same day after exposure in an
     AI assistant session - see below) · _Runtime key issued:_ 2026-08-24
     (also rotated same day for the same reason)

3. **Attio's Data Processing Addendum** is auto-incorporated by reference
   into the Attio Customer Agreement - no separate signature is required.
   Per `https://attio.com/legal/attio-data-processing-addendum`: "This Data
   Processing Addendum (DPA) forms part of our Attio Customer Agreement...
   By accepting our Attio Customer Agreement, you agree to the terms of
   this DPA." Accepting Attio's ToS when the workspace was created already
   covers this. Recorded here for U8's privacy notice:
   - _Processing region:_ Google Cloud Platform; specific GCP region not
     named in the DPA text itself. Automated backups replicate to "a
     different geographical region" (also unnamed).
   - _Transfer mechanism:_ EU Standard Contractual Clauses (Module Two and
     Module Four), the UK International Data Transfer Addendum / IDTA, and
     adequacy-decision countries where applicable.

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

Completed successfully on 2026-08-24 against the live AckiNax workspace:
stage ladder reshaped, `ackinax_sub_type` and `lead_source` selects
created on Deals, `telegram` text attribute created on People, and
`DEAL_OWNER_EMAIL` resolved (single workspace member).

```
Current schema:
  people: record_id (text, unique), name (personal-name), email_addresses (email-address, unique), description (text), company (record-reference), job_title (text), avatar_url (text), phone_numbers (phone-number), primary_location (location), angellist (text), facebook (text), instagram (text), linkedin (text), twitter (text), twitter_follower_count (number), first_calendar_interaction (interaction), last_calendar_interaction (interaction), next_calendar_interaction (interaction), first_email_interaction (interaction), last_email_interaction (interaction), first_interaction (interaction), last_interaction (interaction), next_interaction (interaction), strongest_connection_strength_legacy (number), strongest_connection_strength (select), strongest_connection_user (actor-reference), associated_deals (record-reference), associated_users (record-reference), created_at (timestamp), created_by (actor-reference), telegram (text)
  deals: record_id (text, unique), name (text), stage (status), owner (actor-reference), value (currency), associated_people (record-reference), associated_company (record-reference), created_at (timestamp), created_by (actor-reference), ackinax_sub_type (select), lead_source (select)

Probing unique-attribute support (RK1, Q3)...
  People: 400 validation_type "Cannot set attribute as unique."
  Deals: unique text attribute created and archived successfully.

Reshaping Deal stage ladder... (no unrecognized statuses left to reshape)

Creating Deal Sub-Type and Lead Source selects... (already existed - skipped)

Creating People Telegram attribute... (already existed - skipped)

Resolving the workspace member to own Deals (A3)...
  - frank@syks.co (Frank Sykes)
```

| Question | Answer |
|---|---|
| RK1 - does People accept a unique custom attribute? | **No.** Attio rejects it outright: `400 validation_type "Cannot set attribute as unique."` Confirms the plan's matching-key design (email/Telegram/phone compared in application code, not enforced by a unique index). |
| Q3 - does Deals accept a unique text attribute? | **Yes.** The probe attribute was created successfully. Buildable as a follow-up if a future need for an Attio-enforced Deal uniqueness constraint arises - not required by the current plan. |
| Resolved `DEAL_OWNER_EMAIL` | `frank@syks.co` (sole workspace member, confirms A3) |

## Standing task: lead retention review

Per U8 / KD-Q1, unconverted leads are retained for 24 months from last
contact. Attio has no auto-deletion, so this is a recurring manual task,
not a one-time setting:

1. Query Deals in an open stage (not Won/Lost) whose associated Person has
   no interaction (email, calendar, note) in the last 24 months.
2. Review the list; delete the Person and Deal for anything that is
   genuinely a dead, unconverted lead past the retention window.
3. Cadence: quarterly. _Owner:_ Frank Sykes (sole AckiNax workspace member
   as of this writing - reassign here if that changes). _Last review:_
   2026-08-24 (workspace creation - nothing to review yet; next due
   2026-11-24).
