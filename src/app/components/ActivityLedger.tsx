import { Activity, formatHours } from "./estimate-types";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLedgerProps {
  activities: Activity[];
  totalEffort: number;
}

const ActivityLedger = ({ activities, totalEffort }: ActivityLedgerProps) => {
  return (
    <section className="cinematic-panel" aria-labelledby="activity-ledger-title">
      <div className="panel-kicker">Audit trail</div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 id="activity-ledger-title" className="panel-title">Activity ledger</h2>
          <p className="panel-copy">
            Every captured activity remains visible for sizing review, assumptions validation, and handoff traceability.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">Current total</p>
          <p className="text-xl font-semibold text-cyan-100">{formatHours(totalEffort)}</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="empty-ledger">
          <p className="text-lg font-medium text-white">No activities captured yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Add the first activity from the intake panel to start building the estimate evidence trail.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="ledger-head">Application</TableHead>
                <TableHead className="ledger-head">Adapter</TableHead>
                <TableHead className="ledger-head">Activity</TableHead>
                <TableHead className="ledger-head">Type</TableHead>
                <TableHead className="ledger-head">Core/Supervised</TableHead>
                <TableHead className="ledger-head">Reused</TableHead>
                <TableHead className="ledger-head text-right">Effort</TableHead>
                <TableHead className="ledger-head">Exception</TableHead>
                <TableHead className="ledger-head">Assumption</TableHead>
                <TableHead className="ledger-head">RPA Tool</TableHead>
                <TableHead className="ledger-head">Surface</TableHead>
                <TableHead className="ledger-head">Detail</TableHead>
                <TableHead className="ledger-head">Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow className="border-white/10 hover:bg-cyan-300/5" key={`${activity.activityName}-${index}`}>
                  <TableCell className="ledger-cell font-medium text-white">{activity.applicationName || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.adapter || "—"}</TableCell>
                  <TableCell className="ledger-cell min-w-[180px]">{activity.activityName || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.activityType || "—"}</TableCell>
                  <TableCell className="ledger-cell capitalize">{activity.coreSupervised || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.reused ? "Yes" : "No"}</TableCell>
                  <TableCell className="ledger-cell text-right font-semibold text-cyan-100">{formatHours(Number(activity.effort) || 0)}</TableCell>
                  <TableCell className="ledger-cell">{activity.businessException || "—"}</TableCell>
                  <TableCell className="ledger-cell min-w-[220px]">{activity.assumption || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.rpaTool || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.applicationType || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.detailedActivityType || "—"}</TableCell>
                  <TableCell className="ledger-cell">{activity.exceptionHandlingComplexity || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="border-white/10 bg-cyan-300/10">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell className="ledger-cell text-right font-bold text-white" colSpan={6}>Total</TableCell>
                <TableCell className="ledger-cell text-right font-bold text-cyan-100">{formatHours(totalEffort)}</TableCell>
                <TableCell colSpan={6} />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </section>
  );
};

export default ActivityLedger;
