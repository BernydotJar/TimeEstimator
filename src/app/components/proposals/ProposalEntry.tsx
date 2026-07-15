"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { ProposalWorkspace } from "./ProposalWorkspace";

export function ProposalEntry({ projectId }: { projectId: string }) {
  const { getProject, generateProposalSet } = useProjects();
  const [open, setOpen] = useState(false);
  const project = getProject(projectId);
  if (!project) return null;
  const draft =
    project.discovery?.estimationDrafts.find(
      (item) => item.id === project.discovery?.activeEstimationDraftId,
    ) ?? project.discovery?.estimationDrafts.at(-1);

  if (open && draft) {
    return (
      <ProposalWorkspace
        projectId={projectId}
        draft={draft}
        onClose={() => setOpen(false)}
      />
    );
  }

  return (
    <section
      className="cinematic-panel flex flex-wrap items-center justify-between gap-4"
      aria-labelledby="proposal-entry-title"
    >
      <div>
        <div className="panel-kicker">Estimation mapping</div>
        <h2 id="proposal-entry-title" className="mt-1 text-lg font-semibold text-white">
          Traceable activity proposals
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {draft
            ? `${draft.proposals.length} proposals · ${draft.status}`
            : "Generate deterministic suggestions without changing approved activities."}
        </p>
      </div>
      <Button
        type="button"
        onClick={() => {
          if (!draft) generateProposalSet(projectId);
          setOpen(true);
        }}
      >
        {draft ? "Review proposals" : "Generate proposals"}
      </Button>
    </section>
  );
}
