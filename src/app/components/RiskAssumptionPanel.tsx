import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Activity } from "./estimate-types";

interface RiskAssumptionPanelProps {
  activities: Activity[];
}

const RiskAssumptionPanel = ({ activities }: RiskAssumptionPanelProps) => {
  const assumptions = activities.filter((activity) => activity.assumption.trim().length > 0);
  const complexItems = activities.filter(
    (activity) => activity.exceptionHandlingComplexity === "Complex" || activity.businessException === "Technical",
  );

  return (
    <section className="cinematic-panel" aria-labelledby="risk-assumption-title">
      <div className="panel-kicker">Delivery signal</div>
      <h2 id="risk-assumption-title" className="panel-title">Risk and assumptions</h2>
      <p className="panel-copy mb-6">
        Surface the delivery caveats that usually get buried in spreadsheet notes.
      </p>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-amber-200" />
            <div>
              <p className="font-semibold text-amber-100">Watchlist</p>
              <p className="mt-1 text-sm leading-6 text-amber-50/75">
                {complexItems.length === 0
                  ? "No complex or technical exception items captured yet."
                  : `${complexItems.length} activity item(s) include complex handling or technical exception signals.`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-cyan-100" />
            <div>
              <p className="font-semibold text-cyan-100">Assumption register</p>
              {assumptions.length === 0 ? (
                <p className="mt-1 text-sm leading-6 text-cyan-50/75">
                  No assumptions captured. Add assumptions during intake to make the estimate auditable.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm leading-6 text-cyan-50/80">
                  {assumptions.slice(0, 5).map((activity, index) => (
                    <li className="rounded-2xl border border-white/10 bg-black/20 p-3" key={`${activity.activityName}-${index}`}>
                      <span className="font-medium text-white">{activity.activityName || "Activity"}:</span>{" "}
                      {activity.assumption}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskAssumptionPanel;
