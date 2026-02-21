# TimeEstimator — Visual QA + Design Systems Audit

Generated: 2026-02-21

---

## A) Executive Summary (8 bullets max)

- Single-page app (SPA) with dense form + data-heavy tables; no obvious page hierarchy or progress indicators to guide users through estimate workflow.
- **Critical visual split**: inline neon colors (#00FFFF, #FF69B4) clash with Tailwind theme tokens, creating a sense of two unfinished design systems. Text contrast issues stem from this conflict.
- Activity form has 15+ input fields stacked vertically with minimal visual grouping—high cognitive load and low scannability for first-time users.
- Activity Overview table spans 13 columns and becomes unusable on tablets/mobile; no responsive table or card layout fallback.
- Button and card styling inconsistent: some use glassmorphism + neon glow, others are plain. Dialogs mix inline styles (neon titles) with tokenized buttons.
- Typography undersized in main UI but oversized in report modal—no consistent hierarchy. Labels use `.neon-label` but lack visual weight distinction.
- Dark mode theme token usage is incomplete; neon-green in dark mode is too bright and not paired with accessible secondary colors.
- These are largely **Polish (P2–P3) gaps** with **one P1 (table responsiveness)** — fixing them will significantly improve perceived quality and usability.

---

## B) Visual QA Punch List

| ID | Priority | Screen/Component | Finding | Why it matters | Exact recommendation | Likely file/component |
|---|---|---|---|---|---|---|
| VIS-1 | P1 | Activity Overview table | 13 columns; horizontal scroll on <1200px; unreadable on tablet | Mobile user can't see data; defeats purpose of an estimate tool | Convert to card layout on mobile/tablet (stack key fields: app name, activity name, effort, type). OR remove non-critical columns (assumptions, full descriptions) into expandable detail pages. | [src/app/page.tsx](src/app/page.tsx#L610-L650) |
| VIS-2 | P1 | Form layout | 15 fields stacked vertically; no grouping or section headers; overwhelming at first glance | Users don't know where to start; cognitive overload = errors and abandonment | Group inputs into logical sections (Activity Info, Type Details, Overhead Settings). Add section subheadings (e.g., `<h3 className="mt-6 text-sm font-semibold">Activity Details</h3>`). | [src/app/page.tsx](src/app/page.tsx#L430-L520) |
| VIS-3 | P1 | Neon color inconsistency | Inline `style={{ color: neonTextColors[0] }}` mixed with `.neon-label` (CSS) mixed with Tailwind tokens; creates broken visual language | Cards and titles feel unfinished; accessibility scan shows contrast failures. Users distrust UI. | Standardize on Tailwind token approach. Replace all inline neon with `className="text-accessible-cyan"` and define tokens in `tailwind.config.ts`. Remove `.neon-label` / `.neon-select` classes and use consistent Tailwind variants. | [src/app/page.tsx](src/app/page.tsx#L323-L330, various), [src/app/globals.css](src/app/globals.css#L114-L145) |
| VIS-4 | P2 | Card styling | Activity Input card is `glassmorphism neon-border-glow`; Activity Overview is plain `glassmorphism`; Estimate Overview is both — inconsistent | Feels like three different designs on one page | Standardize all cards to use the same treatment: either all glassmorphism+glow, or all plain cards with subtle shadow. Recommend: remove glow, use `shadow-sm` and `border` instead. | [src/app/page.tsx](src/app/page.tsx#L409, 603, 735) |
| VIS-5 | P2 | Button states | Buttons have no hover/active/disabled visual feedback shown in code; outline, primary, sizes (sm, default) all present but not visually harmonized | Users unsure which buttons are clickable or active. States don't feel intentional. | Ensure consistent hover state (e.g., `hover:bg-opacity-80`) and disabled state opacity. All buttons should use Tailwind `focus-visible` ring. Add visual feedback for "Generate Report" and "Save Estimate" buttons (color change on hover). | [src/components/ui/button.tsx](src/components/ui/button.tsx), [src/app/page.tsx](src/app/page.tsx#L750-800) |
| VIS-6 | P2 | Table styling mismatch | Activity Overview table uses no row-level styling; Estimate Overview (in report) uses blue header + alternating row colors. Standard table (TaskTable) has no visual hierarchy. | Looks like two different products. Users lose trust that tables are related. | Apply consistent row/header styling to both tables. Add subtle row-hover effect (background color change) to both. Use consistent typography (11–12px for body, 13px bold for headers). | [src/app/page.tsx](src/app/page.tsx#L612-650, 820-850), [src/app/components/EstimateReport.tsx](src/app/components/EstimateReport.tsx) |
| VIS-7 | P2 | Report modal content density | Report modal packs 10+ rows of data with no visual breaks; long text labels (e.g., "Release and Configuration Guide") wrap and create uneven layout | Modal feels cramped; hard to scan effort values | Add subtle background row alternation (`even:bg-gray-50`). Abbreviate long labels (e.g., "Config & Release" instead of full phrase). Move dialog title outside of glassmorphism effect for clarity. | [src/app/page.tsx](src/app/page.tsx#L820-850), [src/app/components/EstimateReport.tsx](src/app/components/EstimateReport.tsx#L55-125) |
| VIS-8 | P2 | Empty state | When no activities added, table shows nothing and "Generate Report" button appears active; no guidance for first-time users | Users don't know they need to fill the form first; they'll click Generate Report and get a confusing empty result | Add inline helper text: "No activities added yet. Fill the form above and click 'Add Activity' to get started." OR show a disabled report button with tooltip: "Add activities to generate a report." Use a light blue box or icon cue. | [src/app/page.tsx](src/app/page.tsx#L603-610) |
| VIS-9 | P3 | Label clarity | Most labels use `.neon-label` but some are plain `<Label>`. "Effort [h]" is cryptic—not clear abbreviation is hours. "Core/Supervised" is jargon. | New users don't understand fields. Field naming seems technical without context. | Standardize all labels to use same class. Add tooltips or inline help text for jargon: `<span title="Hours of estimated effort">Effort (hours)</span>`. Rename "Effort [h]" to "Estimated effort (hours)". Map acronyms: "SDD" → "Solution Design & Documentation". | [src/app/page.tsx](src/app/page.tsx#L430-500) |
| VIS-10 | P3 | Heading hierarchy | CardTitle ("Activity Input", "Activity Overview") are H3 or div; no H1 on page; Estimate dialog title uses inline styling | Screen reader and user don't know what page is about. Poor SEO. | Add a single `<h1 className="mb-6 text-2xl font-bold">RPA Effort Estimator</h1>` at top of page. Ensure CardTitle maps to H2 semantic tags. Use consistent heading sizes and weights. | [src/app/page.tsx](src/app/page.tsx#L407-410), [src/app/layout.tsx](src/app/layout.tsx) |
| VIS-11 | P3 | Spacing inconsistency | Gap between sections is `my-4` (1rem), but inside cards `grid gap-4` (1rem). Some form fields have `grid gap-2` (0.5rem). No optical adjustment. | Feels either cramped or loose depending on where you look. | Standardize to `gap-4` (1rem) for sections, `gap-3` (0.75rem) for form rows, `gap-2` for sub-fields. Use consistent `p-4` and `p-6` padding on cards. Add `pt-6 pb-4` to card headers for breathing room. | [src/app/page.tsx](src/app/page.tsx#L600-605), [src/components/ui/card.tsx](src/components/ui/card.tsx) |
| VIS-12 | P3 | Separator line visibility | Separator `my-4` between sections is too subtle on dark background; doesn't read as a divider | Users don't perceive section breaks. | Change `<Separator>` to use `border-t border-border opacity-50` and increase `m-y` to `my-6`. Add `h-1` if needed for visibility. | [src/app/page.tsx](src/app/page.tsx#L600, 730), [src/components/ui/separator.tsx](src/components/ui/separator.tsx) |
| VIS-13 | P3 | Dialog layout | Dialog buttons (Hide/Show Config, Generate Report) all same size/color; dialog content is max-width [425px] for config but [800px] for report—inconsistent sizing | Feels unbalanced and unintentional | Standardize dialog sizing: use `sm:max-w-[600px]` for both. Button labels should be more descriptive ("Adjust Overhead Rates" instead of "Show Config"). Add icon to primary CTA button (Generate Report). | [src/app/page.tsx](src/app/page.tsx#L753, 798) |
| VIS-14 | P3 | Typography scale | Body text 12–14px (default Tailwind), labels 14px, headings mixed (18px, 16px, 24px). No consistent scale defined. | Typography feels uncoordinated. Headings don't stand out enough. | Define a typography scale in `tailwind.config.ts`: H1=28px bold, H2=20px semibold, H3=16px semibold, body=14px, label=13px, caption=12px. Apply consistently across all pages. | [tailwind.config.ts](tailwind.config.ts), [src/app/globals.css](src/app/globals.css) |

---

## C) Design System Consistency Report

### Color Tokens
- **Light mode**:
  - Background: white (0 0% 98%)
  - Primary: dark gray (0 0% 9%)
  - Accent: very light gray (0 0% 96.1%)
  - ⚠️ *Broken*: Inline neon colors (#00FFFF, #FF69B4) override theme and are not accessible
- **Dark mode**:
  - Background: black (0 0% 0%)
  - Primary: neon-green (#39FF14) — very bright, not suitable for all text
  - ⚠️ *Broken*: Neon green used for text on dark bg creates readability issues; no secondary/accent colors in dark mode

**Accessibility token status**:
- Added: `--accessible-cyan: #00b7b7` and `--accessible-magenta: #d0457a`
- ⚠️ *Not used*: Classes and inline styles still use old neon values rather than tokens

**Recommendation**:
1. Remove `neonTextColors` array from page.tsx
2. Add to `tailwind.config.ts`:
   ```tsx
   colors: {
     'accessible-cyan': '#00b7b7',
     'accessible-magenta': '#d0457a',
     'muted-accent': '#666666',
   }
   ```
3. Replace all inline `style={{ color: neonTextColors[0] }}` with `className="text-accessible-cyan"`
4. Update dark mode token to use accessible colors instead of neon-green
5. Create `.neon-label` variant: `text-sm font-medium text-muted-foreground`

### Typography
- **Scale**: No defined type scale; mix of sizes: 12px, 13px, 14px, 16px, 18px, 20px, 24px
- **Font family**: Arial, Helvetica, sans-serif (no modern system font stack)
- **Weight**: No consistent semantic mapping (labels, bodies, headings)

**Recommendation**:
1. Add to `tailwind.config.ts`:
   ```tsx
   fontSize: {
     'xs': ['12px', { lineHeight: '16px' }],
     'sm': ['13px', { lineHeight: '18px' }],
     'base': ['14px', { lineHeight: '20px' }],
     'lg': ['16px', { lineHeight: '24px' }],
     'xl': ['20px', { lineHeight: '28px' }],
     '2xl': ['24px', { lineHeight: '32px' }],
   }
   ```
2. Set font family: `'font-family': 'system-ui, -apple-system, sans-serif'`
3. Use semantic classes: `.text-lg .font-semibold` for headings, `.text-sm .font-medium` for labels

### Spacing
- Current: `gap-2` (0.5rem), `gap-4` (1rem), `p-4` (1rem), `p-6` (1.5rem)
- **Problem**: Inconsistent application; no rhythm or optical adjustment
- **Recommendation**: Define and apply consistently—form rows use `gap-3`, sections use `gap-4` / `my-6`, card padding use `p-6`

### Shadows & Depth
- `.glassmorphism`: `box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1)` (large, glowy)
- `.neon-border-glow`: large neon glow (not accessible)
- Standard button/card: Tailwind defaults (small shadow)
- **Problem**: Two competing visual styles (glassmorphism vs. minimal)
- **Recommendation**: Pick one: glassmorphism is trendy but can reduce contrast; recommend minimal with `shadow-sm` / `shadow-md` based on elevation

### Border Radius
- Tailwind default: 0.5rem (8px)
- Used consistently on inputs, buttons, cards
- **Status**: ✅ Consistent

### Component Variants

**Buttons**:
- Variants: default, outline, ghost, secondary, destructive, link
- Sizes: default (h-10), sm (h-9), lg (h-11), icon (h-10 w-10)
- ⚠️ State feedback not visible in component (no hover/active in code review)

**Cards**:
- Base: Card component with header/content/footer
- Variant 1: `glassmorphism` (only Activity Input uses fully)
- Variant 2: Plain with light border-bottom
- ⚠️ Inconsistently applied; no semantic "intent" variants (success, info, warning, error)

**Table**:
- TableHeader, TableRow, TableCell (basic shadcn/ui)
- ⚠️ No row-hover, no striped rows, no cell alignment hints
- Activity table (13 cols) vs. Estimate table (2 cols) look different; header colors different

**Form controls**:
- `.neon-input1`: border + glow but not token-based
- `.neon-select`: custom colors, not using Tailwind variants
- ⚠️ Should all be replaced with standard Tailwind classes + tokens

---

## D) Top 10 "Quick Visual Wins" (doable in <=2 hours)

1. **Remove neon inline colors** — Replace all `style={{ color: neonTextColors[i] }}` with `className="text-accessible-cyan"` (15 min)
   - Files: [src/app/page.tsx](src/app/page.tsx) (multiple lines)
   - Impact: Fixes visual inconsistency immediately

2. **Add section headings to form** — Insert `<h3 className="mt-6 mb-3 text-sm font-semibold">Activity Details</h3>` between form groups (10 min)
   - Groups: Activity Info (app name, adapter, activity name), Type Info (type, exception, core/supervised, reused), Effort, Metadata, Config
   - Files: [src/app/page.tsx](src/app/page.tsx#L430-500)
   - Impact: Instantly reduces cognitive load

3. **Standardize table styling** — Add `.even:bg-slate-50` to table rows and bold headers (10 min)
   - Files: [src/components/ui/table.tsx](src/components/ui/table.tsx), [src/app/page.tsx](src/app/page.tsx#L612)
   - Impact: Tables feel coordinated

4. **Make Activity table responsive** — Wrap in a `<div className="overflow-auto max-h-96">` and add a mobile card view fallback if needed (20 min)
   - Files: [src/app/page.tsx](src/app/page.tsx#L610)
   - Impact: Widget becomes usable on tablet/mobile

5. **Add empty-state message** — Show "Add your first activity above →" when `activities.length === 0` (5 min)
   - Files: [src/app/page.tsx](src/app/page.tsx#L603)
   - Impact: Guides first-time users

6. **Abbreviate long table labels** — Rename "Release and Configuration Guide" → "Config & Release" (5 min)
   - Files: [src/app/page.tsx](src/app/page.tsx#L846)
   - Impact: Better table fit and scannability

7. **Update button labels** — "Hide Config" / "Show Config" → "Edit Overhead" / "Done". "Generate Report" → "Generate Estimate Report" (5 min)
   - Files: [src/app/page.tsx](src/app/page.tsx#L753, 798)
   - Impact: Clearer CTAs

8. **Standardize button hover states** — Add to `.neon-select`, `.neon-input1` classes:  `hover:border-opacity-80 hover:shadow-md` (10 min)
   - Files: [src/app/globals.css](src/app/globals.css#L130-145)
   - Impact: Better interactive feedback

9. **Add H1 to page** — Insert `<h1 className="sr-only">RPA Effort Estimator</h1>` or `<h1 className="text-3xl font-bold mb-6">Effort Estimator</h1>` at page top (5 min)
   - Files: [src/app/page.tsx](src/app/page.tsx#L407)
   - Impact: Improved SEO and semantic structure

10. **Remove neon-border-glow from non-primary cards** — Keep it only on "Activity Input" title or remove entirely; standardize all cards to `shadow-sm border` (10 min)
    - Files: [src/app/page.tsx](src/app/page.tsx#L409, 603, 735), [src/app/globals.css](src/app/globals.css#L106-112)
    - Impact: Cleaner, more professional appearance

---

## E) Responsive QA Notes

### Desktop (1200px+)
- ✅ All content visible without horizontal scroll
- ✅ Form and tables side-by-side (conceptually feasible with left/right layout)
- ⚠️ Activity table with 13 columns still feels overstuffed; consider condensing

### Tablet (768px–1199px)
- ❌ Activity table becomes horizontally scrollable (unusable)
- ⚠️ Form takes full width; no two-column layout benefit
- **Recommendation**: Use CSS media query to hide non-critical columns (Assumption, detailed descriptions) on tablets; stack into card view instead of table

### Mobile (< 768px)
- ❌ **Critical**: Activity table not usable; form becomes single-column but still very tall
- ⚠️ Theme toggle button placement (top-right) is okay but tiny on small screens
- **Recommendation**: 
  - Hide full Activity table; replace with a simple card list:
    ```tsx
    {activities.length > 0 && activities.map(a => (
      <div className="border rounded p-3 mb-2">
        <p className="font-semibold text-sm">{a.applicationName}</p>
        <p className="text-xs text-muted-foreground">{a.activityName} — {a.effort}h</p>
      </div>
    ))}
    ```
  - Form: ensure touch targets are >= 44px (buttons, inputs)
  - Dialogs: use `max-w-[90vw]` to leave margins on narrow screens
  - Remove or stack the button bar (Hide Config, Generate Report) into a single-column menu

### Suggested breakpoint strategy
- **Mobile-first**: Start at mobile, add styles for `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Activity table: hidden on `md` breakpoint; add `md:table` to table, `md:hidden` to card list
- Form: `md:grid-cols-2` for two-column layout on medium screens

---

## F) Regression Visual Checklist (max 20 checks)

- **Layout & hierarchy**
  - [ ] Main page has visible H1 and clear sections (Activity Input, Activity Overview, Estimate Overview)
  - [ ] Form groups are visually distinct with section headers or background separation
  - [ ] Cards use consistent shadow/border styling (no mix of glassmorphism + plain)
- **Color & contrast**
  - [ ] All text meets WCAG AA contrast ratio (4.5:1 for normal, 3:1 for large)
  - [ ] Neon colors (#00FFFF, #FF69B4) are **not** used for body text or tables
  - [ ] Dark mode uses accessible tokens (`--accessible-cyan`, `--accessible-magenta`), not neon-green for text
  - [ ] Inline color attributes removed; all colors use Tailwind classes or CSS variables
- **Typography**
  - [ ] Headings (H1, H2, H3) use consistent, scaled sizes (28px, 20px, 16px or similar)
  - [ ] Body text is 14px with 20px line-height; labels are 13px
  - [ ] Font-weight is semantic: body=400, label=500, heading=600+
- **Spacing**
  - [ ] Form grouping has consistent internal gap (gap-3 or gap-4) and external margin (my-6)
  - [ ] Card padding is consistent (p-6 on headers, p-4 on content)
- **Interactive states**
  - [ ] Buttons show hover state (opacity change, color shift, or shadow increase)
  - [ ] Input fields show focus ring (ring-2 ring-offset-2 ring-ring) when focused
  - [ ] Dialog close buttons are large and easily tappable (>= 44px)
- **Tables**
  - [ ] HeaderRow has distinct background color (bg-slate-100 or similar)
  - [ ] Table rows have subtle hover effect (bg-opacity-50)
  - [ ] Column alignment is clear (right-align for numbers, left for text)
  - [ ] Both Activity table and Estimate table use same styling approach
- **Responsive**
  - [ ] On tablet (768px): Activity table hidden or card view shown
  - [ ] On mobile (< 480px): Form fits within viewport height without excessive scroll; no horizontal scroll
  - [ ] Dialog max-width is responsive (`sm:max-w-[600px]` or responsive units)
- **Consistency**
  - [ ] All icons use same size/color approach (lucide-react, consistent sizing)
  - [ ] Borders and radii consistent (8px default radius, single-width borders)

---

## Visual QA Actions (Summary)

**Immediate (P1 — fixes core usability)**
1. Make Activity table responsive or switch to card layout
2. Remove neon inline colors, use Tailwind tokens throughout

**Short-term (P2 — polish)**
1. Add form section grouping headings
2. Standardize card and button styling
3. Update table styling (headers, row hover)
4. Add empty-state messaging

**Nice-to-have (P3 — refinement)**
1. Define and apply typography scale
2. Add H1 and fix heading hierarchy
3. Improve spacing rhythm
4. Abbreviate long labels in tables

---

## Files to modify (in priority order)
1. [src/app/page.tsx](src/app/page.tsx) — inline colors, form layout, empty states, button labels
2. [src/app/globals.css](src/app/globals.css) — neon classes, remove glow, update scales
3. [tailwind.config.ts](tailwind.config.ts) — add tokens, typography scale, colors
4. [src/components/ui/table.tsx](src/components/ui/table.tsx) — row styling, hover states
5. [src/components/ui/button.tsx](src/components/ui/button.tsx) — ensure hover/active states visible
6. [src/app/components/EstimateReport.tsx](src/app/components/EstimateReport.tsx) — table consistency

---

*End of Visual QA Report*
