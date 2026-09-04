# Current Progress

## Selected feature

`009-ai-delivery-intelligence`

Status: `in_progress`

Mode: `SHIP`

Implementation branch: `feature/009-ai-delivery-intelligence`

Base: `main` at `0cbf468fb900ca9a99c53d6755bfb803a2ea0052` (Feature 008 Phases 7–8 merge)

Tracking issue: `#17 Feature 009 — AI Delivery Intelligence: evidence-to-spec-to-actuals`

Draft PR: `#18 feat: add AI delivery intelligence measurement kernel`

## Phase 009-A lifecycle

- Spec: `PASS` — `specs/009-ai-delivery-intelligence/phase-a-measurement-kernel.md`.
- Graph Harness contract review: `PASS`; `graph-harness.project.v1` and `graph-harness.event.v1` remain external execution contracts.
- Producer implementation: complete.
- Deterministic tests: added; CI verification pending on final tracking HEAD.
- Critic/repair/verifier: pending final CI outcome and diff review.
- Merge: human-gated; not authorized.

## Implemented scope

- Added a raw-preserving `graph-harness.event.v1` JSONL importer.
- Validates schema/event type, contiguous sequence, single project identity, duplicate IDs, and supplied hash-chain continuity without copying Graph Harness runtime authority.
- Added deterministic lifecycle reconstruction by node revision for approvals, ready/running/review/done, blocked intervals, repair intervals, gates, evidence, failures, and invalidations.
- Separates calendar lead time and active cycle time from human touch.
- `running -> review` is explicitly not treated as human touch.
- Added explicit observation provenance: `MEASURED`, `MANUAL`, `IMPORTED`, `INFERRED`, `UNKNOWN`.
- Added categories for human touch, agent runtime, verification, repair, wait, and blocked observations.
- Added planned effort/calendar baselines and deterministic effort/schedule variance.
- Added first-pass gate yield, gate failures, repair loop count, verified delivery units, and throughput.
- Added guarded baseline comparison. Observed leverage can be reported when evidence exists; causal AI acceleration remains hidden unless a controlled, high-comparability, quality-equivalent, low-scope-variance, high-confidence comparison is present.
- Added additive browser-local persistence under the existing `te_projects` project shape.
- Added a `Build with Proof` panel using `Plan -> Build -> Verify -> Learn`, keeping Graph Harness complexity underneath the product experience.
- Added manual baseline, Graph Harness ledger import, and manual human-touch capture flows.
- Added deterministic tests for raw preservation, broken chain handling, lifecycle reconstruction, touch-time separation, variance, observed leverage, and causal guardrails.

## Protected invariants

- Graph Harness remains the execution evidence source of truth.
- No Graph Harness runtime is copied into TimeEstimator.
- Existing estimation formulas and overhead percentages are unchanged.
- No business calculations were added to React components.
- No human touch is inferred from commits or Graph Harness state transitions.
- Existing browser-local projects remain readable when `deliveryIntelligence` is absent.
- No backend, auth, billing, Kubernetes, deployment, or irreversible migration is introduced.
- No causal AI productivity claim is shown from a single weak comparison.

## Verification

Draft PR #18 is open. GitHub Actions has been triggered; final gate status must be checked against the final tracking HEAD before Phase 009-A can move to `REVIEW`.

Required gates:

- dependency installation;
- typecheck;
- lint;
- tests;
- production dependency audit;
- static production build;
- diff/patch review.

## Next gate

Wait only for the already-triggered repository verification result, repair any failure locally to 009-A, update this record to the verified HEAD, and stop before merge.
