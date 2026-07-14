import { BarChart3, Gauge, ShieldAlert, Workflow } from "lucide-react";
import { EstimateMetrics, formatHours } from "./estimate-types";

interface EstimateMetricsDeckProps {
  metrics: EstimateMetrics;
}

const metricCards = [
  {
    key: "grandTotalEffort",
    label: "Grand total",
    description: "Estimate including delivery overheads",
    icon: Gauge,
    tone: "primary",
  },
  {
    key: "coreEffort",
    label: "Core effort",
    description: "Hands-on automation build work",
    icon: Workflow,
    tone: "cyan",
  },
  {
    key: "supervisedEffort",
    label: "Supervised effort",
    description: "Work requiring active oversight",
    icon: BarChart3,
    tone: "slate",
  },
  {
    key: "supportEffort",
    label: "Delivery support",
    description: "PM, SA, docs, release and manuals",
    icon: ShieldAlert,
    tone: "amber",
  },
] as const;

const EstimateMetricsDeck = ({ metrics }: EstimateMetricsDeckProps) => {
  return (
    <section aria-label="Estimate metrics" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metricCards.map(({ key, label, description, icon: Icon, tone }) => (
        <article className={`metric-card metric-card-${tone}`} key={key}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {formatHours(metrics[key])}
              </p>
            </div>
            <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-400">{description}</p>
        </article>
      ))}
    </section>
  );
};

export default EstimateMetricsDeck;
