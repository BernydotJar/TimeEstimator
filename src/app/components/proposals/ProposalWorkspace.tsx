"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { validateProposalDraft, type EstimationDraft } from "@/domain/discovery";
import { useProjects } from "@/hooks/use-projects";

export function ProposalWorkspace({
  projectId,
  draft,
  onClose,
}: {
  projectId: string;
  draft: EstimationDraft;
  onClose: () => void;
}) {
  const { updateProposal, getProposalPreview, applyProposals } = useProjects();
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const preview = useMemo(
    () => getProposalPreview(projectId, draft.id),
    [getProposalPreview, projectId, draft.id, draft.proposals],
  );
  const validation = useMemo(() => validateProposalDraft(draft), [draft]);
  const lastReceipt = draft.applyReceipts?.at(-1);

  return (
    <section className="cinematic-panel space-y-5" aria-labelledby="proposal-workspace-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="panel-kicker">Review before apply</div>
          <h2 id="proposal-workspace-title" className="mt-1 text-2xl font-semibold text-white">
            Activity proposals
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Rule catalog {draft.ruleCatalogVersion ?? "unknown"} · snapshot {draft.inputSnapshotHash}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>Back</Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Proposals" value={draft.proposals.length} />
        <Metric label="Selected" value={preview?.selectedCount ?? 0} />
        <Metric label="Added effort" value={`${preview?.addedEffort ?? 0}h`} />
      </div>

      <div className="space-y-3">
        {draft.proposals.map((proposal) => (
          <article key={proposal.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <input
                  aria-label={`Proposal ${proposal.id} name`}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm font-semibold text-white"
                  value={proposal.activity.activityName}
                  onChange={(event) =>
                    updateProposal(projectId, draft.id, proposal.id, {
                      activity: { ...proposal.activity, activityName: event.target.value },
                      reviewed: true,
                    })
                  }
                />
                <p className="mt-2 text-sm text-slate-400">{proposal.rationale}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {proposal.deliveryPhase} · {proposal.category} · source {proposal.source} · steps {proposal.originStepIds.join(", ")}
                </p>
                {proposal.unknowns?.length ? (
                  <p className="mt-1 text-xs text-amber-300">Unknown: {proposal.unknowns.join(", ")}</p>
                ) : null}
                {proposal.warnings?.map((warning) => (
                  <p key={warning} className="mt-1 text-xs text-amber-300">{warning}</p>
                ))}
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-300">
                <label>
                  <input
                    type="checkbox"
                    checked={proposal.included ?? true}
                    onChange={(event) =>
                      updateProposal(projectId, draft.id, proposal.id, {
                        included: event.target.checked,
                        selected: event.target.checked ? proposal.selected : false,
                        reviewed: true,
                      })
                    }
                  />{" "}Include
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={proposal.selected ?? false}
                    disabled={proposal.included === false}
                    onChange={(event) =>
                      updateProposal(projectId, draft.id, proposal.id, {
                        selected: event.target.checked,
                        reviewed: true,
                      })
                    }
                  />{" "}Select
                </label>
                <label>
                  Effort{" "}
                  <input
                    aria-label={`Proposal ${proposal.id} effort`}
                    className="ml-1 w-20 rounded border border-slate-700 bg-slate-950 p-1"
                    type="number"
                    min="0"
                    step="0.25"
                    value={proposal.calculatedEffortHours}
                    onChange={(event) => {
                      const effort = Number(event.target.value);
                      updateProposal(projectId, draft.id, proposal.id, {
                        calculatedEffortHours: effort,
                        baseEffortHours: effort,
                        activity: { ...proposal.activity, effort },
                        reviewed: true,
                      });
                    }}
                  />
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <h3 className="font-semibold text-white">Impact preview</h3>
        <p className="mt-1 text-sm text-slate-300">
          Current base: {preview?.currentBase ?? 0}h · Proposed base: {preview?.proposedBase ?? 0}h
        </p>
        <p className="text-sm text-slate-300">
          Current grand total: {(preview?.currentGrandTotal ?? 0).toFixed(2)}h · Proposed grand total: {(preview?.proposedGrandTotal ?? 0).toFixed(2)}h
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Preview only. Existing activities remain unchanged until explicit apply.
        </p>
      </div>

      {(validation.errors.length || validation.warnings.length) ? (
        <div className="rounded-xl border border-amber-700/60 bg-amber-950/20 p-4" aria-live="polite">
          <h3 className="font-semibold text-amber-100">Review findings</h3>
          {[...validation.errors, ...validation.warnings].map((finding) => (
            <p key={finding.id} className="mt-1 text-sm text-amber-200">
              {finding.severity === "error" ? "Error" : "Warning"}: {finding.message}
            </p>
          ))}
        </div>
      ) : null}

      {lastReceipt ? (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-4">
          <h3 className="font-semibold text-emerald-100">Last apply receipt</h3>
          <p className="mt-1 text-sm text-emerald-200">
            {lastReceipt.proposalIds.length} proposal(s) applied as {lastReceipt.activityIds.length} activity record(s).
          </p>
          <p className="mt-1 text-xs text-emerald-300">Receipt {lastReceipt.id} · {lastReceipt.appliedAt}</p>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        I confirm applying only the selected proposals.
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!confirmed || !preview?.selectedCount || !validation.valid}
          onClick={() => {
            const warnings = applyProposals(projectId, draft.id, confirmed);
            setMessage(warnings.length ? warnings.join(" ") : "Selected proposals applied.");
            setConfirmed(false);
          }}
        >
          Apply selected
        </Button>
        <Button type="button" variant="outline" onClick={() => setConfirmed(false)}>
          Cancel confirmation
        </Button>
      </div>
      {message ? <p role="status" className="text-sm text-slate-300">{message}</p> : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
