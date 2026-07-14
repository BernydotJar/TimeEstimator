# Report Export Strategy — 008 Project Discovery & Estimation Studio

## Scope

Define the corrective architecture for stakeholder-ready exports while remaining
compatible with static hosting, browser-local data, and no backend.

## Verified defects

### RPT-001 — Print / PDF is not usable

Observed behavior: invoking Print / PDF from the report dialog does not produce a
reliable stakeholder document.

Current implementation characteristics:

- the report lives inside a Radix dialog portal;
- the dialog has viewport-bound height and internal overflow;
- the action invokes `window.print()` directly;
- the printable content shares layout context with modal chrome and the app shell;
- charts are responsive to their interactive container;
- detailed tables rely on overflow wrappers.

The prior print stylesheet attempted to expose the report body, but observed
browser behavior proves the export remains defective.

### RPT-002 — Save PNG creates an excessively long image

Observed behavior: `html2canvas` captures the entire report content as one tall
vertical PNG.

Current implementation characteristics:

- capture target is the complete report container;
- `scale: 2` increases pixel dimensions;
- detailed tables, charts, assumptions, and footer are all included;
- there is no bounded summary layout or maximum height;
- the result is technically an image but not a designed shareable report.

## Product decision

Use two distinct products:

1. **PNG = bounded executive summary.**
2. **Print/PDF = complete multipage report.**

Do not attempt to encode a multipage report as one infinitely tall PNG.

## Alternatives considered

### Print/PDF alternative 1 — Improve the existing print stylesheet

Pros:

- smallest code change;
- no new route;
- no dependency.

Cons:

- remains coupled to portal/modal DOM;
- fragile selectors against utility classes;
- fixed/transform/overflow behavior varies by browser;
- charts may size against hidden or constrained containers;
- difficult to test and maintain.

Decision: insufficient as the primary solution. Print CSS remains necessary but
shall target a dedicated print surface.

### Print/PDF alternative 2 — Dedicated print route

Example:

```text
/report?id=<project-id>&mode=print
```

or a static-compatible equivalent under the existing routing strategy.

Pros:

- isolated DOM with no app shell or modal portal;
- deterministic page layout;
- direct browser print support;
- static hosting compatible;
- no new PDF dependency;
- easier browser and visual testing.

Cons:

- requires hydration/loading readiness;
- charts must signal render completion;
- query route must work under GitHub Pages base path;
- opening a new view/tab needs clear UX.

Decision: **recommended MVP architecture**.

### Print/PDF alternative 3 — Separate in-page print component

Pros:

- no new route;
- can render hidden print root.

Cons:

- duplicated/hidden DOM in the workspace;
- chart rendering in hidden containers is unreliable;
- app state and print readiness are more coupled.

Decision: acceptable fallback if static routing blocks a dedicated route, but less
preferred.

### Print/PDF alternative 4 — Client PDF library

Pros:

- direct file download;
- potentially deterministic pages.

Cons:

- new dependency and bundle cost;
- complex charts/tables/fonts;
- accessibility and text selection may degrade;
- dependency approval required;
- often recreates layout logic outside React/CSS.

Decision: not MVP. Reassess only after the dedicated route is measured and found
insufficient.

### Print/PDF alternative 5 — Server-side PDF

Pros:

- consistent rendering in controlled browser runtime.

Cons:

- violates browser-local/no-backend MVP architecture;
- introduces data transfer, security, operations, and cost.

Decision: future enterprise option only.

## Recommended report architecture

```text
ReportViewModel
  ├─ InteractiveReportPreview
  ├─ ExecutiveSummaryCard -> PNG renderer
  └─ PrintReport -> dedicated print route -> browser Print / Save as PDF
```

All renderers consume the same normalized report data. They do not capture the
interactive workspace DOM.

## ReportViewModel

Required sections:

- report metadata and version;
- project overview;
- scenario summary;
- confidence and unknowns;
- key metrics;
- phase/work-type/core-supervised breakdowns;
- major drivers;
- top risks and assumptions;
- process overview and selected flow diagrams;
- integration inventory;
- activity breakdown;
- exclusions;
- traceability/audit metadata.

The view-model contains printable labels and already-normalized values. Rendering
components shall not recalculate business totals independently.

## PNG executive summary

### Content

Include only:

- product/report brand;
- project name;
- generated date and estimate version;
- optimistic/expected/conservative totals;
- confidence band and score;
- base vs overhead KPI;
- core vs supervised KPI;
- one compact effort distribution chart;
- up to five major drivers;
- up to five risks/unknowns;
- primary assumptions/exclusions count;
- `+N more` indicators where necessary.

Exclude:

- complete activity table;
- complete process step list;
- long assumptions list;
- full integration inventory;
- buttons, close control, modal overlay, navigation, or shell;
- hidden overflowing content.

### Dimensions

Recommended logical render box:

```text
width: 1440 px
height: 1800 px maximum
aspect ratio: 4:5 target, bounded
```

Implementation may use a CSS logical width such as 960 px and a pixel ratio of
1.5, provided final output remains within the target and text is legible.

The component shall have an explicit height/content policy. If content exceeds the
limit, it truncates bounded lists and shows counts; it does not grow indefinitely.

### Capture mechanics

- Render a dedicated `ExecutiveSummaryCard` off-screen but measurable, or in a
  preview surface.
- Use an explicit theme-independent background.
- Wait for fonts and charts.
- Capture only the summary node.
- Prefer `canvas.toBlob()` to a large data URL.
- Revoke temporary object URLs.
- Disable the action while rendering.
- Report actionable errors.

### Filename

```text
<safe-project-name>_executive-estimate_<YYYYMMDD>_v<version>.png
```

Sanitize reserved characters and bound filename length.

### Why not multiple PNG pages for MVP

Multiple page images or ZIP increase complexity and still provide inferior document
navigation/search/printing. The full artifact belongs in PDF. Multiple images may
be considered later for presentation/social use.

## Dedicated Print/PDF route

### Route behavior

1. Read project ID and optional artifact/estimate version.
2. Render a stable loading surface until browser storage hydration completes.
3. Resolve project only after hydration.
4. Build `ReportViewModel`.
5. Render `PrintReport` without interactive app chrome.
6. Wait for charts/fonts/layout readiness.
7. Enable or trigger print through an explicit user action.
8. Handle missing project/version without opening print.

Recommended query:

```text
/report?id=<id>&estimate=<draft-id>&artifact=<version>
```

A simpler project-only MVP is acceptable if version selection is not yet
implemented.

### Print controls

The screen print route may include a small toolbar with Back and Print buttons.
Under `@media print`, the toolbar is `display: none`.

Do not print automatically before hydration and chart readiness. Automatic print
may be optional after readiness, but an explicit button is more reliable and
accessible.

## Page format

Support:

- A4 portrait default;
- US Letter portrait through browser selection;
- landscape only for specifically marked wide tables/flows, if browser support is
  reliable.

Suggested CSS:

```css
@page {
  size: auto;
  margin: 14mm 12mm 16mm;
}

@media print {
  html, body {
    background: #fff !important;
    color: #111 !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

Do not rely on `position: fixed` for primary content.

## Page-break policy

### Keep together where practical

- report header and first KPI group;
- section heading with first content block;
- individual KPI cards;
- compact chart plus caption;
- risk/assumption callout;
- small table rows associated with a heading.

### Allow splitting

- long narrative sections;
- long activity/integration tables;
- process step tables.

### Force page break

Use explicit section boundaries before:

- detailed process documentation;
- detailed activity breakdown;
- integration inventory;
- audit/traceability appendix.

### CSS approach

```css
.print-section { break-inside: auto; }
.print-keep { break-inside: avoid; }
.print-page-break { break-before: page; }
thead { display: table-header-group; }
tfoot { display: table-footer-group; }
tr { break-inside: avoid; }
```

Do not set `break-inside: avoid` on large containers that exceed one page; that can
create blank areas or clipping.

## Table policy

### Screen

Interactive tables may scroll horizontally.

### Print

- use a print-specific column set;
- wrap long text;
- stack secondary metadata below the primary cell;
- repeat headers;
- avoid fixed minimum widths inherited from screen tables;
- place very wide traceability detail in an appendix or key-value layout;
- never depend on horizontal scroll.

Activity table recommended print columns:

- activity;
- system/application;
- phase/model;
- hours;
- concise rationale/source.

Full technical fields may move to an appendix.

## Chart policy

- Render charts at fixed print dimensions, not `ResponsiveContainer` dependent on
  an uncertain portal width.
- Provide accessible text summaries and data tables.
- Limit categorical bars to readable top categories plus `Other`.
- Avoid labels outside the SVG bounds.
- Verify charts in Chromium and at least one second engine/manual browser when
  possible.
- If charts are not ready, disable print and show status.

## Flow diagram policy

- Prefer vector SVG Mermaid output.
- Split large flows by subprocess/section.
- Provide textual step/edge fallback.
- Do not scale a huge graph to illegible single-page size.
- Include current-state and future-state on separate pages when both are selected.

## Accessibility

- Print route uses semantic headings and tables.
- Screen preview retains keyboard navigation and visible focus.
- Charts have text alternatives.
- Color is not the only carrier of scenario/confidence meaning.
- Export actions announce progress and completion through an accessible live region.
- Error text identifies recovery actions.
- PNG is accompanied by equivalent accessible report content in the application;
  PNG itself is not the sole accessible artifact.

## Theme behavior

Exports use a controlled light report theme regardless of application theme,
unless a later approved option adds branded dark export. This prevents dark
backgrounds, low contrast, and browser ink-heavy output.

Input light/dark theme must not affect calculation or content selection.

## Loading and failure states

### PNG states

- idle;
- preparing data;
- rendering chart;
- capturing;
- saving;
- success;
- failed with retry.

### Print states

- hydrating;
- project missing;
- building report;
- charts rendering;
- ready to print;
- print canceled/returned;
- render error.

A failure shall not clear project or generated artifact data.

## Static-hosting compatibility

- Use only client-side data and static routes/components.
- Respect `basePath` and `assetPrefix` when opening the print route.
- Do not fetch project data from a server.
- Avoid server-only APIs in report components.
- Validate static export includes the report route or use a query-based route
  structure that emits an artifact.
- Verify refresh/direct route behavior under the GitHub Pages subpath.

## Browser compatibility

Required verification:

- current Chromium/Chrome or Edge;
- current Firefox for print preview where available;
- Safari/macOS manual check where available because print CSS and SVG behavior may
  differ.

The minimum SHIP gate may approve Chromium plus one additional browser, but the
chosen matrix must be recorded.

## Test matrix

| Case | PNG | Print/PDF |
|---|---:|---:|
| No activities | disabled/explained | disabled/explained |
| Small project | summary fits | one or more clean pages |
| 50 activities | bounded summary | multipage table |
| 250 activities | bounded summary | long-table pagination |
| Long project name | wrapped/truncated safely | wrapped safely |
| Many drivers/risks | top-N + count | complete sections |
| Charts | fixed and legible | fixed and legible |
| Light app theme | controlled export theme | controlled export theme |
| Dark app theme | controlled export theme | controlled export theme |
| Direct report URL | N/A | hydrates and resolves |
| Missing ID | N/A | no print; recovery message |
| Corrupt storage | no crash | no print; recovery message |
| Reduced motion | no dependency on animation | no dependency on animation |
| Offline/no n8n | works | works |

## Acceptance criteria

### RPT-002 resolved

- Save PNG captures only `ExecutiveSummaryCard`.
- Final image is bounded and not an infinitely tall page.
- Text and chart are legible at normal viewing size.
- No dialog/app controls appear.
- Project, date, scenarios, confidence, drivers, and risks are accurate.
- Output is visually inspected on representative small and large projects.

### RPT-001 resolved

- Print action opens or navigates to an isolated printable surface.
- Preview contains only report content.
- No modal overlay, close button, navigation shell, action bar, or behind-dialog
  content appears in print.
- Multipage content is not clipped.
- Long tables repeat headers where supported and remain readable.
- Charts are rendered before print.
- Saved PDF is opened and visually inspected.
- Direct print route works after hydration and handles invalid IDs safely.

## Deferred options

- multi-PNG export/ZIP;
- branded dark PDF;
- client PDF library;
- server-side PDF service;
- DOCX export;
- signed reports;
- automated cross-browser screenshot comparison.
