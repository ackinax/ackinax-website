---
date: 2026-06-11
topic: rpc-endpoint-page
---

# RPC Endpoint Page — Requirements

## Summary

A category-first RPC landing page positioning AckiNax as *the* native infrastructure provider for Acki Nacki, led by the unfair-advantage hook: AckiNax runs ~⅓ of the network's Block Keepers, so this is RPC straight from the source, not a reseller. The page presents one tiered ladder — from bundled pay-per-request access up to a dedicated, fully-managed top tier — plus a light "we can run your Block Manager license" contact path. v1 is built to capture interest: a lead-capture form posting to Slack is the primary conversion, with prices shown as "from $X/mo."

---

## Problem Frame

AckiNax received a warm inbound: an operator running an Acki Nacki bot/mini-app on Railway whose miners fail with `MINER_ENDPOINT_FAILED,205`. The cause is structural — the public endpoints (`mainnet.ackinacki.org`) sit behind a Cloudflare WAF that treats public-cloud IP ranges (Railway, etc.) as bots and throttles them. Header tweaks and IPv6 don't reliably fix it.

That single lead exposes a broader market. Acki Nacki demands high throughput (up to 250 threads, 1–2.5 Gbps full-duplex) and sub-second finality, and there is no incumbent native RPC provider claiming the category — the situation new chains like Monad are in, where 16+ providers race to support the chain and the early native specialist captures durable credibility (Helius/Triton on Solana). AckiNax is uniquely placed to claim it: as an operator of ~⅓ of the Block Keepers, it has direct core-network access that no multi-chain generalist (Alchemy, QuickNode, dRPC) can replicate.

Today, prospects either fight shared public endpoints (losing uptime and money) or stand up their own nodes (hardware + ops overhead). The page's job is to convert that pain and that gap into qualified interest.

### Target audiences

- **Apps / bots / Telegram mini-apps / devs** building on Acki Nacki who need reliable access — the broad top of funnel.
- **Heavy commercial operators** (mining operations, node-as-a-service apps) who want dedicated, unthrottled, SLA-backed endpoints.
- **Market makers and latency-sensitive traders** on the Acki Nacki DEX who need fast, deterministic, gateway-free access to real-time indexed on-chain data.
- **AI trading agents and their operators** — DEX.DO ("prediction market for AI agents") needs always-on, deterministic execution and unthrottled indexed data that a single public gateway can't guarantee.
- **Block Manager licensees** (own or want to own a license) who'd rather AckiNax run it on dedicated infra than self-host.

---

## Key Decisions

- **Category-first, native-specialist framing.** Lead with "we run ⅓ of the network — RPC straight from the source," not the Cloudflare pain. The WAF/`MINER_ENDPOINT_FAILED` story becomes a proof point in a differentiators section, not the headline. Rationale: the landscape shows "native" signals out-convert latency stats on new chains, and category-first appeals beyond the one inbound use case.
- **One tiered ladder, no upfront license.** The dedicated/managed top tier is the Block Manager rolled into a rolling monthly fee — to the customer it reads as "the highest tier of one product," not a separate $5k asset purchase. AckiNax holds the scarce license and the NACKL-rewards upside.
- **Bundled pricing as a feature.** Show simple bundled per-request / flat tiers and contrast with compute-unit metering (Alchemy ~26×, QuickNode ~20× method multipliers). Flat/no-CU pricing is a proven wedge for emerging chains (Dwellir, dRPC, Chainstack).
- **Interest capture over checkout for v1.** Primary CTA is "Request your endpoint / Talk to us," not Stripe. The dedicated tiers need manual whitelisting and provisioning anyway, so lead-gen is both faster to ship and the correct funnel.
- **Block Manager stays mostly internal.** The page does not foreground BM terminology, asset ownership, or NACKL rewards as a customer selling angle — the one exception is a light "we can run your BM license" contact path.

---

## Requirements

### Positioning & messaging

- R1. The hero leads with the native-specialist authority hook (AckiNax operates ~⅓ of Acki Nacki Block Keepers) and carries one bold, truthful numeric proof stat.
- R2. The page frames AckiNax as the RPC provider *for Acki Nacki* — peer to how Alchemy/QuickNode/dRPC present for their chains — with the Cloudflare-WAF problem appearing only as a supporting proof point.
- R3. A "why native" section states AckiNax-only differentiators as benefits: direct Block-Keeper access (no shared Cloudflare WAF throttle), low-latency indexed on-chain data with no rate limit (serves trading and AI-agent workloads), full archive from genesis, single-chain focus, and bundled pricing with no compute-unit guesswork.
- R4. Bundled/flat pricing is presented as an advantage, explicitly contrasted with compute-unit method multipliers used by the multi-chain incumbents.

### Offer & pricing presentation

- R5. Pricing presents one ladder of three published tiers — Entry (bundled shared high-availability RPC), Commercial (dedicated endpoint), Dedicated/Managed (top) — each shown as "from $X/mo" using placeholder ranges until real numbers are locked.
- R6. The Dedicated/Managed tier presents as the highest tier of one product; the underlying Block Manager and any $5k license cost are not surfaced to the customer.
- R7. A separate, light "We can run your Block Manager license" path offers a simple contact CTA for operators who own or want to own a license and want AckiNax to host it on dedicated infra.
- R8. Each tier lists concrete inclusions drawn from the pricing framework: RPS ceiling, monthly egress allowance, IP/domain whitelisting, and (where applicable) the 99.9% uptime SLA.

### Conversion & lead capture

- R9. The primary CTA across the page is interest capture, not checkout: "Request your endpoint" / "Talk to us" opening a short form (use case/chain, expected RPS or volume, tier of interest, contact details).
- R10. Form submissions post to a Slack Incoming Webhook server-side (reusing the Bati-assist pattern), not email; the webhook URL stays server-side and the message renders as Slack blocks with sender, tier, use case, and page context.
- R11. The form degrades gracefully when the webhook is unconfigured (clear fallback message, no silent failure) and rate-limits submissions per IP.

### Page structure & brand

- R12. Section order follows the validated category IA: hero (hook + stat + CTA) → credibility/stat bar → why-native → tiered pricing → comparison table → 3-step quickstart with copyable endpoint URL → SLA/reliability → managed-BM + enterprise CTA.
- R13. The page includes a self-authored comparison table (AckiNax vs a generic multi-chain RPC provider) covering native access, WAF throttling, pricing model, archive coverage, and chain focus.
- R14. The page is a new route distinct from the existing `/nodes` validator-license page and inherits the existing brand system (orange gradient, dark grid theme, existing `Navbar`/`Footer`/card components in `src/components/`).

### Distribution

- R15. The page supports getting listed on Acki Nacki's official RPC/provider docs list — clear product naming and a copyable endpoint URL format — flagged as the single highest-value distribution move.

---

## Key Flows

- F1. Lead capture to Slack
  - **Trigger:** Visitor clicks a "Request your endpoint" / "Talk to us" CTA.
  - **Steps:** Fills the short form → client posts to a server handler → handler validates + rate-limits → posts Slack blocks to the configured webhook → confirmation shown to the visitor.
  - **Outcome:** A structured lead lands in the Slack channel; the visitor sees a thank-you state.
  - **Covered by:** R9, R10, R11.
- F2. Managed Block Manager enquiry
  - **Trigger:** Operator clicks "We can run your BM license."
  - **Steps:** Same form with tier preset to managed-BM → posts to Slack flagged as a BM-hosting enquiry.
  - **Outcome:** A routed enquiry distinguishable from standard tier leads.
  - **Covered by:** R7, R10.

---

## Acceptance Examples

- AE1. **Covers R10.** Given the webhook is configured, When a visitor submits the form, Then Slack receives a block message with use case, tier of interest, contact, and page, and the visitor sees a confirmation.
- AE2. **Covers R11.** Given the webhook is unconfigured, When a visitor submits, Then they see a clear fallback (e.g., a direct contact link) and no silent failure occurs.
- AE3. **Covers R11.** Given more than the allowed submissions per minute from one IP, When another submit is attempted, Then it is rate-limited with a retry message.
- AE4. **Covers R5, R6, R9.** Given a visitor on the pricing section, Then each of the three tiers shows "from $X/mo" with inclusions and a single interest-capture CTA — no Stripe checkout and no mention of a $5k license.

---

## Scope Boundaries

### Deferred for later

- Self-serve Stripe checkout, automated endpoint provisioning, and rate-limit enforcement on live endpoints.
- A usage dashboard, API-key management, and a live status page.
- Real benchmark figures (latency, throughput) and a public performance dashboard.

### Outside this product's identity

- Foregrounding "Block Manager", NACKL rewards, or asset ownership as a customer selling angle — these stay internal, except the light managed-license contact path (R7).
- Positioning as a multi-chain provider — single-chain focus is the moat, validated by the Blast API shutdown.
- Compute-unit / metered pricing — bundled/flat is a deliberate differentiator.

---

## Dependencies / Assumptions

- A Slack Incoming Webhook and a server-side handler are available. The Bati-assist prior art is a Next.js route; this site is a Vite SPA on Cloudflare Workers, so the handler must be adapted to the Workers runtime. The webhook URL is supplied via an environment variable.
- Final price points, per-tier inclusions, and hero proof stats (exact network %, uptime, RPS, latency) are supplied and verified before launch — the PDF gives ranges, not committed numbers.
- AckiNax holds or acquires Block Manager licenses to back the bundled dedicated tiers (the ~$5k license is recouped in ~2–3 months of a dedicated tier).
- Acki Nacki maintains (or will publish) an official RPC provider list that AckiNax can be added to.

---

## Outstanding Questions

### Resolve before planning

- Final displayed prices or "from" anchors per tier.
- Which Slack channel/webhook receives leads, and who monitors them.
- Which hero proof stat(s) AckiNax can truthfully claim (exact network %, uptime %, latency, RPS).

### Deferred to planning

- Exact form fields, validation, and the Workers-runtime handler shape for the Slack POST.
- Whether the comparison table names specific competitors or uses "generic multi-chain provider."
- Whether the managed-BM path uses the same form (tier preset) or a distinct entry point.

---

## Sources / Research

- Value-prop / pricing memo: `Docs/AckiNax-%20RPC%20Node%20-%20Pricing.pdf` — three tiers ($250–500 / $1.5–3k / $5k+), Cloudflare-WAF hook, bandwidth-overage and dedicated-IP cost notes.
- Block Manager reference: `bm.gosh.sh` — $5,000 one-time license, capped at 5,000, transferable, NACKL rewards, free Block-Keeper connectivity (no self-hosting required). Frames BM as the access layer (layer 02) for AI agents, with "0ms rate limit on indexed on-chain data" and "ready for DEX.DO AI agent trading at launch" — the basis for the trading / AI-agent audiences and the low-latency-data differentiator.
- Competitive landscape (this session): Alchemy, QuickNode, dRPC, Chainstack, Infura, Tenderly, GetBlock, Ankr, plus the Monad docs provider list. Key takeaways: native specialists (Helius "Solana's Leading RPC", Triton) beat generalists on new chains; flat/no-compute-unit pricing is a winning wedge; getting on the chain's official docs list is the top distribution move; the Blast API shutdown (Oct 2025) validates single-chain focus over multi-chain sprawl.
- Slack-webhook prior art (sibling repo Bati-assist): `app/api/feedback/route.ts`, `src/feedback.ts` — server-side webhook POST, pure block-builder, rate-limiting, 503-when-unconfigured.
- Existing site precedent: `src/pages/Nodes.tsx` — brand system, component library, and the managed-hosting business model already in use for validator node licenses.
