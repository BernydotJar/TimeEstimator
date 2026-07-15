# Goal — Feature 008 Phases 7–8 Report Architecture and Bounded Exports

Implement one deterministic `ReportViewModel` consumed by interactive preview, bounded executive-summary PNG, and an isolated Print/PDF route.

## Required outcomes

- preserve current formulas and `DEFAULT_OVERHEAD`;
- keep scenarios and confidence explicitly unavailable until approved data exists;
- capture only a fixed executive-summary root for PNG;
- cap the logical summary at 960×1200 and render at 1.5 scale;
- use `canvas.toBlob()` and deterministic sanitized filenames;
- provide accessible loading, progress, success, and actionable error states;
- render complete report content through `/report?id=<project-id>` after browser-storage hydration;
- hide route controls under print media;
- support repeated table headers, reduced print columns, and explicit page-break boundaries;
- retain browser-local/no-backend/static-export compatibility;
- add deterministic tests and run the complete repository gate;
- open a Draft PR and stop before merge.

## Human verification debt

Real browser inspection remains required for representative bounded PNG files, Chromium Print Preview, saved A4/Letter PDFs, long tables, mobile overflow, keyboard focus, and a second print engine when available.
