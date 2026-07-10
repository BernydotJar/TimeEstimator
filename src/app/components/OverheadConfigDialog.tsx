"use client";

import { useState } from "react";
import { Loader2, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_OVERHEAD, OverheadKey, OVERHEAD_LABELS } from "@/app/types";
import { getEstimateDefaults } from "@/ai/client/estimate-defaults";

const PRESETS: Record<string, Record<OverheadKey, number>> = {
  "Standard RPA": {
    contingency: 0.15,
    pm: 0.05,
    sa: 0.05,
    sdd: 0.05,
    releaseConfig: 0.025,
    userManual: 0.025,
  },
  "Complex Enterprise": {
    contingency: 0.2,
    pm: 0.08,
    sa: 0.08,
    sdd: 0.07,
    releaseConfig: 0.04,
    userManual: 0.03,
  },
  "Quick Pilot": {
    contingency: 0.1,
    pm: 0.03,
    sa: 0.03,
    sdd: 0.03,
    releaseConfig: 0.015,
    userManual: 0.01,
  },
};

interface OverheadConfigDialogProps {
  overheadPercentages: Record<OverheadKey, number>;
  onSave: (overhead: Record<OverheadKey, number>) => void;
  projectName: string;
}

export function OverheadConfigDialog({
  overheadPercentages,
  onSave,
  projectName,
}: OverheadConfigDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<Record<OverheadKey, number>>({
    ...overheadPercentages,
  });
  const [aiLoading, setAiLoading] = useState(false);

  const handleOpen = (v: boolean) => {
    if (v) setLocal({ ...overheadPercentages });
    setOpen(v);
  };

  const handleChange = (key: OverheadKey, value: string) => {
    const num = Math.max(0, Math.min(100, Number(value)));
    setLocal((prev) => ({ ...prev, [key]: num / 100 }));
  };

  const handlePreset = (presetName: string) => {
    setLocal({ ...PRESETS[presetName] });
    toast({ title: `Applied "${presetName}" preset` });
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_OVERHEAD });
    toast({ title: "Reset to defaults" });
  };

  const handleSmartDefaults = async () => {
    setAiLoading(true);
    try {
      const result = await getEstimateDefaults({
        projectType: projectName || "RPA Automation Project",
      });
      setLocal(result as Record<OverheadKey, number>);
      toast({
        title: "Smart defaults applied",
        description: `AI suggested overhead for "${projectName || "this project"}".`,
      });
    } catch {
      toast({
        title: "AI suggestion unavailable",
        description: "Configure n8n webhooks in AI Integrations or set GOOGLE_GENAI_API_KEY for local Genkit mode.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    onSave(local);
    setOpen(false);
    toast({ title: "Overhead configuration saved" });
  };

  const totalOverhead = Object.values(local).reduce((s, v) => s + v, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-1.5 h-3.5 w-3.5" />
          Overhead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Overhead Configuration</DialogTitle>
          <DialogDescription>
            Apply a preset or adjust percentages individually. AI can suggest
            values based on your project name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Presets + AI */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handlePreset(preset)}
              >
                {preset}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleSmartDefaults}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1 h-3.5 w-3.5 text-accessible-cyan" />
              )}
              AI Suggest
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

          {/* Percentage inputs */}
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.entries(local) as [OverheadKey, number][]).map(
              ([key, value]) => (
                <div key={key} className="grid gap-1.5">
                  <Label
                    htmlFor={`oh-${key}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {OVERHEAD_LABELS[key]} (%)
                  </Label>
                  <Input
                    type="number"
                    id={`oh-${key}`}
                    min={0}
                    max={100}
                    step={0.5}
                    value={(value * 100).toFixed(1)}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              ),
            )}
          </div>

          {/* Total indicator */}
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm">
              Total overhead:{" "}
              <span className="font-semibold text-accessible-cyan">
                {(totalOverhead * 100).toFixed(1)}%
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                (Grand Total = Base × {(1 + totalOverhead).toFixed(3)})
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
