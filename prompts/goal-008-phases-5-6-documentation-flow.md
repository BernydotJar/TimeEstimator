# Goal — Feature 008 Phases 5–6

Implement structured documentation generation and derived flow projections for Project Discovery & Estimation Studio.

## Scope

- Generate eight structured artifact drafts: Process Overview, Current-State Flow, Proposed Future-State Flow, Activity Breakdown, Assumptions and Risks, Integration Inventory, Initial Delivery Plan, and Estimation Summary.
- Preserve unknowns, assumptions, warnings, provenance, source references, generator version, input snapshot hash, and artifact lifecycle metadata.
- Preserve manual sections and locked overrides during regeneration unless the user explicitly chooses replacement.
- Record reconciliation decisions and conflicts.
- Generate deterministic Mermaid `flowchart TD` from the structured graph.
- Reuse the textual flow serializer as an accessible fallback.
- Define a BPMN-compatible contract boundary without implementing a full exporter or adding dependencies.
- Persist artifacts inside the existing browser-local project discovery envelope.
- Integrate artifact navigation, preview, copy, source inspection, manual notes, and regeneration controls into `/project?id=<id>`.

## Safety

- Structured models remain source of truth.
- Missing facts remain unknown.
- Generated claims never become observed evidence.
- No silent manual override loss.
- No external data transmission.
- No dependency, formula, overhead, workflow, backend, database, or authentication change.
- No automatic merge.

## Validation

Run dependency installation, typecheck, lint, tests, production audit, static build, and `git diff --check`. Perform browser QA at 320px, 390px, 768px and desktop when available; otherwise record concrete debt.
