"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { addAssessmentEvidence, getAssessmentReadiness, removeAssessmentEvidence, updateAssessmentAnswer, updateAssessmentNotes, type AssessmentAnswerState, type EvidenceReference, type ProjectAssessment } from "@/domain/discovery";
import { AssessmentQuestionField } from "./AssessmentQuestionField";

interface Props {
  assessment: ProjectAssessment;
  onChange: (assessment: ProjectAssessment) => void;
  onReady: () => void;
  onClose: () => void;
}

export function AssessmentWorkspace({ assessment, onChange, onReady, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const section = assessment.sections[activeIndex] ?? assessment.sections[0];
  const readiness = useMemo(() => getAssessmentReadiness(assessment), [assessment]);
  const unknownCount = assessment.sections.flatMap((item) => item.questions).filter((question) => question.answer?.state === "unknown").length;
  const completedSections = assessment.sections.filter((item) => item.status === "complete").length;

  const applyAnswer = (questionId: string, state: AssessmentAnswerState, value?: unknown) => onChange(updateAssessmentAnswer(assessment, questionId, { state, value, confirmedByUser: true }, new Date().toISOString()));
  const applyNotes = (questionId: string, notes: string) => onChange(updateAssessmentNotes(assessment, questionId, notes, new Date().toISOString()));
  const addEvidence = (questionId: string, evidence: EvidenceReference) => onChange(addAssessmentEvidence(assessment, questionId, evidence, new Date().toISOString()));
  const removeEvidence = (questionId: string, evidenceId: string) => onChange(removeAssessmentEvidence(assessment, questionId, evidenceId, new Date().toISOString()));

  return (
    <section aria-labelledby="assessment-title" className="cinematic-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="panel-kicker">Structured discovery</div>
          <h2 id="assessment-title" className="mt-1 text-2xl font-semibold text-white">Project Assessment</h2>
          <p className="mt-1 text-sm text-slate-400">Save progressively. Unknown is explicit and never replaced with generated facts.</p>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>Back to estimation</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Assessment progress">
        <Metric label="Required completion" value={`${assessment.completeness.percent}%`} />
        <Metric label="Sections complete" value={`${completedSections}/${assessment.sections.length}`} />
        <Metric label="Unknown answers" value={String(unknownCount)} />
        <Metric label="High-impact unknowns" value={String(assessment.completeness.highImpactUnknownQuestionIds.length)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Assessment sections" className="hidden space-y-2 lg:block">
          {assessment.sections.map((item, index) => (
            <button key={item.id} type="button" aria-current={index === activeIndex ? "step" : undefined} onClick={() => setActiveIndex(index)} className={`w-full rounded-lg border px-3 py-3 text-left text-sm ${index === activeIndex ? "border-cyan-400 bg-cyan-400/10 text-white" : "border-slate-800 text-slate-300 hover:border-slate-600"}`}>
              <span className="block font-medium">{index + 1}. {item.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{item.status.replaceAll("_", " ")}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Button type="button" variant="outline" disabled={activeIndex === 0} onClick={() => setActiveIndex((value) => value - 1)}>Previous</Button>
            <span className="text-center text-sm text-slate-300">{activeIndex + 1} / {assessment.sections.length}</span>
            <Button type="button" variant="outline" disabled={activeIndex === assessment.sections.length - 1} onClick={() => setActiveIndex((value) => value + 1)}>Next</Button>
          </div>

          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Section {activeIndex + 1}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{section.title}</h3>
            <p className="mt-1 text-xs text-slate-500">Status: {section.status.replaceAll("_", " ")}</p>
          </header>

          <div className="space-y-4">
            {section.questions.map((question) => (
              <AssessmentQuestionField key={question.id} question={question} onAnswer={(state, value) => applyAnswer(question.id, state, value)} onNotes={(notes) => applyNotes(question.id, notes)} onAddEvidence={(evidence) => addEvidence(question.id, evidence)} onRemoveEvidence={(id) => removeEvidence(question.id, id)} />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div aria-live="polite" className="text-sm text-slate-300">
              {readiness.ready ? "All required questions are resolved." : `${readiness.missingQuestionIds.length} required unanswered; ${readiness.unknownQuestionIds.length} required unknown.`}
            </div>
            <Button type="button" disabled={!readiness.ready || assessment.status === "ready_for_review"} onClick={onReady}>
              {assessment.status === "ready_for_review" ? "Ready for review" : "Mark ready for review"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-semibold text-white">{value}</div></div>;
}
