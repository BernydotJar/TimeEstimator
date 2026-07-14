# Design — 001 Connect harness-sdlc

## Approach

Bootstrap the repo with harness-sdlc control files while leaving the application code untouched.

## Files added

- `AGENTS.md`
- `RTK.md`
- `CLAUDE.md`
- `feature_list.json`
- `progress/current.md`
- `progress/history.md`
- `specs/001-connect-harness-sdlc/requirements.md`
- `specs/001-connect-harness-sdlc/design.md`
- `specs/001-connect-harness-sdlc/tasks.md`
- `specs/002-cinematic-frontend-command-center/requirements.md`
- `specs/002-cinematic-frontend-command-center/design.md`
- `specs/002-cinematic-frontend-command-center/tasks.md`
- `prompts/goal-cinematic-frontend.md`

## Design decisions

### One active feature

`001-connect-harness-sdlc` is the only active feature and is set to `review` because this branch implements the harness bootstrap.

`002-cinematic-frontend-command-center` is set to `spec_ready`, not `approved`, so agents do not modify app code until a human explicitly approves the frontend rebuild.

### Cinematic frontend is encoded as product direction

The cinematic point of view is captured in `RTK.md` and the feature 002 spec so future implementation has product constraints, not just visual inspiration.

### App code remains unchanged

The repository has visible app-code issues, but this feature only documents them. Fixes belong to later approved features.

## Risks

- If future agents ignore `feature_list.json`, they may implement before approval.
- If feature 002 is implemented without splitting `page.tsx`, the app may become harder to maintain.
- If build gates remain ignored, visual improvements may mask broken TypeScript or lint errors.

## Review guidance

Reviewers should verify that this branch adds governance and specs only. Any app-code change in this branch should be rejected.
