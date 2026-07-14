# Design — 002 Cinematic frontend command center

## Design intent

Transform the app from a neon form/table prototype into a polished estimation cockpit for RPA architects.

The visual metaphor is not "cyberpunk decoration." It is a dark operations room where every panel supports a delivery decision.

## Proposed component structure

```text
src/app/
  page.tsx
  data.ts
  components/
    CommandHeader.tsx
    EstimateMetricsDeck.tsx
    ActivityIntakePanel.tsx
    ActivityLedger.tsx
    OverheadConfigDialog.tsx
    ReportPanel.tsx
    RiskAssumptionPanel.tsx
    CinematicBackground.tsx
    EstimateReport.tsx
```

## Page responsibilities after refactor

`src/app/page.tsx` should remain the orchestration surface:

- state initialization;
- event handlers;
- calculation derivation;
- component composition.

It should not own most JSX details for each product region.

## UI layout

### 1. Command header

Purpose:

- identify product;
- communicate current estimate status;
- expose theme/action controls.

Suggested content:

- `TimeEstimator`;
- subtitle: `RPA estimation command center`;
- status chips: activities count, grand total, export readiness.

### 2. Metrics deck

Purpose:

- make totals immediately visible.

Cards:

- Grand Total Effort;
- Core Effort;
- Supervised Effort;
- Delivery Support;
- Contingency.

### 3. Activity intake panel

Purpose:

- guide discovery workshop capture.

Groups:

- Application and adapter;
- Activity and type;
- Automation platform and surface;
- Effort and assumptions;
- Exception complexity.

### 4. Activity ledger

Purpose:

- preserve current table auditability but improve density and hierarchy.

Behavior:

- horizontal scroll is acceptable;
- totals row must remain clear;
- empty state should tell user what to add next.

### 5. Risk and assumptions panel

Purpose:

- make assumptions visible instead of buried in row fields.

Initial implementation can derive a simple list from entered activities. No new formula logic required.

### 6. Report panel

Purpose:

- make export feel like a formal artifact.

Keep existing PNG and metadata export unless a separate feature changes export formats.

## Visual system

### Base

- deep graphite / near-black background;
- subtle radial gradients;
- no high-frequency confetti particles.

### Panels

- translucent dark panels;
- thin border highlights;
- clear spacing;
- restrained glow.

### Semantic color

- cyan: primary data and active controls;
- amber: assumptions, risk, attention;
- magenta: sparse premium accent;
- white/gray: body text and labels.

### Motion

- background motion must be optional and respect `prefers-reduced-motion`;
- no animation loop should run unnecessarily when static visual treatment is enough.

## Engineering notes

### Calculation safety

Do not change overhead percentages or total formulas in this feature.

Current totals should remain equivalent:

- total effort = sum of activity effort;
- core/supervised effort = sum by `coreSupervised`;
- overheads = total effort multiplied by configured percentages;
- grand total = total effort + overhead components.

### Export safety

The current app hides buttons before `html2canvas` capture and injects metadata before export. Preserve the behavior unless a defect is explicitly fixed and documented.

### Accessibility

- All form controls keep labels.
- Decorative backgrounds remain `aria-hidden`.
- Export/save flows preserve `aria-live` status.
- Color contrast must be checked for labels, table text, and metric values.

## SHIP risks

- Current `next.config.ts` ignores TypeScript and ESLint errors. SHIP implementation should not depend on this.
- `EstimateReport.tsx` currently imports React twice; this must be corrected if touched.
- GitHub Pages static export may fail until feature 005 hardens deployment.

## Out-of-scope files unless necessary

Avoid modifying AI flow files, GitHub workflow, package files, or deployment config in this feature unless implementation reveals that a frontend build cannot pass without a narrow fix.
