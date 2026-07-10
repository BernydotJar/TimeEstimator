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
- **AI runtime modes:**
  - Genkit server flows for local/full runtime
  - n8n webhooks for static GitHub Pages mode (with heuristic fallback)
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
npm run build
```

## n8n integration

TimeEstimator can call n8n webhooks for AI features directly from the browser (GitHub Pages-compatible).

### Supported operations

- `analyzeEstimate`
- `estimateDefaults`
- `summarizeActivities`
- `parseSteps`

### Request payload shape

Each call sends JSON with both `operation` and the input fields, for example:

```json
{
  "operation": "analyzeEstimate",
  "input": {
    "activityDescription": "Login to SAP and validate invoices"
  },
  "activityDescription": "Login to SAP and validate invoices",
  "_source": "time-estimator",
  "_timestamp": "2026-02-21T00:00:00.000Z"
}
```

### Response shape

Return either a direct object or wrapped object (`data`, `result`, or `output`).

Examples:

```json
{ "suggestedEffort": 3.5, "reasoning": "..." }
```

```json
{ "data": { "summary": "..." } }
```

### Configuration options

You can configure endpoints in two ways:

1. **In-app** (recommended for quick testing)
- Open a project.
- Click **AI Integrations** in the top bar.
- Save base URL and/or per-operation URLs.

2. **Build-time environment variables**
- `NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL`
- `NEXT_PUBLIC_N8N_ANALYZE_ESTIMATE_URL`
- `NEXT_PUBLIC_N8N_ESTIMATE_DEFAULTS_URL`
- `NEXT_PUBLIC_N8N_SUMMARIZE_ACTIVITIES_URL`
- `NEXT_PUBLIC_N8N_PARSE_STEPS_URL`
- `NEXT_PUBLIC_N8N_BEARER_TOKEN` (optional)
- `NEXT_PUBLIC_N8N_API_KEY` (optional)

Security note: this is a static frontend, so any `NEXT_PUBLIC_*` value is exposed to users.

## Deploy to GitHub Pages

This repository includes a workflow at `.github/workflows/nextjs.yml` to:

- build static export,
- upload Pages artifact,
- deploy on pushes to `main`.

Prerequisites:

- Public repository.
- GitHub Pages enabled in repository settings.
- Source set to **GitHub Actions**.
- Optional repository variables for `NEXT_PUBLIC_N8N_*` values.

## Project structure

- `src/app/page.tsx`: dashboard and project launcher.
- `src/app/project/ProjectPageClient.tsx`: estimator workspace.
- `src/app/components/*`: estimation, reports, and AI integration dialogs.
- `src/hooks/*`: local storage and project state management.
- `src/ai/flows/*`: Genkit server flows.
- `src/ai/stubs/*`: static mode AI adapters with n8n + fallback heuristics.
- `src/lib/n8n-config.ts`: n8n endpoint resolution and config merge.
- `src/lib/n8n-client.ts`: n8n webhook client.

## SEO and discoverability

The app includes:

- Open Graph and Twitter metadata,
- JSON-LD for `Person` and `SoftwareApplication`,
- `robots.ts`, `sitemap.ts`, and `manifest.ts`.

## Maintainer

**Eduardo Sacahuí**
Platform Architect

---

TimeEstimator is designed to make RPA estimation faster, cleaner, and easier to defend with stakeholders.
