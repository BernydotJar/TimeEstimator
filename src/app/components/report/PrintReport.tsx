import type { ReportViewModel } from "@/domain/reporting";

export function PrintReport({ model }: { model: ReportViewModel }) {
  return (
    <article className="print-report bg-white text-slate-950" aria-labelledby="print-report-title">
      <header className="print-keep border-b border-slate-300 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">TimeEstimator</p>
        <h1 id="print-report-title" className="mt-2 break-words text-3xl font-bold">{model.metadata.projectName}</h1>
        <p className="mt-2 text-sm text-slate-600">Complete effort report · {model.metadata.generatedDateLabel} · version {model.metadata.reportVersion}</p>
        {model.projectOverview.description ? <p className="mt-4 text-sm leading-6">{model.projectOverview.description}</p> : null}
      </header>

      <section className="print-section mt-6" aria-labelledby="report-summary-title">
        <h2 id="report-summary-title" className="text-xl font-bold">Estimate summary</h2>
        <div className="print-keep mt-4 grid grid-cols-4 gap-3">
          <Kpi label="Activities" value={String(model.summary.activityCount)} />
          <Kpi label="Base effort" value={`${model.summary.baseEffortHours.toFixed(2)} h`} />
          <Kpi label="Overhead" value={`${model.summary.overheadHours.toFixed(2)} h`} />
          <Kpi label="Grand total" value={`${model.summary.grandTotalHours.toFixed(2)} h`} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Core: {model.summary.coreHours.toFixed(2)} h · Supervised: {model.summary.supervisedHours.toFixed(2)} h
        </p>
      </section>

      <section className="print-section mt-7" aria-labelledby="scenario-title">
        <h2 id="scenario-title" className="text-xl font-bold">Scenarios and confidence</h2>
        {model.scenarios.available ? (
          <dl className="print-keep mt-3 grid grid-cols-3 gap-3">
            <Kpi label="Optimistic" value={formatOptional(model.scenarios.optimistic)} />
            <Kpi label="Expected" value={formatOptional(model.scenarios.expected)} />
            <Kpi label="Conservative" value={formatOptional(model.scenarios.conservative)} />
          </dl>
        ) : (
          <p className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm">Scenario calculation is not yet available; no range is asserted.</p>
        )}
        <p className="mt-3 text-sm">
          Confidence: {model.confidence.policyApproved ? `${model.confidence.band ?? "Unbanded"}${model.confidence.score == null ? "" : ` (${model.confidence.score.toFixed(0)}/100)`}` : "Policy pending approval"}.
        </p>
      </section>

      <section className="print-section mt-7" aria-labelledby="overhead-title">
        <h2 id="overhead-title" className="text-xl font-bold">Overhead breakdown</h2>
        <ReportTable headers={["Category", "Rate", "Hours"]} rows={model.overheads.map((item) => [item.label, `${(item.percentage * 100).toFixed(1)}%`, `${item.hours.toFixed(2)} h`])} />
      </section>

      <section className="print-section mt-7" aria-labelledby="distribution-title">
        <h2 id="distribution-title" className="text-xl font-bold">Effort distribution</h2>
        <ReportTable headers={["Activity type", "Hours"]} rows={model.effortDistribution.map((item) => [item.label, `${item.hours.toFixed(2)} h`])} />
      </section>

      <section className="print-page-break print-section mt-7" aria-labelledby="activity-title">
        <h2 id="activity-title" className="text-xl font-bold">Activity breakdown</h2>
        <ReportTable
          headers={["Activity", "System / application", "Type / model", "Hours", "Assumption"]}
          rows={model.activities.map((item) => [item.activityName, item.applicationName || "Unknown", `${item.activityType || "Unknown"} / ${item.coreSupervised || "Unknown"}`, `${item.effortHours.toFixed(2)} h`, item.assumption || "—"])}
        />
      </section>

      <section className="print-page-break print-section mt-7" aria-labelledby="risk-title">
        <h2 id="risk-title" className="text-xl font-bold">Risks, assumptions, and exclusions</h2>
        <ListSection title="Risks and unknowns" values={model.risks} />
        <ListSection title="Assumptions" values={model.assumptions} />
        <ListSection title="Exclusions" values={model.exclusions} />
      </section>

      <section className="print-section mt-7" aria-labelledby="integration-title">
        <h2 id="integration-title" className="text-xl font-bold">Integration inventory</h2>
        {model.integrations.length ? <ReportTable headers={["System", "Kind", "Access"]} rows={model.integrations.map((item) => [item.name, item.kind, item.access])} /> : <p className="mt-3 text-sm text-slate-600">No integration inventory is available.</p>}
      </section>

      <section className="print-page-break print-section mt-7" aria-labelledby="trace-title">
        <h2 id="trace-title" className="text-xl font-bold">Traceability and audit metadata</h2>
        <dl className="mt-3 grid grid-cols-[180px_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-semibold">Project ID</dt><dd className="break-all">{model.metadata.projectId}</dd>
          <dt className="font-semibold">Report version</dt><dd>{model.metadata.reportVersion}</dd>
          <dt className="font-semibold">View-model version</dt><dd>{model.metadata.viewModelVersion}</dd>
          <dt className="font-semibold">Generated at</dt><dd>{model.metadata.generatedAt}</dd>
          <dt className="font-semibold">Estimate draft</dt><dd>{model.metadata.estimateDraftId ?? "Not selected"}</dd>
          <dt className="font-semibold">Documentation version</dt><dd>{model.metadata.artifactVersion ?? "Not selected"}</dd>
          <dt className="font-semibold">Source references</dt><dd>{model.traceability.length}</dd>
        </dl>
      </section>
    </article>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-slate-300 p-3"><p className="text-xs text-slate-600">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

function ReportTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-3">
      <table className="report-table w-full border-collapse text-left text-xs">
        <thead><tr>{headers.map((header) => <th key={header} className="border border-slate-300 bg-slate-100 p-2 font-semibold">{header}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((row, index) => <tr key={`${index}-${row[0]}`}>{row.map((value, cell) => <td key={`${cell}-${value}`} className="border border-slate-300 p-2 align-top break-words">{value}</td>)}</tr>) : <tr><td colSpan={headers.length} className="border border-slate-300 p-3 text-slate-500">No data available.</td></tr>}</tbody>
      </table>
    </div>
  );
}

function ListSection({ title, values }: { title: string; values: string[] }) {
  return <section className="mt-5 print-section"><h3 className="font-semibold">{title}</h3>{values.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">None recorded.</p>}</section>;
}

function formatOptional(value?: number) { return value == null ? "—" : `${value.toFixed(2)} h`; }
