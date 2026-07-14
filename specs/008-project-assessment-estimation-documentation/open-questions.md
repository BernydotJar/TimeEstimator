# Open Questions — 008 Project Discovery & Estimation Studio

## Decisions requiring human approval

### Assessment experience

1. Should the MVP use a hybrid layout: section navigator on desktop and
   step-by-step wizard on phone?
2. Which questions are mandatory before an expected estimate can be generated?
3. May users create custom questions in MVP, or only add notes/evidence?
4. Should completeness be based on answered questions, evidence quality, or both?
5. Can multiple stakeholders answer the same assessment in a browser-local app,
   or is single-user consolidation sufficient?

### Estimation model

6. Which deterministic baseline should be approved: current activity effort only,
   a calibrated activity matrix, or phase-based work packages?
7. How should optimistic and conservative scenarios be derived without creating
   hidden multipliers?
8. Is confidence primarily evidence coverage, unknown count, model calibration,
   or a weighted combination?
9. Which dimensions are activities and which are overheads?
10. How should the product prevent discovery, documentation, and PM from being
    counted both explicitly and as percentages?
11. Are scenario values editable? If yes, must every adjustment include a reason?
12. What minimum evidence is required before the UI may show a high-confidence
    estimate?
13. Should the product support hours only in MVP, or also days, team capacity, and
    calendar duration?

### AI assistance

14. Which outputs may AI suggest: normalized steps, activity proposals,
    documentation wording, estimates, or all with different controls?
15. Must an AI estimate always be compared with the deterministic baseline?
16. What confidence threshold permits an AI suggestion to appear without an
    additional warning?
17. What evidence may be sent to a public n8n endpoint, and what must remain local?
18. Should generated text identify source, model/workflow version, and timestamp?

### Process modeling and documentation

19. Is Mermaid sufficient for MVP diagrams?
20. Are swimlanes required in MVP, or can actor/system metadata be shown beside a
    standard flowchart?
21. Is BPMN export a post-MVP adapter only?
22. How should current-state and future-state steps be related: separate graphs,
    variants of the same stable step, or explicit transformation links?
23. How should retries, loops, parallel branches, timers, and exception paths be
    represented?
24. Which generated documents are MVP: all eight proposed artifacts or a smaller
    package?
25. Which sections are editable prose versus regenerated structured views?
26. When regeneration conflicts with manual edits, should the product preserve,
    merge, or request a decision?
27. What evidence must appear in stakeholder-facing reports versus an internal
    audit appendix?

### Reporting and export

28. Confirm that PNG is an executive-summary-only artifact rather than a complete
    report.
29. Approve target PNG dimensions and pixel ratio (for example, 1600×900 at 2x).
30. Confirm that the full report uses a dedicated print route/root.
31. Which page size is canonical: A4, Letter, or selectable?
32. Must charts be vector, raster, or accompanied by data tables in PDF?
33. Should long activity tables be fully included, summarized, or moved to an
    appendix?
34. Is direct programmatic PDF generation necessary, or is browser Save as PDF
    sufficient for the static MVP?
35. Which browsers are release blockers for print/PDF compatibility?

### Persistence and compatibility

36. Should Feature 008 data live inside each `Project` or in separate localStorage
    collections referenced by project ID?
37. What is the retention policy for drafts, generated artifacts, and superseded
    versions?
38. Should users be able to export/import the complete structured project as JSON?
39. How many historical estimate/document versions should be retained locally?
40. Is a storage quota warning required before MVP release?

## Recommended MVP decisions

The specification recommends the following starting decisions for review:

- Hybrid assessment UX.
- Fixed, versioned question catalog with notes/evidence; custom questions later.
- Deterministic baseline first; AI only proposes and explains.
- Confidence based on evidence coverage, unknowns, and explicit validation status.
- Structured graph as source of truth; Mermaid as MVP renderer.
- Current and future state as separately versioned graphs with trace links.
- PNG limited to a fixed executive summary.
- Full report printed from a dedicated route/root using browser Save as PDF.
- Optional versioned fields on `Project` with lazy migration of legacy data.
- Manual overrides preserved and explicitly reconciled during regeneration.

## Approval gate

Feature 008 must remain `spec_ready` until the MVP decisions, estimation policy,
PNG contract, and Print/PDF architecture are explicitly approved.