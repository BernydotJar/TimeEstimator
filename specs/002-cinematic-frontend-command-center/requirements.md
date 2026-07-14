# Requirements — 002 Cinematic frontend command center

## Feature

Rebuild TimeEstimator's primary UX into a cinematic RPA estimation command center.

## Mode

SHIP

## Status

spec_ready

## User goal

Use the harness-sdlc workflow to improve TimeEstimator substantially, with a cinematic frontend point of view.

## Current product baseline

TimeEstimator already supports RPA activity capture, overhead configuration, effort totals, and report generation. The current README positions the product as an RPA effort-estimation accelerator for moving from discovery to sizing in minutes instead of days.

## Problems to solve

- The current UI feels like a prototype instead of an executive-ready estimation product.
- Main UI, state, calculations, and export behavior are concentrated in `src/app/page.tsx`.
- Visual design uses broad neon/glassmorphism effects without enough semantic hierarchy.
- The activity table is dense and does not guide users through assessment flow.
- The report surface is separated from the main experience and has duplicated export behavior.
- Accessibility improvements exist, but cinematic UI work must preserve contrast, keyboard use, aria status, and reduced-motion behavior.

## Product requirements

### R1 — Cinematic command-center layout

The page must be reorganized into a premium command-center layout:

- hero/status header;
- executive estimate totals;
- guided activity intake;
- activity ledger;
- assumptions/risk panel;
- overhead configuration panel;
- report/export panel.

### R2 — Executive-first hierarchy

The grand total, core effort, supervised effort, contingency, and delivery-support effort must be visible without requiring users to inspect the table first.

### R3 — Guided activity capture

Activity entry must feel like a workflow, not a flat form. Inputs should be grouped into meaningful sections:

- process/application context;
- automation channel/tool;
- activity classification;
- effort/risk assumptions;
- exception complexity.

### R4 — Cinematic visual language

The UI must use a controlled cinematic system:

- dark base;
- glass/depth only where it improves hierarchy;
- cyan for primary data surfaces;
- amber for assumptions/risk/attention;
- magenta used sparingly for emphasis;
- no random confetti or uncontrolled neon noise.

### R5 — Responsive and workshop-friendly

The UI must work for:

- desktop discovery workshops;
- screen sharing;
- laptop width;
- tablet-ish narrow layouts.

### R6 — Accessibility and reduced motion

The UI must preserve:

- keyboard operation;
- accessible labels;
- sufficient contrast;
- screen-reader status updates for long actions;
- `prefers-reduced-motion` behavior.

### R7 — Export/report continuity

Report generation must feel like part of the command center. Export buttons must not be visually disconnected from the estimate summary.

### R8 — No formula drift

This feature may reorganize UI and component boundaries, but it must not silently change estimation formulas. Any formula change requires a separate approved feature.

## Engineering requirements

- Extract reusable presentation components from `src/app/page.tsx`.
- Keep existing activity data shape unless a later spec approves a model change.
- Preserve existing report export behavior while improving the surface.
- Avoid dependency installation unless explicitly approved.
- Do not rely on disabled TypeScript or ESLint checks for SHIP closure.

## Non-goals

- No backend persistence.
- No database.
- No auth.
- No pricing/commercial model.
- No formula overhaul.
- No AI estimation behavior changes.
- No package installation unless separately approved.

## Acceptance criteria

- UI is visibly upgraded into a cinematic command center.
- Main summary metrics are above the fold on desktop.
- Activity form is grouped and easier to scan.
- Activity ledger remains readable with all current fields.
- Report/export flow remains functional.
- Theme/motion choices do not break accessibility.
- `src/app/page.tsx` is smaller and delegates meaningful UI sections to components.
- Build/typecheck strategy is documented in review output.
- Reviewer can compare before/after against this spec.

## Required verification

At minimum:

```sh
npm run typecheck
npm run build
```

If these fail because current repo configuration suppresses errors or lacks static export setup, the implementer must record exact failure evidence and either fix within approved scope or mark blocked.
