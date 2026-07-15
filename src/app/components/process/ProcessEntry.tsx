"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { getActiveProjectProcess } from "@/persistence/process-operations";
import { ProcessWorkspace } from "./ProcessWorkspace";

export function ProcessEntry({ projectId }: { projectId: string }) {
  const { getProject, createCurrentStateProcess } = useProjects();
  const [open, setOpen] = useState(false);
  const project = getProject(projectId);
  const process = project ? getActiveProjectProcess(project) : undefined;

  if (!project) return null;
  if (open && process) return <ProcessWorkspace projectId={projectId} process={process} onClose={() => setOpen(false)} />;

  return (
    <section className="cinematic-panel flex flex-wrap items-center justify-between gap-4" aria-labelledby="current-process-title">
      <div>
        <div className="panel-kicker">Process discovery</div>
        <h2 id="current-process-title" className="mt-1 text-lg font-semibold text-white">Current-State Process</h2>
        <p className="mt-1 text-sm text-slate-400">
          {process ? `${process.steps.length} steps · ${process.edges.length} edges · ${process.status}` : "Capture, normalize, review, and validate the process locally."}
        </p>
      </div>
      <Button type="button" onClick={() => { if (!process) createCurrentStateProcess(projectId); setOpen(true); }}>
        {process ? "Resume process" : "Create process"}
      </Button>
    </section>
  );
}
