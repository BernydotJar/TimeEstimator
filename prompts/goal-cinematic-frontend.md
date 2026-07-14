# Goal Prompt — Cinematic Frontend Command Center

Use this prompt only after feature `002-cinematic-frontend-command-center` is explicitly approved.

```text
MODE: SHIP
FEATURE: 002-cinematic-frontend-command-center
STATE: approved
SOURCE OF TRUTH:
- feature_list.json
- specs/002-cinematic-frontend-command-center/requirements.md
- specs/002-cinematic-frontend-command-center/design.md
- specs/002-cinematic-frontend-command-center/tasks.md
- RTK.md

DO:
- Rebuild TimeEstimator's frontend into a cinematic RPA estimation command center.
- Preserve current calculation behavior unless the spec explicitly says otherwise.
- Refactor src/app/page.tsx into meaningful components.
- Replace noisy neon/confetti aesthetics with a premium dark command-center visual system.
- Keep forms readable, accessible, and workshop-friendly.
- Preserve report/export behavior.
- Respect reduced motion.
- Capture verification evidence in progress/review_002-cinematic-frontend-command-center.md.

DON'T:
- Do not install packages.
- Do not change estimation formulas.
- Do not touch AI flows.
- Do not touch GitHub workflow files.
- Do not touch deployment config.
- Do not ignore TypeScript or lint errors silently.
- Do not mark the feature done.

FILES YOU MAY READ:
- AGENTS.md
- RTK.md
- feature_list.json
- progress/current.md
- src/app/page.tsx
- src/app/data.ts
- src/app/globals.css
- src/app/layout.tsx
- src/app/components/EstimateReport.tsx
- src/components/ui/*
- tailwind.config.ts
- next.config.ts
- package.json

FILES YOU MAY TOUCH:
- feature_list.json
- progress/current.md
- progress/history.md
- progress/review_002-cinematic-frontend-command-center.md
- src/app/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/components/EstimateReport.tsx
- src/app/components/*.tsx

FILES YOU MUST NOT TOUCH:
- package.json
- package-lock.json
- src/ai/**
- .github/workflows/**
- next.config.ts

OUTPUT:
- Implemented files.
- Summary of visual/product changes.
- Verification commands and results.
- Known follow-up issues.

STOP:
- Stop if package installation is required.
- Stop if build requires deployment/workflow changes outside approved files.
- Stop if estimation formulas need to change.
- Stop if another active feature exists.
```
