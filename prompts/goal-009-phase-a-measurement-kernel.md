# Goal 009-A — Measurement Kernel

Implement Feature 009 Phase A on `feature/009-ai-delivery-intelligence` using issue #17 as the tracking issue.

## Objective

Turn Graph Harness execution evidence into deterministic delivery measurements without copying or replacing Graph Harness runtime behavior.

## Required cycle

1. Read `graph-harness.event.v1` JSONL as evidence.
2. Preserve raw event lines.
3. Normalize events into a TimeEstimator read model.
4. Reconstruct node lifecycle by revision.
5. Derive calendar, blocked, repair, gate, verified-unit, and throughput metrics.
6. Accept explicit human touch / agent / verification / repair / wait observations.
7. Associate baseline estimates.
8. Calculate effort and schedule variance.
9. Prevent unsupported causal AI acceleration claims.
10. Project measurements into a simple `Plan -> Build -> Verify -> Learn` UI.
11. Keep business logic out of React.
12. Keep browser-local persistence backward compatible.
13. Add deterministic tests.
14. Run repository gates and repair failures locally to the changed scope.
15. Update spec, feature list, progress history/current, issue, and Draft PR.
16. Stop before merge.

## Human gates

Do not merge, deploy production, introduce billing, delete data, or make irreversible migrations.
