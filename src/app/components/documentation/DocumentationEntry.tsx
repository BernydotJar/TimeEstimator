"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { DocumentationWorkspace } from "./DocumentationWorkspace";

export function DocumentationEntry({ projectId }: { projectId: string }) {
  const { getProject, generateDocumentation } = useProjects();
  const [open, setOpen] = useState(false);
  const project = getProject(projectId);
  if (!project) return null;
  const artifacts = project.discovery?.artifacts ?? [];

  if (open && artifacts.length) {
    return <DocumentationWorkspace projectId={projectId} artifacts={artifacts} onClose={() => setOpen(false)} />;
  }

  return (
    <section className="cinematic-panel flex flex-wrap items-center justify-between gap-4" aria-labelledby="documentation-entry-title">
      <div>
        <div className="panel-kicker">Documentation studio</div>
        <h2 id="documentation-entry-title" className="mt-1 text-lg font-semibold text-white">
          Structured project artifacts
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {artifacts.length
            ? `${artifacts.length} draft artifacts · structured models remain source of truth`
            : "Generate eight traceable drafts with Mermaid and textual flow projections."}
        </p>
      </div>
      <Button
        type="button"
        onClick={() => {
          if (!artifacts.length) generateDocumentation(projectId);
          setOpen(true);
        }}
      >
        {artifacts.length ? "Review documentation" : "Generate documentation"}
      </Button>
    </section>
  );
}
