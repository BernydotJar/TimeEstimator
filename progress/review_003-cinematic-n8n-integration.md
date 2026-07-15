# Review — 003 Cinematic n8n integration

## Status

`blocked`

## Delivery state

Feature 003 implementation was merged into `main` through PR #4. The former integration branch was later deleted. Moving the feature to `blocked` does not revert or remove any merged implementation.

## Why closure is blocked

Two reproducible export defects remain:

### RPT-001 — Print/PDF unusable

The report is printed from a Radix dialog with viewport-bound height, overflow, modal layout context, and responsive charts. The current behavior does not produce a usable, correctly paginated stakeholder report.

Required resolution:

- isolated printable surface;
- no application or dialog chrome;
- browser-local hydration;
- A4 and Letter support;
- semantic page breaks;
- readable multipage tables and charts;
- direct artifact inspection.

### RPT-002 — Save PNG excessively tall

The current `html2canvas` target is the complete report container at scale 2. It creates one excessively tall image rather than a bounded executive summary.

Required resolution:

- purpose-built executive-summary component;
- bounded dimensions;
- theme-independent export surface;
- no detailed tables, shell, controls, or hidden overflow;
- direct generated-file inspection.

## Verified behavior retained

- The Feature 003 runtime and cinematic workspace are merged in `main`.
- Direct `/project?id=<id>` loading works after browser-local hydration.
- Invalid IDs redirect only after hydration.
- Corrupt local storage fails safely.
- Existing formulas remain:

```text
base = sum(activity effort)
core = sum(core activity effort)
supervised = sum(supervised activity effort)
each overhead = base × configured percentage
grand total = base + all overhead components
```

- n8n remains optional and deterministic local fallbacks remain available.

## Relationship to Feature 008

Feature 008 is explicitly approved to implement the broader Project Discovery & Estimation Studio and includes the corrective report architecture for RPT-001 and RPT-002.

Feature 003 is moved from `review` to `blocked` so it is no longer an active lifecycle item while Feature 008 proceeds. Feature 003 may move to `done` only after the export defects and remaining browser checks are resolved and reviewed with evidence.

## Remaining verification debt

- desktop, tablet, and phone browser matrix;
- keyboard focus, Escape, focus restoration, and dialog scrolling;
- deterministic fallback/import observation;
- bounded PNG generation and file inspection;
- multipage Print/PDF preview and saved-file inspection.

## Decision

`BLOCKED`
