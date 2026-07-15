# Current Progress

## Selected feature

`008-project-assessment-estimation-documentation`

Status: `in_progress`

Mode: `SHIP`

Implementation branch: `feature/008-documentation-flow`

Base: `main` after Phase 4A merge commit `cf18f21f7c531091a7d014132ef34b0f1fd3ab2d`

Tracking issue: `#13 Feature 008 Phases 5–6 — Documentation and flow projections`

Draft PR: `#14 feat: add structured documentation and flow projections`

## Lifecycle

- Feature 003: `blocked`; merged implementation remains in `main`, with RPT-001, RPT-002, and browser QA unresolved.
- Feature 008: `in_progress`.
- Phase 1: `PASS`.
- Phase 2: `PASS`.
- Phase 3: `PASS`.
- Phase 4A: `PASS`; PR #12 merged into `main` at `cf18f21f7c531091a7d014132ef34b0f1fd3ab2d`.
- Phase 4B: not implemented in this branch.
- Phases 5–6: `REVIEW` in Draft PR #14; automated gates pass.

## Completed scope for review

- `008-0501` process overview and inventories.
- `008-0502` assumptions/risks, delivery plan, and estimation summary.
- `008-0503` manual-safe regeneration with reconciliation history.
- `008-0601` deterministic Mermaid projection from the structured graph.
- `008-0602` accessible textual flow alternative.
- `008-0603` BPMN-compatible export boundary without a full exporter.

## Implemented increments

- Extended the documentation domain additively with generator metadata, warnings, unknowns, assumptions, manual override metadata, and reconciliation history.
- Added deterministic generation for eight structured artifact drafts, input snapshot hashing, generator versioning, and Markdown projection.
- Added explicit regeneration decisions that preserve locked/manual sections by default, expose conflicts, and require explicit replacement to discard manual content.
- Added deterministic Mermaid `flowchart TD` projection with safe node IDs, escaped labels, branch labels, source references, and missing-endpoint warnings.
- Reused the existing textual flow serializer as the accessible fallback.
- Added a BPMN-compatible contract boundary for events, tasks, gateways, sequence flows, lanes, extensions, source references, and warnings; no exporter or dependency was added.
- Added browser-local artifact persistence and audit entries within the existing discovery envelope.
- Added a Documentation Studio entry and review workspace with artifact navigation, structured preview, source inspection, manual notes, regeneration controls, Markdown copy, Mermaid source copy, textual flow copy, warnings, unknowns, and reconciliation history.
- Integrated the workspace into `/project?id=<id>` without changing formulas or report calculations.
- Added domain, persistence, and component tests.
- Added execution prompt `prompts/goal-008-phases-5-6-documentation-flow.md`.

## Protected invariants

- Structured assessment, process, proposal, activity, and estimation models remain source of truth.
- Mermaid, Markdown, textual flow, and BPMN boundary are derived projections only.
- Missing values remain unknown and scenario ranges are not asserted when unavailable.
- Generated claims are not promoted to observed evidence.
- Manual sections are not removed without an explicit replacement decision.
- Existing formulas, `DEFAULT_OVERHEAD`, activities, reports, routes, dependencies, workflows, static export, and `te_projects` compatibility remain unchanged.
- No backend, database, authentication, external transmission, BPMN library, or full BPMN exporter was added.

## Automated verification

GitHub Actions run `29396226248` passed against implementation and tracking HEAD `cb639ec5cb8ddc487b9dd94a4f1bda50b44b34ab`:

- checkout and Node setup — PASS;
- dependency installation — PASS;
- typecheck — PASS;
- lint — PASS;
- tests — PASS;
- production dependency audit — PASS;
- static build — PASS.

A final Actions recheck is required for this review-status documentation commit.

## Remaining review debt

- `git diff --check` in a synchronized checkout.
- Real-browser QA at 320px, 390px, 768px, and desktop.
- Keyboard navigation, focus visibility, copy controls, screen-reader structure, and responsive overflow confirmation.
- Visual confirmation that long Mermaid/text/table content remains usable on mobile.

## Next gate

Confirm the final documentation-only HEAD remains green, complete or explicitly accept browser QA debt, review Draft PR #14, and stop before merge.
