# TimeEstimator

TimeEstimator is a Next.js application that helps teams automate and accelerate effort estimation for RPA initiatives.

Developed by **Eduardo Sacahuí** - **Platform Architect**.

## Why this app exists

RPA estimation is often handled in disconnected spreadsheets, which creates delays and inconsistent totals. TimeEstimator centralizes activity inputs, applies consistent formulas, and generates stakeholder-ready estimates in minutes.

## What you can do

- Create and manage estimation projects.
- Capture activity-level inputs with configurable overhead percentages.
- Calculate totals with two-decimal precision.
- Generate polished estimate summaries and reports.
- Toggle themes for workshop and presentation contexts.
- Configure AI integrations from the UI via **AI Integrations**.

## Architecture at a glance

- **Framework:** Next.js App Router (TypeScript)
- **UI:** Tailwind CSS + Radix UI + custom component system
- **State/Data:** local persistence hooks + typed models
- **AI runtime:** public n8n webhooks with deterministic local fallbacks
- **Deployment:** static export to GitHub Pages via GitHub Actions

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open:

`http://localhost:9002`

## Build

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit
```

The Pages workflow runs these gates from the lockfile before deployment.

## n8n integration

TimeEstimator can call n8n webhooks for AI features directly from the browser in GitHub Pages mode.

### Supported operations

- `analyzeEstimate`
- `estimateDefaults`
- `summarizeActivities`
- `parseSteps`

### Request contract

Each request uses a versioned envelope:

```json
{
  "version": "1.0",
  "operation": "analyzeEstimate",
  "requestId": "2cb11469-5ddc-4d80-a20b-3f1717987468",
  "input": {
    "activityDescription": "Login to SAP and validate invoices"
  },
  "meta": {
    "source": "time-estimator",
    "timestamp": "2026-07-10T04:00:00.000Z"
  }
}
```

Do not rely on duplicated top-level input fields. Route workflows by `operation` and read business data from `input`.

### Response contract

The preferred success response is:

```json
{
  "ok": true,
  "data": {
    "suggestedEffort": 3.5,
    "reasoning": "..."
  },
  "meta": {
    "provider": "n8n"
  }
}
```

The preferred failure response is:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "activityDescription is required",
    "retryable": false
  }
}
```

For backward compatibility, the client can also unwrap `data`, `result`, or `output` wrappers.

### Configuration options

You can configure endpoints in two ways:

1. **In-app** for local testing
   - Open a project.
   - Click **AI Integrations** in the top bar.
   - Save a base URL and/or per-operation URLs.

2. **Build-time environment variables**
   - `NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL`
   - `NEXT_PUBLIC_N8N_ANALYZE_ESTIMATE_URL`
   - `NEXT_PUBLIC_N8N_ESTIMATE_DEFAULTS_URL`
   - `NEXT_PUBLIC_N8N_SUMMARIZE_ACTIVITIES_URL`
   - `NEXT_PUBLIC_N8N_PARSE_STEPS_URL`

### Security model

GitHub Pages is a static frontend. Every `NEXT_PUBLIC_*` value and every value stored by the browser is visible to end users.

Therefore:

- Do not configure bearer tokens, API keys, provider credentials, or privileged n8n secrets in the browser.
- Treat directly configured webhook URLs as public endpoints.
- Apply strict request/response schema validation in n8n.
- Add rate limits, payload-size limits, execution limits, CORS restrictions, and abuse monitoring.
- For protected workflows, place a server-side API gateway or edge function in front of n8n and store credentials there.

## Deploy to GitHub Pages

This repository includes a workflow at `.github/workflows/nextjs.yml` to:

- install locked dependencies,
- run TypeScript validation,
- run ESLint and the test suite,
- audit production dependencies,
- build the static export,
- upload the Pages artifact,
- deploy on pushes to `main`.

Prerequisites:

- Public repository.
- GitHub Pages enabled in repository settings.
- Source set to **GitHub Actions**.
- Optional repository variables for public `NEXT_PUBLIC_N8N_*_URL` values.

## Project structure

- `src/app/page.tsx`: dashboard and project launcher.
- `src/app/project/ProjectPageClient.tsx`: estimator workspace.
- `src/app/components/*`: estimation, reports, and AI integration dialogs.
- `src/hooks/*`: local storage and project state management.
- `src/ai/client/*`: stable imports consumed by the UI.
- `src/ai/stubs/*`: n8n adapters with deterministic heuristic fallbacks.
- `src/lib/n8n-config.ts`: public n8n endpoint resolution and config merge.
- `src/lib/n8n-client.ts`: single n8n webhook transport.

## SEO and discoverability

The app includes:

- Open Graph and Twitter metadata,
- JSON-LD for `Person` and `SoftwareApplication`,
- `robots.ts`, `sitemap.ts`, and `manifest.ts`.

Only the public dashboard is included in the sitemap. Browser-local project workspaces are not indexed.

## Maintainer

**Eduardo Sacahuí**
Platform Architect

---

TimeEstimator is designed to make RPA estimation faster, cleaner, and easier to defend with stakeholders.
