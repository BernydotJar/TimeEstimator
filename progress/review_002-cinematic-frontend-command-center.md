# Review — 002 Cinematic frontend command center

## Status

`review`

## Summary

Implemented the cinematic frontend command-center refactor for TimeEstimator on branch `feature/harness-cinematic-frontend`.

This implementation converts the main page from a single dense form/table file into a composed cockpit-style UI with executive metrics, guided activity intake, an audit ledger, assumptions/risk surfacing, overhead configuration, and export-ready reporting.

## Files changed

### Product UI

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`

### New component files

- `src/app/components/CinematicBackground.tsx`
- `src/app/components/CommandHeader.tsx`
- `src/app/components/EstimateMetricsDeck.tsx`
- `src/app/components/ActivityIntakePanel.tsx`
- `src/app/components/ActivityLedger.tsx`
- `src/app/components/OverheadConfigDialog.tsx`
- `src/app/components/RiskAssumptionPanel.tsx`
- `src/app/components/ReportPanel.tsx`
- `src/app/components/estimate-types.tsx`

### Cleaned legacy component

- `src/app/components/EstimateReport.tsx`

### Harness/progress files

- `feature_list.json`
- `progress/current.md`
- `progress/history.md`

## Acceptance criteria review

- Cinematic command-center layout: implemented.
- Executive totals above the fold: implemented through `CommandHeader` and `EstimateMetricsDeck`.
- Guided activity capture: implemented through grouped intake sections.
- Activity ledger auditability: preserved through full-field table display.
- Risk and assumptions panel: implemented as derived display only; no formula changes.
- Overhead configuration: preserved and moved into a governed panel.
- Report/export flow: preserved through PNG + metadata export from the report surface.
- Product metadata: updated from Firebase Studio placeholder to TimeEstimator branding.
- Reduced motion: CSS now includes a `prefers-reduced-motion` block.

## Formula-safety notes

The implementation preserves the existing formulas:

```text
total effort = sum(activity.effort)
core effort = sum(activity.effort where coreSupervised === "core")
supervised effort = sum(activity.effort where coreSupervised === "supervised")
contingency = total effort * contingency percentage
pm = total effort * pm percentage
sa = total effort * sa percentage
sdd = total effort * sdd percentage
release config = total effort * release config percentage
user manual = total effort * user manual percentage
grand total = total effort + contingency + pm + sa + sdd + release config + user manual
```

No business formula changes were intentionally introduced.

## Verification attempted

Attempted to clone and run local verification from the execution environment:

```sh
git clone --depth 1 --branch feature/harness-cinematic-frontend https://github.com/BernydotJar/TimeEstimator.git /tmp/TimeEstimator
```

Result:

```text
fatal: unable to access 'https://github.com/BernydotJar/TimeEstimator.git/': Could not resolve host: github.com
```

Because the environment could not resolve GitHub DNS, `npm run typecheck` and `npm run build` were not executed locally.

## Required reviewer checks

Before marking `done`, run:

```sh
npm run typecheck
npm run build
```

Also validate manually:

- data entry and add activity flow;
- core/supervised totals;
- overhead percentage updates;
- report PNG export;
- metadata JSON export;
- keyboard navigation;
- desktop and narrow responsive layouts;
- light/dark toggle behavior.

## Known risks outside this feature

These were not changed because they are outside the approved file boundaries:

- `next.config.ts` still has `typescript.ignoreBuildErrors: true`.
- `next.config.ts` still has `eslint.ignoreDuringBuilds: true`.
- GitHub Pages workflow expects `./out`, but static export is not configured.
- GitHub Pages workflow references `src/ai/stubs/*`, but those stubs were not found on main.

Recommended next feature: `006-github-pages-deploy-hardening` or a narrow build-gate fix before production closure.

## Decision

Ready for human/code review. Do not mark as `done` until verification evidence is available.
