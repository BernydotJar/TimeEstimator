# QA Plan — 008 Project Discovery & Estimation Studio

## Purpose

Define the verification required before implementation can move from `review` to
`done`. Code inspection is supporting evidence only; browser behavior, exported
artifacts, and accessibility must be observed directly.

## Test layers

1. Unit tests for normalization, traceability, scenario calculations, and
   migration.
2. Component tests for assessment, proposal review, process editor, and report
   rendering.
3. Integration tests for local persistence and direct project URLs.
4. Browser QA at desktop, tablet, and phone widths.
5. Artifact inspection for PNG and Print/PDF.
6. Regression checks for existing projects and deterministic fallbacks.

## Required scenarios

| ID | Scenario | Evidence required |
|---|---|---|
| QA-001 | Empty assessment | Honest empty state; no fabricated estimate |
| QA-002 | Partial assessment | Progress saved; missing fields marked unknown |
| QA-003 | Complete assessment | Completeness and evidence summary are correct |
| QA-004 | Refresh persistence | Answers, steps, proposals, and decisions survive refresh |
| QA-005 | Unknown answers | Unknown values lower confidence without blocking save |
| QA-006 | Proposal generation | Every proposal references source answers or steps |
| QA-007 | Review before apply | No activity is added until explicitly selected and confirmed |
| QA-008 | Scenario estimates | Optimistic, expected, conservative are ordered and explainable |
| QA-009 | Traceability | Report can navigate from estimate driver to source evidence |
| QA-010 | Process-step import | Numbered, bulleted, checklist, and free text inputs normalize safely |
| QA-011 | Mermaid generation | Linear, decision, exception, approval, retry, integration, and end nodes render |
| QA-012 | Documentation generation | Overview, current state, future state, inventory, risks, plan, and estimate summary exist |
| QA-013 | Direct URL regression | `/project?id=<id>` resolves only after hydration |
| QA-014 | Corrupt localStorage | Safe fallback; no crash or data overwrite |
| QA-015 | Responsive UI | 1440, 1024, 768, 390, and 320 px widths have no blocking overflow |
| QA-016 | Keyboard accessibility | Tab order, focus visibility, dialogs, Escape, and focus restoration pass |
| QA-017 | PNG summary | Fixed-size executive summary only; no application chrome; readable output |
| QA-018 | Print preview | Report-only surface; no dialog shell or action controls |
| QA-019 | Save as PDF | Multi-page PDF opens and preserves content order |
| QA-020 | Long tables | Headers, wrapping, and page breaks remain usable |
| QA-021 | Charts | Charts have textual equivalents and render in PNG/PDF |
| QA-022 | Theme behavior | Editing works in light/dark; exports use canonical export theme |
| QA-023 | Deterministic fallback | No endpoint still produces labeled, reviewable suggestions |
| QA-024 | Endpoint absence | Missing endpoint is never presented as successful n8n output |
| QA-025 | Legacy project migration | Existing `Project` objects load unchanged with optional Feature 008 fields absent |
| QA-026 | Regeneration | Manual overrides are preserved or explicitly reconciled |
| QA-027 | Double-count prevention | Same effort driver cannot be counted as activity and overhead silently |
| QA-028 | Large process | At least 100 steps remain editable and exportable without data loss |

## PNG acceptance matrix

- Executive-summary template has a fixed logical width.
- Output height is bounded by the approved template.
- Full activity tables are excluded or summarized.
- Pixel ratio is deterministic and documented.
- Filename includes sanitized project name, artifact type, and date.
- Empty and oversized states produce clear errors.
- Open the generated file and inspect legibility, clipping, charts, metrics, and
  absence of controls.

## Print/PDF acceptance matrix

- Dedicated report route or isolated print root is used.
- A4 and Letter are tested.
- Browser print preview shows only report content.
- Page breaks avoid orphan headings and clipped charts.
- Tables can span pages; headers repeat where browser support allows.
- Saved PDF is opened and inspected, not merely downloaded.
- Chrome, Edge, and Safari compatibility are recorded where available.

## Accessibility

- WCAG AA contrast for interactive editing surfaces.
- Logical heading structure and landmarks.
- Labels and error associations for all assessment controls.
- Dialogs trap focus and restore it.
- Mermaid/flow visuals include a text alternative.
- Export actions announce busy, success, and failure states.
- `prefers-reduced-motion` does not remove required information.

## Automated gate

For implementation branches:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
npm audit --omit=dev
npm audit
```

Any new dependency requires explicit approval before installation.

## Exit criteria

Feature 008 cannot be `done` until all applicable scenarios pass with evidence,
PNG and PDF artifacts are directly inspected, legacy projects remain compatible,
and the implemented formulas match an approved deterministic specification.