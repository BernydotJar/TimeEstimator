# TimeEstimator product blueprint

> Status note: this file began as the original Firebase Studio concept. The
> implemented product is now a browser-local Next.js application deployed as a
> static export to GitHub Pages. Optional AI enhancement uses public n8n
> webhooks with deterministic local fallbacks; Firebase is not part of the
> current runtime.

## Current core features

- Browser-local project creation, rename, deletion, and persistence.
- Guided manual activity entry for application, adapter, type, delivery model,
  reuse, effort, exception handling, assumptions, and RPA tooling.
- Process-step import through public n8n webhooks with a deterministic local
  parser when n8n is not configured or unavailable.
- Configurable overhead percentages and automatic effort calculations.
- Responsive activity ledger, estimate overview, charts, stakeholder report,
  PNG export, and print/PDF support.
- Light and dark theme switching.
- Static GitHub Pages deployment with manifest, sitemap, robots, and metadata.

## Current style guidelines

- Accessible cyan and magenta accents over neutral light and dark surfaces.
- Clear card hierarchy with restrained translucency and shadows.
- Responsive controls and mobile activity cards at narrow viewports.
- Visible keyboard focus, semantic labels, and reduced decorative motion.
- Modular sections for input, ledger, calculations, configuration, and reports.

## Original user request (historical)
Our old Excel estimation process needs a modern web-based solution.

**Objective:** Build a web app on Firebase to replace our Excel estimator, incorporating a new user interface and enhanced functionality.

**Key Information to Manage:** Application Activities and Process Activities, detailing: Application Name, Adapter, Activity Name, Activity Type, Quantity, Core/Supervised, Reused?, Effort [h], Business Exception, and Assumption.

**Modernization Requirements:**
* Implement a fresh, modern look and feel.
* Specifically, include a striking black and neon futuristic theme with glassmorphism elements.
* Develop a dynamic theme switching feature triggered by an interactive button (visual press/release + confetti effect).
* Ensure the app provides a clear estimate overview based on the input data.

**Team Roles:** Senior Developer, UX Designer, QA Engineer, Project Manager, CI/CD Agent.

The current delivery architecture supersedes the original Firebase deployment
request with GitHub Pages so the estimator can operate without a server-side
runtime. Project data remains in the user's browser through local storage.
