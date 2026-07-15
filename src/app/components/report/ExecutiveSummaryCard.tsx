import type { ReportViewModel } from "@/domain/reporting";

export const EXECUTIVE_SUMMARY_LOGICAL_WIDTH = 960;
export const EXECUTIVE_SUMMARY_MAX_HEIGHT = 1200;

export function ExecutiveSummaryCard({ model }: { model: ReportViewModel }) {
  const topDrivers = model.majorDrivers.slice(0, 5);
  const topRisks = model.risks.slice(0, 5);
  const extraDrivers = Math.max(0, model.majorDrivers.length - topDrivers.length);
  const extraRisks = Math.max(0, model.risks.length - topRisks.length);
  const maxDistribution = Math.max(1, ...model.effortDistribution.map((item) => item.hours));

  return (
    <article
      data-export-root="executive-summary"
      className="report-export-surface overflow-hidden bg-white text-slate-950"
      style={{ width: EXECUTIVE_SUMMARY_LOGICAL_WIDTH, maxHeight: EXECUTIVE_SUMMARY_MAX_HEIGHT }}
      aria-label={`Executive estimate summary for ${model.metadata.projectName}`}
    >
      <header className="border-b border-slate-200 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">TimeEstimator</p>
        <h1 className="mt-2 break-words text-4xl font-bold">{model.metadata.projectName}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Executive estimate · {model.metadata.generatedDateLabel} · v{model.metadata.reportVersion}
        </p>
      </header>

      <div className="grid grid-cols-4 gap-3 p-8">
        <Metric label="Activities" value={String(model.summary.activityCount)} />
        <Metric label="Base effort" value={`${model.summary.baseEffortHours.toFixed(1)}h`} />
        <Metric label="Overhead" value={`${model.summary.overheadHours.toFixed(1)}h`} />
        <Metric label="Grand total" value={`${model.summary.grandTotalHours.toFixed(1)}h`} accent />
      </div>

      <div className="grid grid-cols-2 gap-6 px-8 pb-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Scenarios</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Metric label="Optimistic" value={formatOptional(model.scenarios.optimistic)} compact />
            <Metric label="Expected" value={formatOptional(model.scenarios.expected)} compact />
            <Metric label="Conservative" value={formatOptional(model.scenarios.conservative)} compact />
          </div>
          {!model.scenarios.available ? (
            <p className="mt-2 text-xs text-amber-700">Scenario policy is not yet available; no range is asserted.</p>
          ) : null}
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Evidence confidence</h2>
          <div className="mt-3 rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-bold">{model.confidence.band ?? "Pending"}</p>
            <p className="text-sm text-slate-600">
              {model.confidence.policyApproved && model.confidence.score != null
                ? `${model.confidence.score.toFixed(0)} / 100`
                : "Confidence policy pending approval"}
            </p>
          </div>
        </section>
      </div>

      <section className="px-8 pb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Effort distribution</h2>
        <div className="mt-3 space-y-2" role="img" aria-label="Effort distribution by activity type">
          {model.effortDistribution.slice(0, 7).map((item) => (
            <div key={item.label} className="grid grid-cols-[160px_1fr_70px] items-center gap-3 text-sm">
              <span className="truncate">{item.label}</span>
              <span className="h-3 rounded-full bg-slate-100">
                <span className="block h-3 rounded-full bg-cyan-600" style={{ width: `${Math.max(2, (item.hours / maxDistribution) * 100)}%` }} />
              </span>
              <span className="text-right font-semibold">{item.hours.toFixed(1)}h</span>
            </div>
          ))}
          {model.effortDistribution.length === 0 ? <p className="text-sm text-slate-500">No effort distribution available.</p> : null}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-6 px-8 pb-8">
        <BoundedList title="Major drivers" items={topDrivers} extra={extraDrivers} />
        <BoundedList title="Risks and unknowns" items={topRisks} extra={extraRisks} />
      </div>

      <footer className="flex justify-between border-t border-slate-200 px-8 py-5 text-xs text-slate-500">
        <span>{model.assumptions.length} assumptions · {model.exclusions.length} exclusions</span>
        <span>Report model {model.metadata.viewModelVersion}</span>
      </footer>
    </article>
  );
}

function Metric({ label, value, accent = false, compact = false }: { label: string; value: string; accent?: boolean; compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 ${compact ? "p-3" : "p-4"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`${compact ? "text-lg" : "text-2xl"} mt-1 font-bold ${accent ? "text-cyan-700" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function BoundedList({ title, items, extra }: { title: string; items: string[]; extra: number }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {items.length ? items.map((item) => <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">{item}</li>) : <li className="text-slate-500">None recorded.</li>}
      </ul>
      {extra > 0 ? <p className="mt-2 text-xs font-semibold text-slate-500">+{extra} more</p> : null}
    </section>
  );
}

function formatOptional(value?: number) {
  return value == null ? "—" : `${value.toFixed(1)}h`;
}
