# Design — 003 Cinematic n8n integration

## Integration strategy

Use the cinematic branch as the presentation baseline and layer PR #3's
runtime behind it. Do not replace `src/app/page.tsx` or `globals.css` wholesale.

## Experience architecture

- `/`: cinematic project command center and project launcher.
- `/project?id=<id>`: cinematic estimation workspace for one browser-local
  project.
- Shared cinematic panels remain reusable in the project workspace.
- n8n configuration is available from the command header without accepting
  credentials.

## Runtime architecture

- `src/ai/client/*` is the stable UI import boundary.
- `src/ai/stubs/*` implements public n8n calls with deterministic fallbacks.
- `src/lib/n8n-client.ts` owns the versioned HTTP envelope and response unwrap.
- `src/lib/n8n-config.ts` owns endpoint validation and browser configuration.
- `useProjects` and `useLocalStorage` own browser-local persistence.

## Conflict policy

Prefer PR #2 for page composition, cinematic CSS, and harness files. Prefer PR
#3 for workflow, static config, package files, n8n/persistence modules, routes,
and test infrastructure. Integrate layout, shared components, UI primitives,
Tailwind, README, and tests manually.

## Failure behavior

- Missing/unreachable n8n endpoints activate local deterministic behavior.
- Invalid remote HTTP URLs are rejected; localhost HTTP remains available.
- Missing project IDs redirect to the dashboard.
- No AI failure may erase user-entered project or activity data.

## Formula invariant

The integration must preserve the existing calculation equations exactly.

