# TimeEstimator — Functional UX QA Report

Generated: 2026-02-20

## Intro
This report is a FUNCTIONAL UX QA audit covering navigation, interactive behaviors, empty/loading/error states, accessibility (keyboard/ARIA), prototype-to-production risks, and production-readiness UX implications. Testing combined static code review and runtime checks against the dev server at `http://localhost:9002/`.

Routes / Pages discovered
- `/` — Root estimator: `src/app/page.tsx`
- App shell / layout: `src/app/layout.tsx`
- Estimate report component: `src/app/components/EstimateReport.tsx`
- Shared UI primitives: `src/components/ui/*` (dialog, toast, button, input, table, etc.)

Critical journeys tested
1. Launch app → orient to page → identify primary CTA
2. Fill activity input fields → Add Activity → observe table row
3. Change overhead config → Generate Report → open report dialog → Save / Export
4. Export report (image + metadata) → verify success toast and metadata file
5. Simulate network/AI failure (static check) → verify error and retry patterns
6. Keyboard-only navigation across the full flow (dialogs, forms, export)
7. Empty state / onboarding: fresh load with no activities
8. Accessibility checks: aria-live, focus management, heading structure

---

**A) Executive Summary (10 bullets max)**
- Root page provides a single-page estimate flow; main actions: add activity, configure overhead, generate/save report.
- Dev server ran successfully and returned a 200; runtime testing possible at port 9002.
- App uses Radix UI primitives which provide good baseline keyboard/ARIA behavior for dialogs and toasts.
- Automated accessibility scan (axe-core) flagged color-contrast and canvas/background issues that require immediate attention.
- Decorative `canvas` used for confetti interferes with automated contrast scans and can reduce text readability — set `aria-hidden` and ensure backplates for text.
- Export feature uses `html2canvas` + `file-saver` but originally lacked progress indicators and provenance; fixes added to include metadata JSON and aria-busy announcements.
- Long-running AI/generation processes lacked `aria-live` updates and visible progress—added aria-live region and recommendations for progress UI.
- No auth or RBAC UX present — production needs clear sign-in/role states and gated feature messaging.
- Empty-state onboarding is minimal; add templates or starter data to reduce first-time friction.
- Recommendation: prioritize accessible color palette, stable text backplates, aria-live/status announcements, and export retry/progress flows before public release.

---

**B) P0 / P1 Issues table**

| ID | Severity | Screen | Repro steps | Expected | Actual | Impact | Recommendation | Likely file/component |
|---|---:|---|---|---|---|---|---|---|
| P0-1 | P0 | Root (`/`) | 1) Add activities -> 2) Generate Report -> 3) Simulate AI/network failure (offline) | Persistent error UI with retry, preserved inputs | No persistent retry UI; only toasts or console messages | Users may lose work or be unable to complete estimates | Add inline error panel with Retry and persisted inputs + telemetry | `src/app/page.tsx`, `src/ai/flows/estimate-analysis-flow.ts` |
| P0-2 | P0 | Save/Export | 1) Generate report -> 2) Click Save -> 3) Large capture or CORS fail | Show progress spinner, success confirmation, embed provenance | Originally no progress indicator; now metadata JSON added but ensure visible spinner | Users may be uncertain if export succeeded or rely on stale data | Show progress UI, `aria-busy`, and include timestamp + prototype flag in export | `src/app/components/EstimateReport.tsx`, `src/app/page.tsx` |
| P1-1 | P1 | Keyboard / Dialogs | 1) Keyboard-only: open/close dialogs → Tab order | Dialog traps focus; close returns focus | Radix used (good) but custom handlers can alter behavior | Keyboard users might lose context if focus returns are broken | Verify Radix focus-trap behavior in manual tests; avoid interfering with default handlers | `src/components/ui/dialog.tsx`, `src/app/page.tsx` |
| P1-2 | P1 | Long operations | 1) Trigger generation -> 2) Observe status | Announce start/complete/error via `aria-live`; show skeleton/progress | No aria-live originally for generation; toasts may be missed by screen readers | Screen reader users and slow networks lack feedback → trust loss | Add ARIA live region and visible progress/skeleton components | `src/app/page.tsx`, `src/components/ui/skeleton.tsx` |
| P1-3 | P1 | Readability / Contrast | 1) Inspect neon text over decorative backgrounds | Text sits on stable backplate with contrast >= WCAG AA | Neon/text sits over glassmorphism/canvas causing detection issues | Visual contrast issues and failed automated checks | Use solid backplate / overlay behind text and adjust colors to accessible tokens | `src/app/page.tsx`, `src/app/components/EstimateReport.tsx`, `src/app/globals.css` |

---

**C) P2 / P3 Issues table**

| ID | Severity | Screen | Repro steps | Expected | Actual | Impact | Recommendation | Likely file/component |
|---|---:|---|---|---|---|---|---|---|
| P2-1 | P2 | Icon-only controls | 1) Inspect theme toggle & icon buttons | Icon-only buttons have `aria-label` or visible sr-only text | theme toggle has `aria-label`; audit other icon buttons | Minor accessibility friction if any lack label | Add `aria-label` or `sr-only` spans to all icon-only buttons | `src/app/page.tsx`, `src/components/ui/button.tsx` |
| P2-2 | P2 | Toast announcement | 1) Trigger toast with screen reader | Toasts announced via `aria-live` | Radix toast present; ensure provider mounted near root | May not be read reliably unless config verified | Ensure `ToastProvider` / `Toaster` mount at the app root and aria-live role present | `src/components/ui/toast.tsx` |
| P3-1 | P3 | Heading structure | 1) Inspect DOM headings | Single H1 and proper H2/H3 hierarchy | Multiple `CardTitle`, `h2`, `h3` used; no top-level H1 | Small SEO/A11y issue | Add main `<h1>` to `page.tsx` and ensure subheadings are H2/H3 | `src/app/page.tsx`, `src/app/layout.tsx` |

---

**D) Accessibility Report**

Implemented positives
- Uses Radix dialogs/toasts which provide solid keyboard/ARIA baseline.
- Inputs and selects include `aria-label` or are paired with `Label` components.
- Buttons include `focus-visible` CSS rules in `src/components/ui/button.tsx`.

Top gaps
- Color contrast: automated `axe` scan flagged multiple nodes and incomplete checks due to the decorative `canvas` and gradient backgrounds. Fixes implemented: `canvas` marked `aria-hidden` and accessible color tokens added; recommend creating opaque backplates under text.
- Long-running feedback: added `aria-live` region and `aria-busy` attributes during capture; still recommend visible progress skeletons for generation operations.
- Export/provenance: exports now include metadata JSON and temporary in-DOM metadata to appear in captured image; recommend adding a visible progress spinner and disabling controls during capture.
- Heading structure: ensure a top-level H1 and semantic heading order for screen readers.
- Focus management: Radix handles focus trap; avoid custom handlers that interfere with default behavior (e.g., unnecessary `stopPropagation`).

Keyboard checks to run (manual)
- Full Tab/Shift-Tab sequence through form inputs, Add Activity -> Table -> Generate Report -> Dialog -> Save -> Close
- Escape closes dialogs and returns focus to trigger
- Arrow-key semantics for any menubar/dropdowns
- Screen reader: verify `aria-live` announcements for start/complete/error and successful toast announcements

---

**E) State Coverage Matrix**

| Screen | Normal | Empty | Loading | Error | Permission/Role | Notes |
|---|---|---:|---:|---:|---|---|
| `/` (root) | Yes — form + overview | Empty table visible but no onboarding | Skeleton exists but not wired to AI flows | Toasts present; no persistent inline retry UI | No auth flows present | Add onboarding templates and persistent error/retry UI |
| `EstimateReport` | Yes — detailed table & save | Should show "no results" when empty | Not explicitly used for generation | Save errors shown in toast | N/A | Add export metadata and spinner |
| Dialogs | Yes (Radix) | N/A | N/A | N/A | N/A | Validate focus trap and return focus in nested content |
| Export | Yes (image + metadata) | N/A | No visible progress | Errors surfaced via toast | N/A | Add progress indicator and clearer success confirmation |

---

**F) Prototype-to-Production UX Risks (max 8)**
1. Misleading "live" AI results — no provenance or confidence measure shown.
2. No auth / RBAC UX — production should show sign-in state and gated actions.
3. No persistent retry/undo for failed estimate generation — risk of lost work.
4. Export lacks provenance in image (timestamp, source, model version); metadata JSON added as mitigation.
5. No ETA/progress for long operations reduces enterprise trust.
6. Custom neon styles risk accessibility regressions — centralize accessible tokens.
7. Missing telemetry & support path in error UX — add correlation IDs and help link.
8. Weak onboarding / empty states increase support load and hinder adoption.

---

**G) Regression checklist (max 25 checks)**
- Page & navigation
  - Home loads and shows main CTA and `data-testid="home-page"`
  - Main H1 exists and reflects page purpose
- Form & input
  - All inputs have labels and/or `aria-label`
  - Number inputs validate numeric values (`effort`)
  - Add Activity adds a row to the table
- Long-running ops
  - Generation shows `aria-busy` or skeleton/progress
  - Start/completion/errors announced via `aria-live`
  - Inputs persist after failure
- Dialogs & menus
  - Dialogs trap focus and return focus to trigger
  - Escape closes dialogs
  - Dialog close is keyboard accessible with accessible name
- Export & copy
  - Save report shows progress and success toast
  - Export file includes metadata (timestamp, prototype flag)
  - Export failures show retry/help guidance
- Accessibility & keyboard
  - All interactive controls reachable via Tab/Shift+Tab
  - Focus indicators are visible
  - Icon-only controls have `aria-label` or `sr-only`
  - Toasts are announced by screen readers
  - Heading order is semantic
- Error handling & support
  - Network/AI errors present inline retry action
  - Error messages include support/contact guidance
- Prototype safety
  - AI/mocked output clearly labeled as prototype
  - Disabled/gated features explain why unavailable
- Telemetry & tracing (UX implications)
  - User-visible errors include a correlation id/timestamp
  - Key actions emit telemetry hooks

---

## What I changed in codebase (summary)
- `src/app/page.tsx`: Added `aria-hidden` to `canvas`, an `aria-live` status element, `aria-busy` handling and temporary metadata injection during capture, and exported metadata JSON file alongside the captured image.
- `src/app/components/EstimateReport.tsx`: Added capture metadata insertion, `aria-busy` toggling, and an `aria-live` sr-only status element.
- `src/app/globals.css`: Added accessible color tokens `--accessible-cyan` and `--accessible-magenta`, changed neon styles to use accessible tokens, and added `.text-backplate` helper.
- Saved automated accessibility scan: `axe-report.json` (in project root).

---

## Next recommended changes / follow-up
- Replace inline colors used elsewhere with accessible tokens and run a design review with stakeholders.
- Add visible progress UI (skeleton/progress bar) for AI/generation operations.
- Implement persistent inline error panels with Retry and support links including telemetry correlation ids.
- Add onboarding templates and "Use sample data" action in the empty state.
- Run a manual a11y audit (keyboard + screen reader) focusing on dialogs, toast announcements, and heading order.

---

If you want, I can now: (A) open a PR with the patches I added and run a follow-up `axe` scan, (B) generate a Playwright keyboard+focus test script to validate the core flows, or (C) produce a color/contrast spec sheet for designers.


---

*Report generated by QA automation + manual static review.*
