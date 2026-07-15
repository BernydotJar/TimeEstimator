"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AssessmentAnswerState, AssessmentQuestion, EvidenceReference } from "@/domain/discovery";

interface Props {
  question: AssessmentQuestion;
  onAnswer: (state: AssessmentAnswerState, value?: unknown) => void;
  onNotes: (notes: string) => void;
  onAddEvidence: (evidence: EvidenceReference) => void;
  onRemoveEvidence: (id: string) => void;
}

export function AssessmentQuestionField({ question, onAnswer, onNotes, onAddEvidence, onRemoveEvidence }: Props) {
  const answer = question.answer;
  const state = answer?.state ?? "unanswered";
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceKind, setEvidenceKind] = useState<EvidenceReference["kind"]>("note");

  const setValue = (value: unknown) => onAnswer("answered", value);
  const inputClass = "mt-2 w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white";

  return (
    <fieldset className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
      <legend className="px-1 text-sm font-semibold text-white">
        {question.prompt}{question.requiredForCompletion ? " *" : ""}
      </legend>
      {question.helpText && <p className="mt-1 text-xs text-slate-400">{question.helpText}</p>}

      <div className="mt-3 flex flex-wrap gap-2" aria-label={`Answer state for ${question.prompt}`}>
        {(["answered", "unknown", "not_applicable", "unanswered"] as AssessmentAnswerState[]).map((item) => (
          <Button key={item} type="button" size="sm" variant={state === item ? "default" : "outline"} onClick={() => onAnswer(item, item === "answered" ? answer?.value : undefined)}>
            {item.replaceAll("_", " ")}
          </Button>
        ))}
      </div>

      {state === "answered" && (
        <div className="mt-3">
          {question.answerType === "long_text" ? (
            <textarea aria-label={question.prompt} className={inputClass} rows={4} value={String(answer?.value ?? "")} onChange={(event) => setValue(event.target.value)} />
          ) : question.answerType === "boolean" ? (
            <select aria-label={question.prompt} className={inputClass} value={String(answer?.value ?? "")} onChange={(event) => setValue(event.target.value === "true")}><option value="">Select…</option><option value="true">Yes</option><option value="false">No</option></select>
          ) : question.answerType === "single_select" ? (
            <select aria-label={question.prompt} className={inputClass} value={String(answer?.value ?? "")} onChange={(event) => setValue(event.target.value)}><option value="">Select…</option>{question.options?.map((option) => <option key={option}>{option}</option>)}</select>
          ) : question.answerType === "multi_select" ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">{question.options?.map((option) => { const selected = Array.isArray(answer?.value) && answer.value.includes(option); return <label key={option} className="flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" checked={selected} onChange={() => { const current = Array.isArray(answer?.value) ? answer.value as string[] : []; setValue(selected ? current.filter((item) => item !== option) : [...current, option]); }} />{option}</label>; })}</div>
          ) : (
            <input aria-label={question.prompt} className={inputClass} type={question.answerType === "number" ? "number" : question.answerType === "date" ? "date" : "text"} value={String(answer?.value ?? "")} onChange={(event) => setValue(question.answerType === "number" ? Number(event.target.value) : question.answerType === "entity_list" ? event.target.value.split(",").map((item) => item.trim()).filter(Boolean) : event.target.value)} />
          )}
        </div>
      )}

      <label className="mt-4 block text-xs font-medium text-slate-300">Notes
        <textarea className={inputClass} rows={2} value={answer?.notes ?? ""} onChange={(event) => onNotes(event.target.value)} />
      </label>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select aria-label="Evidence kind" className={inputClass} value={evidenceKind} onChange={(event) => setEvidenceKind(event.target.value as EvidenceReference["kind"])}>
            <option value="note">Note</option><option value="url">URL</option><option value="document_name">Document name</option><option value="workshop_statement">Workshop statement</option><option value="system_observation">System observation</option>
          </select>
          <input aria-label="Evidence label" className={inputClass} placeholder="Evidence label or locator" value={evidenceLabel} onChange={(event) => setEvidenceLabel(event.target.value)} />
          <Button type="button" variant="outline" disabled={!evidenceLabel.trim()} onClick={() => { const timestamp = new Date().toISOString(); onAddEvidence({ id: crypto.randomUUID(), kind: evidenceKind, label: evidenceLabel.trim(), locator: evidenceKind === "url" ? evidenceLabel.trim() : undefined, capturedAt: timestamp }); setEvidenceLabel(""); }}>Add evidence</Button>
        </div>
        {answer?.evidence.length ? <ul className="mt-3 space-y-2">{answer.evidence.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-300"><span>{item.kind.replaceAll("_", " ")}: {item.label}</span><button type="button" className="text-rose-300 underline" onClick={() => onRemoveEvidence(item.id)}>Remove</button></li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No evidence references yet.</p>}
      </div>
    </fieldset>
  );
}
