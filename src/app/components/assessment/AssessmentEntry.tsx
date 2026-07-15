"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { getActiveProjectAssessment } from "@/persistence/assessment-operations";
import { AssessmentWorkspace } from "./AssessmentWorkspace";

export function AssessmentEntry({ projectId }: { projectId: string }) {
  const { getProject, createAssessment, saveAssessment, markAssessmentReadyForReview } = useProjects();
  const [open, setOpen] = useState(false);
  const project = getProject(projectId);
  const assessment = project ? getActiveProjectAssessment(project) : undefined;

  if (!project) return null;
  if (!open) {
    return (
      <section className="cinematic-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="panel-kicker">Discovery</div>
          <h2 className="mt-1 text-lg font-semibold text-white">Project Assessment</h2>
          <p className="mt-1 text-sm text-slate-400">{assessment ? `${assessment.completeness.percent}% required completion · ${assessment.status.replaceAll("_", " ")}` : "Capture scope, process, technology, governance, risks, notes, and evidence."}</p>
        </div>
        <Button type="button" onClick={() => { if (!assessment) createAssessment(projectId); setOpen(true); }}>
          {assessment ? "Resume assessment" : "Start assessment"}
        </Button>
      </section>
    );
  }

  if (!assessment) return null;
  return <AssessmentWorkspace assessment={assessment} onChange={(next) => saveAssessment(projectId, next)} onReady={() => markAssessmentReadyForReview(projectId, assessment.id)} onClose={() => setOpen(false)} />;
}
