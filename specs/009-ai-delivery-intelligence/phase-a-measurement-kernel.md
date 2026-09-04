# Feature 009 — Phase A: Measurement Kernel

## Goal

Add a deterministic, evidence-driven delivery measurement kernel to TimeEstimator that reads Graph Harness execution evidence without duplicating the Graph Harness runtime.

## Requirements

- Import `graph-harness.event.v1` JSONL.
- Preserve each raw event line verbatim alongside a normalized read model.
- Validate contiguous sequence, project identity, duplicate event IDs, and supplied hash-chain continuity.
- Reconstruct node lifecycle by node revision.
- Track approval, ready, running, review, done, blocked, repair, gate, evidence, failure, and invalidation events.
- Derive calendar lead time, active cycle time, blocked time, repair time, gate failure count, first-pass gate yield, repair loops, verified nodes, and throughput.
- Support explicit time observations for human touch, agent runtime, verification, repair, wait, and blocked work.
- Never infer human touch exclusively from Graph Harness runtime transitions.
- Support planned effort/calendar baselines and estimate-vs-actual variance.
- Permit observed human-effort leverage only when both a baseline human-effort value and actual human touch are present.
- Do not expose a causal AI acceleration factor unless the comparison is controlled, high-comparability, quality-equivalent, low-scope-variance, and high-confidence.
- Keep business calculations outside React UI.
- Preserve browser-local `te_projects` compatibility.

## Constraints

- Graph Harness remains the execution evidence source of truth.
- No Graph Harness runtime copy or service dependency.
- No backend, Kubernetes, billing, auth, or SaaS persistence in Phase A.
- Existing estimation formulas and overhead defaults remain unchanged.
- Existing projects load without destructive migration.
- Raw ledger events are evidence; derived measurements are projections.

## Domain model

Primary types:

- `GraphHarnessEventV1`
- `ImportedHarnessEvent`
- `HarnessImportSnapshot`
- `DeliveryTimeObservation`
- `DeliveryBaseline`
- `NodeLifecycle`
- `DeliveryMeasurementSummary`
- `DeliveryComparisonResult`
- `ProjectDeliveryIntelligenceState`

Observation provenance:

- `MEASURED`
- `MANUAL`
- `IMPORTED`
- `INFERRED`
- `UNKNOWN`

Comparison classes:

- `MEASURED_CURRENT`
- `HISTORICAL_COMPARISON`
- `MATCHED_BASELINE`
- `PAIRED_BENCHMARK`
- `CONTROLLED_COMPARISON`
- `CAUSAL_NOT_ESTABLISHED`

## Interfaces

### Graph Harness adapter

Input: canonical `graph-harness.event.v1` JSONL.

Output: raw-preserving import snapshot plus normalized events.

The adapter validates read boundaries but does not recreate Graph Harness transition authorization, gate enforcement, event hashing, or append behavior.

### Measurement engine

Input:

- imported events;
- optional delivery baseline;
- optional time observations.

Output:

- reconstructed node lifecycles;
- calendar metrics;
- explicit touch/runtime metrics;
- quality metrics;
- variance;
- guarded comparison result.

### UI projection

`DeliveryIntelligenceViewModel` exposes the product-oriented progression:

`Plan -> Build -> Verify -> Learn`

The UI label is **Build with Proof**. Graph Harness implementation terminology stays available through evidence rather than becoming required user vocabulary.

## Acceptance criteria

1. Valid Graph Harness JSONL imports with raw lines preserved.
2. Broken sequence/project/hash-chain continuity is rejected.
3. Node lifecycle reconstruction is deterministic.
4. `running -> review` contributes to active cycle time but not human touch.
5. Human touch is only included from explicit observations; inferred observations are separately labeled.
6. Baseline vs actual effort and schedule variance are deterministic.
7. A passed evidence-backed gate plus `done` status produces a verified delivery unit.
8. First-pass gate yield is calculated from the first evaluation per node/revision/gate.
9. Repair and blocked intervals are reconstructed when evidence exists.
10. Causal AI acceleration is hidden unless all controlled-comparison requirements pass.
11. Existing projects without delivery-intelligence state still render.
12. UI does not contain delivery calculations.

## Failure modes

- Empty ledger -> reject.
- Invalid JSON -> reject with line context.
- Unsupported schema/event type -> reject.
- Non-contiguous sequence -> reject.
- Mixed project IDs -> reject.
- Broken supplied hash-chain continuity -> reject.
- Missing baseline -> no variance claim.
- Missing explicit human touch -> no human-effort variance claim.
- Inferred human touch only -> do not treat as actual human touch.
- Weak historical comparison -> descriptive comparison only; no causal factor.

## Tests

Deterministic tests cover:

- valid import and raw preservation;
- broken hash-chain continuity;
- lifecycle reconstruction;
- active cycle vs human-touch separation;
- verified delivery unit derivation;
- effort and schedule variance;
- observed leverage without causal claim;
- controlled-comparison causal guardrail.

Repository gates:

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm audit --omit=dev --audit-level=high
npm run build
git diff --check
```

## Security considerations

- Imported ledgers are parsed as data only.
- No command execution is performed from event payloads.
- Raw evidence is retained for traceability.
- No external transfer is introduced.
- No secrets or credentials are required.

## Migration impact

`Project.deliveryIntelligence` is optional. New projects initialize the state; legacy projects receive it lazily on the first delivery-intelligence mutation. Existing discovery data, activities, formulas, and overheads are preserved.

## Out of scope

- Full Graph Harness runtime inside TimeEstimator.
- Writing events back to Graph Harness.
- Human touch inferred from commits or transitions.
- Evidence graph / transcript ingestion.
- Engineering Pack generation.
- Weekly PM snapshots.
- SaaS/auth/trial/billing.
- Production deployment or merge.
