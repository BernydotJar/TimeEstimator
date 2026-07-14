# Claude Operating Guide

Read `AGENTS.md`, then `RTK.md`, before taking action.

## Default Behavior

- Work from `feature_list.json`.
- Select only one feature at a time.
- Do not implement app code unless the feature status is `approved`.
- Do not mark a feature `done` without reviewer approval and verification evidence.
- Respect file boundaries declared in command prompts and specs.

## Product POV

TimeEstimator should feel like a cinematic automation-estimation command center: dark, precise, executive, and credible. Avoid toy neon, generic dashboard noise, or animations that distract from estimation accuracy.

## Agent Routing

- Use the Leader role for orchestration.
- Use the Spec Author role for requirements, design, and tasks.
- Use the Implementer role only after human approval.
- Use the Reviewer role after implementation.
- Use the Production Reviewer role for SHIP mode.

## Stop Conditions

Stop and ask for human input when:

- the spec is missing or ambiguous;
- the requested change exceeds approved scope;
- a dependency, schema change, destructive command, or secret is required;
- more than one active feature is detected;
- verification cannot run;
- implementation would change estimation formulas without explicit requirements.
