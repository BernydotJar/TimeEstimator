# Tasks — 002 Cinematic frontend command center

## Status

`spec_ready`

Do not implement until explicitly approved.

## Implementation tasks

- [ ] Read `AGENTS.md`, `RTK.md`, `feature_list.json`, and this spec.
- [ ] Confirm no other feature is active.
- [ ] Move feature 002 to `approved` only after human approval.
- [ ] Create/refactor UI components:
  - [ ] `CommandHeader.tsx`
  - [ ] `EstimateMetricsDeck.tsx`
  - [ ] `ActivityIntakePanel.tsx`
  - [ ] `ActivityLedger.tsx`
  - [ ] `OverheadConfigDialog.tsx`
  - [ ] `ReportPanel.tsx`
  - [ ] `RiskAssumptionPanel.tsx`
  - [ ] `CinematicBackground.tsx`
- [ ] Refactor `src/app/page.tsx` to compose these components.
- [ ] Preserve existing activity fields and totals.
- [ ] Preserve export/save behavior.
- [ ] Replace noisy confetti aesthetic with cinematic background treatment.
- [ ] Update metadata only if included in approved file boundaries.
- [ ] Check responsive layout.
- [ ] Check keyboard navigation and label continuity.
- [ ] Run verification commands.
- [ ] Write `progress/review_002-cinematic-frontend-command-center.md` with evidence.

## Suggested file boundaries for implementation

FILES YOU MAY READ:

- `AGENTS.md`
- `RTK.md`
- `feature_list.json`
- `progress/current.md`
- `src/app/page.tsx`
- `src/app/data.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/components/EstimateReport.tsx`
- `src/components/ui/*`
- `tailwind.config.ts`
- `next.config.ts`
- `package.json`

FILES YOU MAY TOUCH:

- `feature_list.json`
- `progress/current.md`
- `progress/history.md`
- `progress/review_002-cinematic-frontend-command-center.md`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/components/EstimateReport.tsx`
- `src/app/components/*.tsx`

FILES YOU MUST NOT TOUCH:

- `package.json`
- `package-lock.json`
- `src/ai/**`
- `.github/workflows/**`
- `next.config.ts`

Exception: if build is impossible because of a narrow frontend-adjacent issue, stop and report the blocker instead of expanding scope silently.

## Review checklist

- [ ] Visual hierarchy is materially improved.
- [ ] UX supports workshop usage.
- [ ] Current calculations remain unchanged.
- [ ] Export still works.
- [ ] Accessibility is preserved or improved.
- [ ] No unauthorized files changed.
- [ ] Verification evidence is captured.
