# Current Progress

## Active feature

`003-cinematic-n8n-integration`

Status: `in_progress`

Mode: `SHIP`

## Current state

Integration work is active on branch:

`feature/cinematic-n8n-integration`

Feature 002 is blocked pending consolidation with the verified n8n/Pages
runtime from PR #3. The user approved feature 003 and its merge policy on
2026-07-11.

## Approved integration scope

- Preserve the cinematic Command Center and harness from PR #2.
- Integrate the n8n runtime, deterministic fallbacks, persistence, tests,
  security controls, and static Pages workflow from PR #3.
- Resolve shared UI files manually rather than accepting either branch wholesale.
- Preserve current estimation formulas and activity data semantics.
- Produce one consolidated PR that supersedes PR #2 and PR #3 after review.

## Preserved behavior

The effort formulas are preserved:

- total effort = sum of activity effort;
- core effort = sum of activities marked `core`;
- supervised effort = sum of activities marked `supervised`;
- overheads = total effort multiplied by configured percentages;
- grand total = total effort + contingency + delivery support overheads.

## Verification plan

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm audit --omit=dev`
- `npm audit`
- desktop/mobile smoke test
- project persistence and n8n fallback verification

## Current integration risks

- Both branches modify central UI, package, layout, and deployment files.
- PR #3's dashboard must not replace the cinematic page composition.
- PR #2's legacy Genkit/build configuration must not replace the verified static runtime.
- Actual n8n endpoints are external and must not introduce browser-visible secrets.
