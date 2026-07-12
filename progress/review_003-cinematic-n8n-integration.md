# Review — 003 Cinematic n8n integration

## Status

`review`

## Summary

Feature 003 consolidates the cinematic Command Center from PR #2 with the
static n8n runtime, browser persistence, security controls, test infrastructure,
and GitHub Pages deployment from PR #3.

The root route is now a cinematic project command deck. Each project opens a
cinematic `/project?id=...` workspace with executive metrics, guided activity
entry, process-step import, n8n configuration, deterministic fallbacks,
assumption/risk surfacing, overhead defaults, activity ledger, and reports.

## Conflict resolution evidence

The merge produced five conflicts:

- `src/app/page.tsx`: manually rebuilt as a persistent cinematic dashboard.
- `src/app/globals.css`: preserved the PR #2 cinematic visual system.
- `src/app/layout.tsx`: retained PR #3 metadata/base-path behavior with
  cinematic product positioning.
- `src/app/components/EstimateReport.tsx`: preserved cinematic export and
  metadata behavior.
- `src/app/components/OverheadConfigDialog.tsx`: retained PR #3 functional
  presets/n8n defaults and restyled it for the cinematic system.

No global ours/theirs resolution was used.

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

```text
npm ci                     PASS
npm run lint               PASS
npm run typecheck          PASS
npm test                   PASS — 8 suites / 17 tests
npm audit --omit=dev       PASS — 0 vulnerabilities
npm audit                  PASS — 0 vulnerabilities
GitHub Pages static build  PASS — / and /project exported
git diff --check           PASS
```

Coverage includes:

- project creation and persistence;
- persisted project workspace loading;
- manual activity entry and metric recalculation;
- process-step import with local fallback;
- all four local AI fallbacks;
- n8n configuration validation;
- versioned n8n request envelope;
- real HTTP exchange against an n8n-compatible contract server.

## Visual and manual review

The in-app browser was not available (`iab` discovery returned no browser
instances), so no honest desktop/mobile screenshot review could be completed in
this implementation session.

Required human checks before `done`:

- root dashboard at desktop and phone widths;
- project workspace at desktop and phone widths;
- create/open/refresh persistence;
- theme toggle;
- AI fallback copy and step import;
- overhead presets/defaults;
- report dialog, PNG export, and print/PDF;
- keyboard focus and dialog scrolling.

## Decision

Ready for consolidated PR review. Keep feature 003 in `review` until the visual
and manual export checks pass. PR #2 and PR #3 must remain open until the
consolidated PR is approved, then they may be closed as superseded.
