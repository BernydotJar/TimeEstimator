import type {
  ProcessDefinition,
  ProcessValidationCode,
  ProcessValidationResult,
  ValidationFinding,
} from "./process";

export function validateProcess(
  process: ProcessDefinition,
  now = new Date().toISOString(),
): ProcessValidationResult {
  const errors: ValidationFinding[] = [];
  const warnings: ValidationFinding[] = [];
  const stepIds = new Set(process.steps.map((step) => step.id));
  const actorIds = new Set(process.actors.map((actor) => actor.id));
  const systemIds = new Set(process.systems.map((system) => system.id));

  const add = (
    severity: "error" | "warning",
    code: ProcessValidationCode,
    message: string,
    details: Omit<ValidationFinding, "id" | "code" | "severity" | "message"> = {},
  ) => {
    const issue: ValidationFinding = {
      id: `validation:${code}:${errors.length + warnings.length + 1}`,
      code,
      severity,
      message,
      ...details,
    };
    (severity === "error" ? errors : warnings).push(issue);
  };

  if (process.steps.length === 0) {
    add("error", "PROCESS_EMPTY", "The process has no structured steps.", {
      suggestedRemediation: "Add or normalize at least one process step.",
    });
  }

  for (const step of process.steps) {
    if (!step.name.trim()) {
      add("error", "STEP_NAME_MISSING", "A process step is missing its name.", {
        stepIds: [step.id],
        entityId: step.id,
        suggestedRemediation: "Provide a concise observable step name.",
      });
    }
    for (const actorId of step.actorIds) {
      if (!actorIds.has(actorId)) {
        add("error", "ACTOR_REFERENCE_MISSING", `Step ${step.name || step.id} references a missing actor.`, {
          stepIds: [step.id],
          entityId: step.id,
          suggestedRemediation: "Create the actor or remove the invalid reference.",
        });
      }
    }
    for (const systemId of step.systemIds) {
      if (!systemIds.has(systemId)) {
        add("error", "SYSTEM_REFERENCE_MISSING", `Step ${step.name || step.id} references a missing system.`, {
          stepIds: [step.id],
          entityId: step.id,
          suggestedRemediation: "Create the system or remove the invalid reference.",
        });
      }
    }
    if (step.type === "exception" && !(step.exceptionBehavior || step.exception?.handling)?.trim()) {
      add("warning", "EXCEPTION_WITHOUT_RECOVERY", `Exception step ${step.name || step.id} has no recovery behavior.`, {
        stepIds: [step.id],
        entityId: step.id,
        suggestedRemediation: "Document recovery, escalation, or terminal behavior.",
      });
    }
  }

  const edgeKeys = new Map<string, string>();
  for (const edge of process.edges) {
    if (!stepIds.has(edge.sourceStepId)) {
      add("error", "EDGE_SOURCE_MISSING", "An edge references a missing source step.", {
        edgeIds: [edge.id],
        entityId: edge.id,
        suggestedRemediation: "Select an existing source step.",
      });
    }
    if (!stepIds.has(edge.targetStepId)) {
      add("error", "EDGE_TARGET_MISSING", "An edge references a missing target step.", {
        edgeIds: [edge.id],
        entityId: edge.id,
        suggestedRemediation: "Select an existing target step.",
      });
    }
    if (edge.sourceStepId === edge.targetStepId) {
      add("warning", "EDGE_SELF_LOOP", "An edge connects a step to itself.", {
        edgeIds: [edge.id],
        stepIds: [edge.sourceStepId],
        entityId: edge.id,
        suggestedRemediation: "Use an explicit retry path to another step or document the loop.",
      });
    }
    const key = `${edge.sourceStepId}:${edge.targetStepId}:${edge.type}:${edge.condition ?? ""}`;
    const duplicate = edgeKeys.get(key);
    if (duplicate) {
      add("warning", "EDGE_DUPLICATE", "Two edges describe the same directed connection.", {
        edgeIds: [duplicate, edge.id],
        entityId: edge.id,
        suggestedRemediation: "Remove the duplicate or make its condition distinct.",
      });
    } else edgeKeys.set(key, edge.id);

    if (edge.type === "conditional" && !(edge.condition || edge.label)?.trim()) {
      add("warning", "CONDITIONAL_EDGE_WITHOUT_CONDITION", "A conditional edge has no condition or label.", {
        edgeIds: [edge.id],
        entityId: edge.id,
        suggestedRemediation: "Provide a condition such as Yes, No, Approved, or Rejected.",
      });
    }
  }

  const starts = process.steps.filter((step) => step.type === "start");
  const ends = process.steps.filter((step) => step.type === "end");
  if (process.steps.length > 0 && starts.length === 0) {
    add("warning", "START_MISSING", "The process has no explicit start step.", {
      suggestedRemediation: "Mark the trigger or first observable event as start.",
    });
  }
  if (starts.length > 1) {
    add("warning", "START_MULTIPLE", "The process has multiple start steps.", {
      stepIds: starts.map((step) => step.id),
      suggestedRemediation: "Confirm whether multiple triggers are intentional.",
    });
  }
  if (process.steps.length > 0 && ends.length === 0) {
    add("warning", "END_MISSING", "The process has no explicit end step.", {
      suggestedRemediation: "Add a terminal outcome or completion step.",
    });
  }

  const outgoing = new Map<string, typeof process.edges>();
  const incoming = new Map<string, typeof process.edges>();
  for (const step of process.steps) {
    outgoing.set(step.id, []);
    incoming.set(step.id, []);
  }
  for (const edge of process.edges) {
    outgoing.get(edge.sourceStepId)?.push(edge);
    incoming.get(edge.targetStepId)?.push(edge);
  }

  for (const step of process.steps) {
    const inCount = incoming.get(step.id)?.length ?? 0;
    const outCount = outgoing.get(step.id)?.length ?? 0;
    if (process.steps.length > 1 && inCount === 0 && outCount === 0) {
      add("warning", "ORPHAN_STEP", `Step ${step.name || step.id} is not connected.`, {
        stepIds: [step.id],
        entityId: step.id,
        suggestedRemediation: "Connect the step or remove it from this process version.",
      });
    }
    if (step.type === "decision" && outCount < 2) {
      add("warning", "DECISION_WITHOUT_BRANCH", `Decision ${step.name || step.id} has fewer than two outgoing branches.`, {
        stepIds: [step.id],
        entityId: step.id,
        suggestedRemediation: "Add explicit outcomes such as Yes/No or Approved/Rejected.",
      });
    }
  }

  const traversalStarts = starts.length > 0 ? starts : process.steps.slice(0, 1);
  const reachable = new Set<string>();
  const queue = traversalStarts.map((step) => step.id);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);
    for (const edge of outgoing.get(current) ?? []) {
      if (stepIds.has(edge.targetStepId) && !reachable.has(edge.targetStepId)) queue.push(edge.targetStepId);
    }
  }
  if (process.steps.length > 1) {
    for (const step of process.steps) {
      if (!reachable.has(step.id)) {
        add("warning", "UNREACHABLE_STEP", `Step ${step.name || step.id} cannot be reached from the process start.`, {
          stepIds: [step.id],
          entityId: step.id,
          suggestedRemediation: "Connect the step to a reachable predecessor or confirm a separate trigger.",
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validatedAt: now,
    processUpdatedAt: process.updatedAt,
  };
}
