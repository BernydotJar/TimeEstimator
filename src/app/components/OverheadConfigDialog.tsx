import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OverheadPercentages, overheadLabels } from "./estimate-types";

interface OverheadConfigDialogProps {
  overheadPercentages: OverheadPercentages;
  onOverheadChange: (event: React.ChangeEvent<HTMLInputElement>, key: keyof OverheadPercentages) => void;
}

const overheadKeys = Object.keys(overheadLabels) as Array<keyof OverheadPercentages>;

const OverheadConfigDialog = ({
  overheadPercentages,
  onOverheadChange,
}: OverheadConfigDialogProps) => {
  return (
    <section className="cinematic-panel" aria-labelledby="overhead-config-title">
      <div className="panel-kicker">Governed overheads</div>
      <h2 id="overhead-config-title" className="panel-title">Overhead configuration</h2>
      <p className="panel-copy mb-6">
        Tune delivery-support percentages while preserving the existing TimeEstimator formula model.
      </p>

      <div className="grid gap-4">
        {overheadKeys.map((key) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" key={key}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <Label className="cinematic-label" htmlFor={key}>{overheadLabels[key]}</Label>
              <span className="text-sm font-medium text-cyan-100">
                {(overheadPercentages[key] * 100).toFixed(1)}%
              </span>
            </div>
            <Input
              aria-label={`${overheadLabels[key]} percentage`}
              className="cinematic-input"
              id={key}
              min="0"
              name={key}
              onChange={(event) => onOverheadChange(event, key)}
              type="number"
              value={(overheadPercentages[key] * 100).toFixed(1)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverheadConfigDialog;
