import type { ProcessDefinition } from "./process";

export function renderProcessTextFlow(process: ProcessDefinition): string {
  if (process.steps.length === 0) return "No structured process steps yet.";

  const actorById = new Map(process.actors.map((actor) => [actor.id, actor.name]));
  const systemById = new Map(process.systems.map((system) => [system.id, system.name]));
  const stepById = new Map(process.steps.map((step) => [step.id, step]));
  const edgesBySource = new Map<string, typeof process.edges>();
  for (const step of process.steps) edgesBySource.set(step.id, []);
  for (const edge of process.edges) edgesBySource.get(edge.sourceStepId)?.push(edge);

  return [...process.steps]
    .sort((a, b) => a.orderHint - b.orderHint)
    .map((step, index) => {
      const lines = [`${index + 1}. ${step.name || "Unnamed step"}`];
      lines.push(`   Type: ${step.type}`);
      if (step.actorIds.length > 0) {
        lines.push(`   Actor: ${step.actorIds.map((id) => actorById.get(id) ?? `[Missing actor: ${id}]`).join(", ")}`);
      }
      if (step.systemIds.length > 0) {
        lines.push(`   System: ${step.systemIds.map((id) => systemById.get(id) ?? `[Missing system: ${id}]`).join(", ")}`);
      }
      if (step.decisionCondition || step.decision?.question) {
        lines.push(`   Decision: ${step.decisionCondition ?? step.decision?.question}`);
      }
      if (step.exceptionBehavior || step.exception?.handling) {
        lines.push(`   Exception behavior: ${step.exceptionBehavior ?? step.exception?.handling}`);
      }
      const edges = [...(edgesBySource.get(step.id) ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      if (edges.length === 0) lines.push("   Next: [Not connected]");
      else {
        lines.push("   Next:");
        for (const edge of edges) {
          const target = stepById.get(edge.targetStepId)?.name ?? `[Missing target: ${edge.targetStepId}]`;
          const label = edge.label || edge.condition || edge.type;
          lines.push(`   - ${label} -> ${target}`);
        }
      }
      return lines.join("\n");
    })
    .join("\n\n");
}
