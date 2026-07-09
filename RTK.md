# TimeEstimator Repo Tooling Kit

TimeEstimator is an RPA effort-estimation product built with Next.js, React, Tailwind, Genkit/Gemini flows, and GitHub Pages deployment.

This repository now follows the `harness-sdlc` operating model: spec first, approved scope second, implementation third, verification before close.

## Product Direction

TimeEstimator should become a cinematic estimation command center for automation architects.

The frontend point of view is:

- premium dark command-center UI;
- RPA assessment workflow clarity over decorative noise;
- executive-ready summaries;
- fast data entry for discovery workshops;
- visual hierarchy based on totals, risk, assumptions, and delivery confidence;
- motion and lighting used as product affordances, not as distraction.

## Core Rule

Do not implement app code until a feature is specified, reviewed, and explicitly approved by a human.

Documentation, harness files, progress files, and specs may be prepared to make scope reviewable.

## Lifecycle

Features move through this lifecycle:

`pending -> spec_ready -> approved -> in_progress -> review -> done`

Additional stop state:

`blocked`

Allowed statuses:

- `pending`
- `spec_ready`
- `approved`
- `in_progress`
- `review`
- `done`
- `blocked`

At most one feature may be active at a time across:

- `approved`
- `in_progress`
- `review`

## Modes

Use one of two modes for every feature:

- `MVP`: fast validated prototype or internal demo.
- `SHIP`: shippable product increment with production-grade gates.

SHIP mode requires security, data correctness, performance, accessibility, failure-mode handling, operational readiness, and verification evidence.

## Source Of Truth

The source of truth is, in order:

1. `feature_list.json`
2. `specs/<feature-id>/requirements.md`
3. `specs/<feature-id>/design.md`
4. `specs/<feature-id>/tasks.md`
5. `progress/current.md`
6. `progress/history.md`

If instructions conflict, stop and ask for human clarification.

## File-Bound Execution

Every operational prompt must define:

- FILES YOU MAY READ
- FILES YOU MAY TOUCH
- FILES YOU MUST NOT TOUCH

Agents must respect those boundaries.

## Role Separation

Leader:

- Orchestrates the workflow.
- Selects only one feature at a time.
- Delegates specification, implementation, and review.
- Must not implement app code directly when acting as Leader.

Spec Author:

- Creates `requirements.md`, `design.md`, and `tasks.md`.
- Defines MVP and SHIP criteria.
- Stops before implementation.

Implementer:

- Implements only approved specs.
- Obeys file boundaries.
- Runs required verification.
- Must not approve its own work.
- Must not mark features done.

Reviewer:

- Validates implementation against spec, tests, architecture rules, and mode criteria.
- Must not edit production code while reviewing.
- Writes review reports under `progress/review_<feature-id>.md`.

Production Reviewer:

- Used in SHIP mode.
- Validates production-readiness gates.
- Can reject a feature even when tests pass.

## Current Technical Findings

The initial repository review found these product and engineering risks:

- `src/app/page.tsx` owns too much state, calculation logic, UI layout, report generation, and export behavior.
- `src/app/components/EstimateReport.tsx` duplicates report-export behavior and currently imports React twice.
- `next.config.ts` ignores TypeScript and ESLint build errors; this must be removed before SHIP.
- GitHub Pages deployment expects `./out`, but `next.config.ts` does not declare static export output.
- The Pages workflow copies AI stubs from `src/ai/stubs/*`, but those files are not present on main.
- `src/app/layout.tsx` still uses generic Firebase Studio metadata.
- Estimation matrix data exists, but the main form still relies on manual effort entry instead of a clearly governed calculation engine.

## Cinematic Frontend Rules

Use this aesthetic direction for frontend implementation:

- Dark cinematic base, not random neon.
- Use cyan, graphite, warm amber, and controlled magenta only as semantic accents.
- Prioritize large executive totals, confident spacing, and panel depth.
- Use cards as instrument panels: Estimate, Risk, Assumptions, Activities, Export.
- Avoid confetti-like visual noise in the production UI.
- Respect `prefers-reduced-motion`.
- Keep forms readable under workshop conditions and screen sharing.
- Maintain keyboard navigation and high contrast.
- No decorative animation may block interaction, degrade export, or reduce accessibility.

## Context Documentation Policy

Use current external documentation checkpoints for framework/API work such as:

- Next.js 15
- React
- Tailwind
- Radix UI
- Genkit
- GitHub Actions / Pages
- testing libraries selected in an approved spec

Do not use external documentation for simple local bookkeeping, progress updates, or markdown-only edits.

## Verification Commands

Minimum verification for app changes:

```sh
npm run typecheck
npm run build
```

Before SHIP closure, the project must not rely on:

- `typescript.ignoreBuildErrors: true`
- `eslint.ignoreDuringBuilds: true`

A cinematic frontend implementation must also include a lightweight visual/accessibility review artifact.

## Forbidden Without Explicit Approval

- Package installs
- Dependency upgrades
- Schema changes
- Database write commands
- Destructive filesystem commands
- Commands that expose secrets
- Deployments or release actions
- Network calls not required by an approved docs checkpoint
- Changing estimation formulas without a spec explaining the business rationale
