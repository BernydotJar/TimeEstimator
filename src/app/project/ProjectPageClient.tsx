"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/use-projects";
import { Activity, EstimateMetrics, OverheadKey } from "@/app/types";
import { ActivityForm } from "@/app/components/ActivityForm";
import { ActivityTable } from "@/app/components/ActivityTable";
import { AiIntegrationDialog } from "@/app/components/AiIntegrationDialog";
import { EstimateOverview } from "@/app/components/EstimateOverview";
import { OverheadConfigDialog } from "@/app/components/OverheadConfigDialog";
import { ReportDialog } from "@/app/components/ReportDialog";
import CinematicBackground from "@/app/components/CinematicBackground";
import RiskAssumptionPanel from "@/app/components/RiskAssumptionPanel";

export default function ProjectPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { toast } = useToast();
  const {
    hydrated,
    getProject,
    addActivity,
    removeActivity,
    cloneActivity,
    updateOverhead,
  } = useProjects();

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const project = hydrated ? getProject(id) : undefined;

  useEffect(() => {
    if (!hydrated) return;
    if (!id || !project) {
      router.replace("/");
    }
  }, [hydrated, id, project, router]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const handleAddActivity = useCallback(
    (activity: Activity) => {
      addActivity(id, activity);
      toast({
        title: "Activity added",
        description: `"${activity.activityName || activity.applicationName}" added.`,
      });
    },
    [id, addActivity, toast],
  );

  const handleRemoveActivity = useCallback(
    (activityId: string) => {
      removeActivity(id, activityId);
      toast({ title: "Activity removed" });
    },
    [id, removeActivity, toast],
  );

  const handleCloneActivity = useCallback(
    (activityId: string) => {
      cloneActivity(id, activityId);
      toast({ title: "Activity cloned" });
    },
    [id, cloneActivity, toast],
  );

  const handleOverheadChange = useCallback(
    (overhead: Record<OverheadKey, number>) => {
      updateOverhead(id, overhead);
    },
    [id, updateOverhead],
  );

  const metrics = useMemo((): EstimateMetrics | null => {
    if (!project) return null;
    const acts = project.activities;
    const totalEffort = acts.reduce((s, a) => s + Number(a.effort), 0);
    const coreEffort = acts
      .filter((a) => a.coreSupervised === "core")
      .reduce((s, a) => s + Number(a.effort), 0);
    const supervisedEffort = acts
      .filter((a) => a.coreSupervised === "supervised")
      .reduce((s, a) => s + Number(a.effort), 0);

    const effortByType: Record<string, number> = {};
    for (const a of acts) {
      if (a.activityType) {
        effortByType[a.activityType] =
          (effortByType[a.activityType] ?? 0) + Number(a.effort);
      }
    }

    const o = project.overheadPercentages;
    const contingencyEffort = totalEffort * o.contingency;
    const pmEffort = totalEffort * o.pm;
    const saEffort = totalEffort * o.sa;
    const sddEffort = totalEffort * o.sdd;
    const releaseConfigEffort = totalEffort * o.releaseConfig;
    const userManualEffort = totalEffort * o.userManual;
    const grandTotalEffort =
      totalEffort +
      contingencyEffort +
      pmEffort +
      saEffort +
      sddEffort +
      releaseConfigEffort +
      userManualEffort;

    return {
      totalEffort,
      coreEffort,
      supervisedEffort,
      effortByType,
      contingencyEffort,
      pmEffort,
      saEffort,
      sddEffort,
      releaseConfigEffort,
      userManualEffort,
      grandTotalEffort,
    };
  }, [project]);

  if (!hydrated || !project || !metrics) {
    return (
      <div className="cinematic-shell flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <main className="cinematic-shell">
      <Toaster />
      <CinematicBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 lg:py-10">
        <header className="cinematic-panel flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="cinematic-button-secondary flex-shrink-0 px-2 sm:px-3"
            aria-label="Back to projects"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Projects</span>
          </Button>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="min-w-0 flex-1">
            <div className="panel-kicker mb-1">Active estimation</div>
            <h1 className="truncate text-xl font-semibold text-white">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-1 truncate text-xs text-slate-400">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <AiIntegrationDialog />
            <OverheadConfigDialog
              overheadPercentages={project.overheadPercentages}
              onSave={handleOverheadChange}
              projectName={project.name}
            />
            <ReportDialog
              projectName={project.name}
              activities={project.activities}
              overheadPercentages={project.overheadPercentages}
              metrics={metrics}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="cinematic-button-secondary"
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        <EstimateOverview
          metrics={metrics}
          overheadPercentages={project.overheadPercentages}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.65fr)]">
          <ActivityForm onAdd={handleAddActivity} />
          <RiskAssumptionPanel activities={project.activities} />
        </div>

        <ActivityTable
          activities={project.activities}
          onDelete={handleRemoveActivity}
          onClone={handleCloneActivity}
        />
      </div>
    </main>
  );
}
