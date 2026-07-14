"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ActivityIntakePanel from "./components/ActivityIntakePanel";
import ActivityLedger from "./components/ActivityLedger";
import CinematicBackground from "./components/CinematicBackground";
import CommandHeader from "./components/CommandHeader";
import EstimateMetricsDeck from "./components/EstimateMetricsDeck";
import OverheadConfigDialog from "./components/OverheadConfigDialog";
import ReportPanel from "./components/ReportPanel";
import RiskAssumptionPanel from "./components/RiskAssumptionPanel";
import { Activity, EstimateMetrics, OverheadPercentages } from "./components/estimate-types";

const createEmptyActivity = (): Activity => ({
  applicationName: "",
  adapter: "",
  activityName: "",
  activityType: "",
  coreSupervised: "",
  reused: false,
  effort: 0,
  businessException: "",
  assumption: "",
  rpaTool: "",
  applicationType: "",
  detailedActivityType: "",
  exceptionHandlingComplexity: "",
});

const defaultOverheads: OverheadPercentages = {
  contingency: 0.15,
  pm: 0.05,
  sa: 0.05,
  sdd: 0.05,
  releaseConfig: 0.025,
  userManual: 0.025,
};

const calculateMetrics = (
  activities: Activity[],
  overheadPercentages: OverheadPercentages,
): EstimateMetrics => {
  let totalEffort = 0;
  let coreEffort = 0;
  let supervisedEffort = 0;
  const effortByActivityType: Record<string, number> = {};

  activities.forEach((activity) => {
    const activityEffort = Number(activity.effort) || 0;
    totalEffort += activityEffort;

    if (activity.coreSupervised === "core") {
      coreEffort += activityEffort;
    } else if (activity.coreSupervised === "supervised") {
      supervisedEffort += activityEffort;
    }

    if (activity.activityType) {
      effortByActivityType[activity.activityType] =
        (effortByActivityType[activity.activityType] || 0) + activityEffort;
    }
  });

  const contingencyEffort = totalEffort * overheadPercentages.contingency;
  const pmEffort = totalEffort * overheadPercentages.pm;
  const saEffort = totalEffort * overheadPercentages.sa;
  const sddEffort = totalEffort * overheadPercentages.sdd;
  const releaseConfigEffort = totalEffort * overheadPercentages.releaseConfig;
  const userManualEffort = totalEffort * overheadPercentages.userManual;
  const supportEffort = pmEffort + saEffort + sddEffort + releaseConfigEffort + userManualEffort;
  const grandTotalEffort = totalEffort + contingencyEffort + supportEffort;

  return {
    totalEffort,
    coreEffort,
    supervisedEffort,
    contingencyEffort,
    pmEffort,
    saEffort,
    sddEffort,
    releaseConfigEffort,
    userManualEffort,
    supportEffort,
    grandTotalEffort,
    effortByActivityType,
  };
};

const Home: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<Activity>(() => createEmptyActivity());
  const [overheadPercentages, setOverheadPercentages] = useState<OverheadPercentages>(defaultOverheads);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [ariaMessage, setAriaMessage] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const metrics = useMemo(
    () => calculateMetrics(activities, overheadPercentages),
    [activities, overheadPercentages],
  );

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

    setFormData((current) => ({
      ...current,
      [name]: name === "effort" ? Number(value) : type === "checkbox" ? checked : value,
    }));
  };

  const addActivity = () => {
    setActivities((current) => [...current, formData]);
    setFormData(createEmptyActivity());
    setAriaMessage("Activity added to the estimate ledger.");

    toast({
      title: "Activity added",
      description: "The estimate ledger has been updated.",
    });
  };

  const handleOverheadChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof OverheadPercentages,
  ) => {
    const parsedValue = Math.max(0, Math.min(100, Number(event.target.value)));
    setOverheadPercentages((current) => ({
      ...current,
      [key]: parsedValue / 100,
    }));
  };

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const handleSaveEstimate = async () => {
    setAriaMessage("Saving estimate report. Please wait.");

    if (!reportRef.current) {
      toast({
        title: "Error",
        description: "Could not find estimate report to save.",
        variant: "destructive",
      });
      setAriaMessage("Failed to save estimate report.");
      return;
    }

    reportRef.current.setAttribute("aria-busy", "true");

    try {
      const metadataEl = document.createElement("div");
      const timestamp = new Date().toISOString();
      metadataEl.setAttribute("data-qa-metadata", "true");
      metadataEl.style.fontSize = "10px";
      metadataEl.style.color = "#334155";
      metadataEl.style.opacity = "0.8";
      metadataEl.style.marginTop = "8px";
      metadataEl.innerText = `Generated: ${timestamp} — Source: TimeEstimator`;
      reportRef.current.appendChild(metadataEl);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const dataURL = canvas.toDataURL("image/png");
      saveAs(dataURL, "estimate_report.png");

      const meta = {
        generatedAt: timestamp,
        source: "TimeEstimator",
        activities: activities.length,
        grandTotalEffort: Number(metrics.grandTotalEffort.toFixed(2)),
      };
      const blob = new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" });
      saveAs(blob, "estimate_report_metadata.json");

      reportRef.current.querySelector("[data-qa-metadata]")?.remove();

      toast({
        title: "Estimate report saved",
        description: "The PNG report and metadata file were generated.",
      });
      setAriaMessage("Estimate report saved successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown export error";
      toast({
        title: "Error",
        description: `Failed to save estimate report: ${message}`,
        variant: "destructive",
      });
      setAriaMessage("Failed to save estimate report.");
    } finally {
      reportRef.current?.removeAttribute("aria-busy");
    }
  };

  return (
    <main className="cinematic-shell" data-testid="home-page">
      <Toaster />
      <CinematicBackground />
      <div aria-live="polite" className="sr-only" role="status">
        {ariaMessage}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 lg:py-10">
        <CommandHeader
          activityCount={activities.length}
          metrics={metrics}
          onExport={handleSaveEstimate}
          onToggleTheme={toggleTheme}
          theme={theme}
        />

        <EstimateMetricsDeck metrics={metrics} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
          <ActivityIntakePanel
            formData={formData}
            onAddActivity={addActivity}
            onInputChange={handleInputChange}
            onReusedChange={(checked) => setFormData((current) => ({ ...current, reused: checked }))}
          />

          <div className="grid gap-6">
            <RiskAssumptionPanel activities={activities} />
            <OverheadConfigDialog
              overheadPercentages={overheadPercentages}
              onOverheadChange={handleOverheadChange}
            />
          </div>
        </div>

        <ActivityLedger activities={activities} totalEffort={metrics.totalEffort} />

        <ReportPanel
          metrics={metrics}
          onSave={handleSaveEstimate}
          overheadPercentages={overheadPercentages}
          reportRef={reportRef}
        />
      </div>
    </main>
  );
};

export default Home;
