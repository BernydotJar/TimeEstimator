import { Activity, Download, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstimateMetrics, formatHours } from "./estimate-types";

interface CommandHeaderProps {
  activityCount: number;
  metrics: EstimateMetrics;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onExport: () => void;
}

const CommandHeader = ({
  activityCount,
  metrics,
  theme,
  onToggleTheme,
  onExport,
}: CommandHeaderProps) => {
  return (
    <header className="cinematic-panel cinematic-hero">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-cyan-200/80">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1">
            <Activity className="h-3.5 w-3.5" />
            RPA Estimation Console
          </span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-amber-100">
            SHIP Mode
          </span>
        </div>
        <div className="max-w-4xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
            TimeEstimator
          </h1>
          <p className="text-base leading-7 text-slate-300 md:text-lg">
            Cinematic RPA effort-estimation command center for discovery workshops,
            executive sizing reviews, and delivery handoffs.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/30 p-4 shadow-2xl shadow-cyan-950/30 md:min-w-[340px]">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Activities</p>
            <p className="mt-2 text-2xl font-semibold text-white">{activityCount}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Grand total</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-100">
              {formatHours(metrics.grandTotalEffort)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="cinematic-button flex-1" onClick={onExport} type="button">
            <Download className="h-4 w-4" />
            Export report
          </Button>
          <Button
            aria-label="Toggle theme"
            className="cinematic-button-secondary"
            onClick={onToggleTheme}
            type="button"
            variant="outline"
          >
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CommandHeader;
