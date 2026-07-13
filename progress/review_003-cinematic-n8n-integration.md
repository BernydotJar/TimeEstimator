# Review — 003 Cinematic n8n integration

## Status

`review`

## Pull request

PR #4: `feature/cinematic-n8n-integration` → `main`

The PR remains Draft. No merge, deployment, superseded-PR closure, or branch
deletion is included in this review cycle.

## Summary

Feature 003 consolidates the cinematic Command Center from PR #2 with the
static n8n runtime, browser persistence, security controls, test infrastructure,
and GitHub Pages build workflow from PR #3.

The root route is a cinematic project command deck. Each project opens a
cinematic `/project?id=...` workspace with executive metrics, guided activity
entry, process-step import, n8n configuration, deterministic fallbacks,
assumption/risk surfacing, overhead defaults, activity ledger, and reports.

## Hydration incident and correction

The attempted hydration fix at commit `97dc283` truncated
`src/app/project/ProjectPageClient.tsx` to an incomplete import and caused:

```text
TS1128: Declaration or statement expected
```

The corrected implementation restores the workspace and uses the explicit
`hydrated` state from `useLocalStorage`:

1. server render and first client render show the same loading surface;
2. no `window` or `localStorage` read occurs during render;
3. the persisted project is resolved only after hydration;
4. unknown or missing IDs redirect only after hydration;
5. corrupt stored JSON falls back safely and then redirects.

Added test coverage verifies persisted project loading, activity recalculation,
persistence, delayed invalid-ID redirect, and corrupt-storage fallback.

## Functional invariants

The formulas remain unchanged:

```text
base = sum(activity effort)
core = sum(core activity effort)
supervised = sum(supervised activity effort)
each overhead = base × configured percentage
grand total = base + all overhead components
```

Genkit and Firebase remain absent from the static runtime. Missing or
unreachable n8n endpoints use deterministic local behavior and do not erase
browser-local project data.

## Automated verification

GitHub Actions run `29182170461` completed successfully on hydration-fix head
`2cc15f0`:

```text
dependency installation       PASS
npm run typecheck             PASS
npm run lint                  PASS
npm test                      PASS
npm audit --omit=dev          PASS
GitHub Pages static build     PASS
deploy                        SKIPPED — pull-request branch
```

The branch later added and loaded `src/app/print.css` to isolate report content
for browser print/PDF. A final CI run on the latest documentation head is still
required before requesting review.

## Code-level QA preflight

Observed in code:

- responsive dashboard and project grids use phone-first breakpoints;
- project action controls remain visible on phone widths;
- Radix dialogs provide focus trapping, Escape close, and focus restoration;
- report dialog has a viewport-height limit and vertical scrolling;
- focus rings are defined for dialog close and form controls;
- `prefers-reduced-motion` disables meaningful animation and smooth scrolling;
- PNG export uses a white capture background and a deterministic filename;
- print/PDF now loads a dedicated print stylesheet that hides application chrome
  and exposes only the report body.

This is a preflight inspection, not a substitute for visual observation.

## Manual QA checklist

Required before changing PR #4 from Draft to Ready for review:

- [ ] Dashboard at desktop width.
- [ ] Dashboard at tablet width.
- [ ] Dashboard at phone width.
- [ ] Project workspace at desktop width.
- [ ] Project workspace at tablet width.
- [ ] Project workspace at phone width.
- [ ] Create project, open it, refresh, and confirm persistence.
- [ ] Open a valid `/project?id=...` URL directly.
- [ ] Confirm an unknown ID redirects only after the loading state.
- [ ] Theme toggle and contrast in both themes.
- [ ] Create, rename, delete, AI integration, overhead, and report dialogs.
- [ ] Keyboard Tab/Shift+Tab, visible focus, Escape close, and focus restoration.
- [ ] Long dialog content scrolls without trapping inaccessible controls.
- [ ] Deterministic AI fallback copy and process-step import.
- [ ] Save PNG and inspect the resulting file.
- [ ] Open print preview and inspect PDF pagination/content isolation.

## Verification debt

No interactive browser is available in the current execution environment, so
none of the unchecked visual and artifact checks can honestly be marked PASS.
A real public n8n endpoint was not configured; deterministic fallback coverage
is sufficient for Feature 003, while real-endpoint validation remains optional
integration debt requiring an approved public endpoint.

## Decision

`REVIEW`

Keep Feature 003 in `review` and PR #4 in Draft until the manual QA checklist
passes. PR #2 and PR #3 remain open for traceability until PR #4 is approved.
