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
import { AssessmentEntry } from "@/app/components/assessment/AssessmentEntry";
import { ProcessEntry } from "@/app/components/process/ProcessEntry";
import { ProposalEntry } from "@/app/components/proposals/ProposalEntry";
import { DocumentationEntry } from "@/app/components/documentation/DocumentationEntry";
import CinematicBackground from "@/app/components/CinematicBackground";
import RiskAssumptionPanel from "@/app/components/RiskAssumptionPanel";

export default function ProjectPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { toast } = useToast();
  const { hydrated, getProject, addActivity, removeActivity, cloneActivity, updateOverhead } = useProjects();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const project = hydrated ? getProject(id) : undefined;

  useEffect(() => {
    if (!hydrated) return;
    if (!id || !project) router.replace("/");
  }, [hydrated, id, project, router]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((current) => current === "dark" ? "light" : "dark"), []);
  const handleAddActivity = useCallback((activity: Activity) => {
    addActivity(id, activity);
    toast({ title: "Activity added", description: `"${activity.activityName || activity.applicationName}" added.` });
  }, [id, addActivity, toast]);
  const handleRemoveActivity = useCallback((activityId: string) => { removeActivity(id, activityId); toast({ title: "Activity removed" }); }, [id, removeActivity, toast]);
  const handleCloneActivity = useCallback((activityId: string) => { cloneActivity(id, activityId); toast({ title: "Activity cloned" }); }, [id, cloneActivity, toast]);
  const handleOverheadChange = useCallback((overhead: Record<OverheadKey, number>) => updateOverhead(id, overhead), [id, updateOverhead]);

  const metrics = useMemo((): EstimateMetrics | null => {
    if (!project) return null;
    const acts = project.activities;
    const totalEffort = acts.reduce((sum, activity) => sum + Number(activity.effort), 0);
    const coreEffort = acts.filter((activity) => activity.coreSupervised === "core").reduce((sum, activity) => sum + Number(activity.effort), 0);
    const supervisedEffort = acts.filter((activity) => activity.coreSupervised === "supervised").reduce((sum, activity) => sum + Number(activity.effort), 0);
    const effortByType: Record<string, number> = {};
    for (const activity of acts) if (activity.activityType) effortByType[activity.activityType] = (effortByType[activity.activityType] ?? 0) + Number(activity.effort);
    const overhead = project.overheadPercentages;
    const contingencyEffort = totalEffort * overhead.contingency;
    const pmEffort = totalEffort * overhead.pm;
    const saEffort = totalEffort * overhead.sa;
    const sddEffort = totalEffort * overhead.sdd;
    const releaseConfigEffort = totalEffort * overhead.releaseConfig;
    const userManualEffort = totalEffort * overhead.userManual;
    return { totalEffort, coreEffort, supervisedEffort, effortByType, contingencyEffort, pmEffort, saEffort, sddEffort, releaseConfigEffort, userManualEffort, grandTotalEffort: totalEffort + contingencyEffort + pmEffort + saEffort + sddEffort + releaseConfigEffort + userManualEffort };
  }, [project]);

  if (!hydrated || !project || !metrics) return <div className="cinematic-shell flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <main className="cinematic-shell">
      <Toaster />
      <CinematicBackground />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 lg:py-10">
        <header className="cinematic-panel flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="cinematic-button-secondary flex-shrink-0 px-2 sm:px-3" aria-label="Back to projects"><ArrowLeft className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Projects</span></Button>
          <Separator orientation="vertical" className="hidden h-8 sm:block" />
          <div className="min-w-0 flex-1"><div className="panel-kicker mb-1">Active estimation</div><h1 className="truncate text-xl font-semibold text-white">{project.name}</h1>{project.description && <p className="mt-1 truncate text-xs text-slate-400">{project.description}</p>}</div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <AiIntegrationDialog />
            <OverheadConfigDialog overheadPercentages={project.overheadPercentages} onSave={handleOverheadChange} projectName={project.name} />
            <ReportDialog project={project} />
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="cinematic-button-secondary">{theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
          </div>
        </header>

        <AssessmentEntry projectId={id} />
        <ProcessEntry projectId={id} />
        <ProposalEntry projectId={id} />
        <DocumentationEntry projectId={id} />
        <EstimateOverview metrics={metrics} overheadPercentages={project.overheadPercentages} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.65fr)]"><ActivityForm onAdd={handleAddActivity} /><RiskAssumptionPanel activities={project.activities} /></div>
        <ActivityTable activities={project.activities} onDelete={handleRemoveActivity} onClone={handleCloneActivity} />
      </div>
    </main>
  );
}
