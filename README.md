# TimeEstimator

Built by Eduardo Sacahui — Platform Architect.

## Overview

TimeEstimator accelerates and standardizes effort estimation for Robotic Process Automation (RPA) initiatives. It brings together activity capture, parameterized overhead calculations, and vivid reporting views so delivery teams can move from discovery to sizing in minutes instead of days.

## Why It Helps

- Streamlines RPA assessment workshops by capturing inputs in a guided Activity Input workspace.
- Applies configurable formulas to calculate core vs. supervised effort, contingencies, and supporting deliverables with consistent two-decimal precision.
- Surfaces glassmorphism-inspired dashboards that highlight totals, category breakdowns, and professional summaries ready for stakeholders.
- Cuts manual spreadsheet work, reducing the risk of copy-paste mistakes and total misalignments.

## Core Features

- **Activity Modeling:** Neon card interface for entering tasks, ownership, tools, and complexity indicators.
- **Dynamic Calculations:** Automatic totals across categories, contingency, and documentation based on Eduardo’s curated estimation model.
- **Report Generation:** Professional narrative summary plus overview cards suitable for exec reviews or delivery handoffs.
- **Theme Controls:** Toggleable UI states to adapt to stakeholder sessions (dark, neon, and glassmorphism layouts).

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to explore the estimation console. Core logic, UI components, and calculation rules live in `src/app/page.tsx`.

## Roadmap Ideas

- Export to Excel or CSV for audit packs.
- Persist scenarios with a database backend for historical comparisons.
- Embed RPA maturity scoring and risk heuristics to prioritize automation candidates.

---

Designed to help automation architects like Eduardo forecast with confidence and keep RPA delivery humming.
