# Tasks — 008 Project Discovery & Estimation Studio

## Status

`spec_ready`

## File boundaries

### Files that may be read

All repository files needed to understand project persistence, estimation,
process import, reporting, accessibility, testing, and static export.

### Files that may be touched during this specification loop

- `feature_list.json`
- `progress/current.md`
- `progress/history.md`
- `progress/review_003-cinematic-n8n-integration.md`
- `specs/008-project-assessment-estimation-documentation/**`

### Files that must not be touched during this specification loop

- `src/**`
- package manifests and lockfiles
- workflow files
- environment files
- existing formulas or schema implementations
- PR #2, PR #3, or PR #4 state

## Phase plan

Each task starts `pending`. Implementation requires human approval moving Feature
008 from `spec_ready` to `approved`.

### Phase 0 — Defect reproduction and baseline

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0001 | Reproduce RPT-001 Print/PDF failure | ReportDialog, print CSS | Browser available | Manual print preview | Failure captured with browser, viewport, screenshots/PDF | Evidence recorded |
| 008-0002 | Reproduce RPT-002 long PNG | ReportDialog | Browser available | Generate/open PNG | Dimensions and captured scope documented | Evidence recorded |
| 008-0003 | Freeze current calculation outputs | ProjectPageClient tests | None | Deterministic fixtures | Existing totals preserved before refactor | Baseline approved |

### Phase 1 — Data model

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0101 | Add optional versioned discovery fields | types, migration helpers | Approved data model | Migration unit tests | Legacy projects load unchanged | Schema review |
| 008-0102 | Add stable process IDs and edges | process model | 008-0101 | Graph validation tests | Invalid edges rejected safely | Schema review |
| 008-0103 | Add traceability references | traceability module | 008-0101 | Reference resolution tests | Sources resolve or show explicit missing state | Schema review |

### Phase 2 — Assessment UI

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0201 | Build hybrid section navigator | assessment components | Phase 1 | Component keyboard tests | Mobile usable, desktop optimized | UX review |
| 008-0202 | Implement progressive save and unknown values | hooks/storage | 008-0201 | Refresh persistence | No answer loss; unknown is explicit | UX review |
| 008-0203 | Show completeness and evidence status | assessment summary | 008-0202 | Calculation tests | Completeness is deterministic and explainable | UX review |

### Phase 3 — Process ingestion

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0301 | Normalize pasted process formats | parser boundary | Phase 1 | Parsing fixtures | Numbered, bullets, checklist, prose supported | Parser review |
| 008-0302 | Add structured step editor | process components | 008-0301 | Component tests | Actor, system, inputs, outputs, decisions, exceptions editable | UX review |
| 008-0303 | Preserve deterministic/n8n provenance | AI client boundary | 008-0301 | Fallback tests | Source label cannot be confused | Safety review |

### Phase 4 — Estimation mapping

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0401 | Generate traceable activity proposals | estimation proposal service | Phase 3 | Mapping tests | Every proposal cites source steps/answers | Model review |
| 008-0402 | Build review-before-apply workspace | proposal components | 008-0401 | Interaction tests | Edit, exclude, select, and confirm before mutation | UX review |
| 008-0403 | Implement approved scenarios/confidence | estimation engine | Human formula approval | Golden tests | No hidden multiplier or double counting | Formula approval |

### Phase 5 — Documentation generation

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0501 | Generate process overview and inventories | documentation generator | Phases 2–4 | Snapshot/schema tests | Missing facts remain unknown | Content review |
| 008-0502 | Generate risks, plan, and estimate summary | documentation generator | 008-0501 | Traceability tests | Claims link to source or assumption | Content review |
| 008-0503 | Preserve manual overrides on regeneration | artifact reconciliation | 008-0501 | Regeneration tests | Overrides preserved or conflict shown | Content review |

### Phase 6 — Flow rendering

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0601 | Generate Mermaid from structured graph | flow serializer | Phase 3 | Graph fixtures | Required flow patterns render | Architecture review |
| 008-0602 | Provide textual flow alternative | flow components | 008-0601 | Accessibility test | Flow meaning available without diagram | Accessibility review |
| 008-0603 | Define BPMN-compatible export boundary | adapter interface | 008-0601 | Contract test | No BPMN implementation required for MVP | Architecture review |

### Phase 7 — Report architecture

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0701 | Split report data from dialog presentation | report model/components | Phases 4–6 | Render tests | One report model drives all outputs | Architecture review |
| 008-0702 | Add dedicated print route/root | report route | 008-0701 | Route and hydration tests | Report opens independently of dialog transforms | Export review |
| 008-0703 | Add page-break/table/chart policy | print CSS/report components | 008-0702 | Browser PDF matrix | Multi-page report is legible | Export review |

### Phase 8 — PNG summary export

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0801 | Build fixed executive-summary template | summary report component | 008-0701 | Visual snapshot/manual QA | Bounded dimensions and no long page | Export review |
| 008-0802 | Export only summary root | export service | 008-0801 | Generated artifact inspection | No shell/dialog chrome; readable PNG | Export review |
| 008-0803 | Add loading/error/filename handling | export controls | 008-0802 | Failure tests | Honest failure and deterministic naming | Export review |

### Phase 9 — Print/PDF export

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-0901 | Open canonical print surface | export controls | Phase 7 | Browser print test | Preview shows report only | Export review |
| 008-0902 | Validate A4 and Letter pagination | print CSS | 008-0901 | Saved PDF inspection | No clipped sections or unusable tables | Export review |
| 008-0903 | Add chart and table fallbacks | report components | 008-0902 | Long report fixtures | Text remains available if visuals fail | Export review |

### Phase 10 — Accessibility and responsive QA

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-1001 | Validate desktop/tablet/phone workflows | all Feature 008 UI | Phases 2–9 | Manual matrix | No blocking overflow or hidden actions | QA gate |
| 008-1002 | Validate keyboard/dialog behavior | all Feature 008 UI | Phases 2–9 | Keyboard matrix | Focus, Escape, restoration pass | QA gate |
| 008-1003 | Validate reduced motion and contrast | styles/components | Phases 2–9 | Accessibility audit | Required information remains available | QA gate |

### Phase 11 — Migration and regression

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-1101 | Migrate legacy projects lazily | storage migration | Phase 1 | Legacy fixtures | Existing projects remain usable | Regression gate |
| 008-1102 | Protect direct project URL | ProjectPageClient tests | 008-1101 | Hydration regression | Valid URL works; invalid redirects after hydration | Regression gate |
| 008-1103 | Re-run deterministic fallback suite | AI stubs/tests | Phase 3 | Existing/new tests | No endpoint behavior stays honest | Regression gate |

### Phase 12 — Documentation and review

| ID | Objective | Probable files | Dependencies | Required test | Acceptance criterion | Gate |
|---|---|---|---|---|---|---|
| 008-1201 | Update user and architecture docs | README/docs/specs | All phases | Link/content check | Product behavior and limitations documented | Review |
| 008-1202 | Produce review artifact | progress/review_008* | All QA | Evidence audit | Every acceptance criterion has evidence/debt | Review |
| 008-1203 | Final SHIP gate | CI and manual matrix | 008-1202 | Full gate | Checks and artifact inspection pass | Human approval |

## Human gates

- Approve MVP scope and assessment interaction model.
- Approve the deterministic estimation formula and confidence policy.
- Approve Mermaid as the MVP flow renderer.
- Approve PNG as executive-summary-only.
- Approve dedicated print route/root.
- Approve any dependency before installation.
- Approve implementation before Feature 008 leaves `spec_ready`.