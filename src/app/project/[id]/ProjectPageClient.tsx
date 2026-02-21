"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/use-projects";
import { Activity, EstimateMetrics, OverheadKey } from "@/app/types";
import { ActivityForm } from "@/app/components/ActivityForm";
import { ActivityTable } from "@/app/components/ActivityTable";
import { EstimateOverview } from "@/app/components/EstimateOverview";
import { OverheadConfigDialog } from "@/app/components/OverheadConfigDialog";
import { ReportDialog } from "@/app/components/ReportDialog";

export default function ProjectPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    getProject,
    addActivity,
    removeActivity,
    cloneActivity,
    updateOverhead,
  } = useProjects();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const project = getProject(id);

  useEffect(() => {
    if (project === undefined) {
      const t = setTimeout(() => {
        if (!getProject(id)) router.push("/");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [project, id, getProject, router]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.classList.remove(prev);
      document.documentElement.classList.add(next);
      return next;
    });
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

  if (!project || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Projects
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <h1 className="flex-1 truncate text-sm font-semibold">{project.name}</h1>
          <div className="flex flex-shrink-0 items-center gap-2">
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
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <ActivityForm onAdd={handleAddActivity} />
        <ActivityTable
          activities={project.activities}
          onDelete={handleRemoveActivity}
          onClone={handleCloneActivity}
        />
        <EstimateOverview
          metrics={metrics}
          overheadPercentages={project.overheadPercentages}
        />
      </main>
    </div>
  );
}
