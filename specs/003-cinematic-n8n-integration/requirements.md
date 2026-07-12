# Requirements — 003 Cinematic n8n integration

## Feature

Integrate the verified n8n/static Pages runtime into the cinematic command
center without replacing its product experience or changing estimation formulas.

## Mode

SHIP

## Status

approved — explicitly approved by the user on 2026-07-11

## Product requirements

1. Preserve the cinematic Command Center, metrics, guided intake, activity
   ledger, risk/assumption panel, overhead panel, report panel, and background.
2. Add browser-local projects and persistence without losing the cinematic
   workflow.
3. Provide n8n assistance for effort, defaults, summaries, and process-step
   import with deterministic local fallbacks when no endpoint is configured.
4. Distinguish n8n output from heuristic output in user-facing copy.
5. Keep endpoint configuration public-safe: no browser tokens or secrets,
   HTTPS required except localhost development.
6. Produce a static GitHub Pages export with correct base path and routes.
7. Preserve existing total, core/supervised, overhead, and grand-total formulas.
8. Work on desktop and phone-sized viewports with accessible controls and
   reduced-motion behavior.
9. Keep report/export flows functional and integrated into the cinematic UI.

## Engineering requirements

- PR #2 is authoritative for visual composition and harness files.
- PR #3 is authoritative for n8n transport, fallbacks, persistence primitives,
  tests, linting, security controls, package lock, and Pages workflow.
- Shared UI files must be integrated manually.
- Genkit and Firebase must not return to the static artifact.
- CI must run lint, typecheck, tests, production audit, and static build.
- The dependency tree must audit with zero known vulnerabilities at review time.

## Non-goals

- No formula changes.
- No database, authentication, or server-side secret store.
- No real provider credentials in the repository or browser.
- No direct merge of PR #2 or PR #3 into `main` before consolidated review.

## Acceptance criteria

- Cinematic experience remains recognizably intact.
- Project creation, open, refresh persistence, activity entry, step import,
  overhead defaults, summary, theme, and reports work.
- All AI operations fall back locally without a configured webhook.
- GitHub Pages export emits `/` and `/project` artifacts.
- Lint, typecheck, tests, build, diff check, and both audits pass.
- Review artifacts record desktop/mobile and failure-mode evidence.

