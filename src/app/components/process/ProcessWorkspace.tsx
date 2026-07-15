"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import {
  PROCESS_PARSER_VERSION,
  detectProcessFormat,
  renderProcessTextFlow,
  type ParsedCandidateReviewState,
  type ProcessDefinition,
  type ProcessStepType,
  type RawProcessInput,
} from "@/domain/discovery";

const STEP_TYPES: ProcessStepType[] = ["start", "task", "user_task", "system_task", "ai_task", "decision", "approval", "integration", "document_processing", "wait", "notification", "exception", "end"];

export function ProcessWorkspace({ projectId, process, onClose }: { projectId: string; process: ProcessDefinition; onClose: () => void }) {
  const { saveRawProcessInput, parseRawProcessInput, saveCandidateReview, normalizeProcess, validateProcess, connectLinearSteps } = useProjects();
  const latestRaw = process.rawInputs?.at(-1);
  const [content, setContent] = useState(latestRaw?.content ?? process.rawInput ?? "");
  const review = process.candidateReview;
  const flow = useMemo(() => renderProcessTextFlow(process), [process]);

  const saveRaw = () => {
    const timestamp = new Date().toISOString();
    const input: RawProcessInput = {
      id: latestRaw?.id ?? crypto.randomUUID(),
      projectId,
      processId: process.id,
      content,
      format: detectProcessFormat(content).format,
      source: "manual",
      capturedAt: latestRaw?.capturedAt ?? timestamp,
      updatedAt: timestamp,
    };
    saveRawProcessInput(projectId, process.id, input);
    return input.id;
  };

  const updateCandidate = (candidateId: string, updates: Partial<ParsedCandidateReviewState["candidates"][number]>) => {
    if (!review) return;
    saveCandidateReview(projectId, process.id, { ...review, candidates: review.candidates.map((candidate) => candidate.id === candidateId ? { ...candidate, ...updates } : candidate) });
  };

  return (
    <section aria-labelledby="process-workspace-title" className="cinematic-panel space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="panel-kicker">Structured process ingestion</div><h2 id="process-workspace-title" className="mt-1 text-2xl font-semibold text-white">Current-State Process</h2><p className="mt-1 text-sm text-slate-400">Raw evidence remains separate from the normalized graph.</p></div>
        <Button type="button" variant="outline" onClick={onClose}>Back to estimation</Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Process summary">
        <Metric label="Status" value={process.status} /><Metric label="Steps" value={String(process.steps.length)} /><Metric label="Edges" value={String(process.edges.length)} /><Metric label="Source" value={process.source ?? "manual"} /><Metric label="Parser" value={PROCESS_PARSER_VERSION} />
      </div>

      {review?.stale && <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Raw input changed after parsing. Existing normalized steps remain intact until explicit reparse and normalization.</p>}

      <div className="space-y-2">
        <label htmlFor="raw-process-input" className="text-sm font-medium text-white">Raw process description</label>
        <textarea id="raw-process-input" className="min-h-48 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none focus:border-sky-500" value={content} onChange={(event) => setContent(event.target.value)} placeholder={"1. Receive request\n2. Validate invoice\n3. If approved, notify requester\n4. Complete case"} />
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={saveRaw}>Save raw input</Button><Button type="button" disabled={!content.trim()} onClick={() => { const rawInputId = saveRaw(); parseRawProcessInput(projectId, process.id, rawInputId); }}>Parse candidates</Button></div>
      </div>

      {review && <div className="space-y-3" aria-labelledby="candidate-review-title">
        <div><h3 id="candidate-review-title" className="text-lg font-semibold text-white">Candidate review</h3><p className="text-sm text-slate-400">Deterministic suggestions are never silently treated as confirmed facts.</p></div>
        {review.candidates.length === 0 ? <p className="text-sm text-slate-400">No candidates were detected.</p> : review.candidates.map((candidate) => <article key={candidate.id} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 md:grid-cols-[auto_minmax(0,1fr)_12rem]">
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={candidate.included} onChange={(event) => updateCandidate(candidate.id, { included: event.target.checked })} /> Include</label>
          <div className="space-y-2"><input aria-label={`Candidate ${candidate.order} name`} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" value={candidate.suggestedName} onChange={(event) => updateCandidate(candidate.id, { suggestedName: event.target.value })} /><p className="text-xs text-slate-500">Source line {candidate.provenance.rawLine ?? "unknown"}: {candidate.rawText}</p></div>
          <select aria-label={`Candidate ${candidate.order} type`} className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white" value={candidate.suggestedType} onChange={(event) => updateCandidate(candidate.id, { suggestedType: event.target.value as ProcessStepType, confirmedByUser: true })}>{STEP_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select>
        </article>)}
        <Button type="button" disabled={review.stale} onClick={() => normalizeProcess(projectId, process.id)}>Normalize selected candidates</Button>
      </div>}

      {process.steps.length > 0 && <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-semibold text-white">Structured flow</h3><p className="text-sm text-slate-400">Linear connections are additive and preserve explicit branches.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => connectLinearSteps(projectId, process.id)}>Connect linearly</Button><Button type="button" onClick={() => validateProcess(projectId, process.id)}>Validate process</Button></div></div>
        <ol className="space-y-2">{[...process.steps].sort((a, b) => a.orderHint - b.orderHint).map((step) => <li key={step.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-200"><span className="mr-2 text-slate-500">{step.orderHint}.</span><strong>{step.name}</strong><span className="ml-2 text-xs text-slate-500">{step.type.replaceAll("_", " ")} · {step.confirmedByUser ? "confirmed" : "unconfirmed"}</span></li>)}</ol>
      </div>}

      {(process.validation.validatedAt || process.validation.errors.length > 0 || process.validation.warnings.length > 0) && <div className="space-y-2" aria-live="polite"><h3 className="text-lg font-semibold text-white">Validation</h3><p className="text-sm text-slate-300">{process.validation.valid ? "No blocking structural errors." : `${process.validation.errors.length} blocking error(s).`} {process.validation.warnings.length} warning(s).</p>{[...process.validation.errors, ...process.validation.warnings].map((finding) => <p key={finding.id} className="rounded-lg border border-slate-800 p-2 text-sm text-slate-300"><strong>{finding.code}</strong>: {finding.message}</p>)}</div>}

      <div className="space-y-2"><h3 className="text-lg font-semibold text-white">Text flow</h3><pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">{flow}</pre></div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 truncate text-sm font-semibold text-white">{value.replaceAll("_", " ")}</div></div>; }
