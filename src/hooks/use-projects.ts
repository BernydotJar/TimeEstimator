"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { Activity, DEFAULT_OVERHEAD, OverheadKey, Project } from "@/app/types";
import type { ProjectAssessment } from "@/domain/discovery";
import { createEmptyDiscoveryState, migrateProjectDiscovery } from "@/persistence/project-migrations";
import { createProjectAssessment, readyProjectAssessment, replaceProjectAssessment, setProjectAssessmentActive } from "@/persistence/assessment-operations";

export function useProjects() {
  const [projects, setProjects, hydrated] = useLocalStorage<Project[]>("te_projects", []);
  const now = () => new Date().toISOString();
  const mutate = useCallback((id: string, fn: (project: Project) => Project) => {
    setProjects((prev) => prev.map((project) => project.id === id ? fn(project) : project));
  }, [setProjects]);

  const createProject = useCallback((name: string, description?: string): Project => {
    const timestamp = now();
    const project: Project = { id: crypto.randomUUID(), name, description: description ?? "", createdAt: timestamp, updatedAt: timestamp, activities: [], overheadPercentages: { ...DEFAULT_OVERHEAD }, discovery: createEmptyDiscoveryState() };
    setProjects((prev) => [...prev, project]);
    return project;
  }, [setProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Pick<Project, "name" | "description">>) => mutate(id, (project) => ({ ...migrateProjectDiscovery(project), ...updates, updatedAt: now() })), [mutate]);
  const initializeDiscovery = useCallback((id: string) => mutate(id, (project) => ({ ...migrateProjectDiscovery(project), updatedAt: now() })), [mutate]);
  const deleteProject = useCallback((id: string) => setProjects((prev) => prev.filter((project) => project.id !== id)), [setProjects]);
  const getProject = useCallback((id: string) => projects.find((project) => project.id === id), [projects]);

  const addActivity = useCallback((id: string, activity: Activity) => mutate(id, (project) => ({ ...migrateProjectDiscovery(project), activities: [...project.activities, activity], updatedAt: now() })), [mutate]);
  const removeActivity = useCallback((id: string, activityId: string) => mutate(id, (project) => ({ ...migrateProjectDiscovery(project), activities: project.activities.filter((activity) => activity.id !== activityId), updatedAt: now() })), [mutate]);
  const cloneActivity = useCallback((id: string, activityId: string) => mutate(id, (project) => {
    const activity = project.activities.find((item) => item.id === activityId);
    if (!activity) return project;
    const cloned = { ...activity, id: crypto.randomUUID(), activityName: `${activity.activityName} (copy)` };
    return { ...migrateProjectDiscovery(project), activities: [...project.activities, cloned], updatedAt: now() };
  }), [mutate]);
  const updateOverhead = useCallback((id: string, overhead: Record<OverheadKey, number>) => mutate(id, (project) => ({ ...migrateProjectDiscovery(project), overheadPercentages: overhead, updatedAt: now() })), [mutate]);

  const createAssessment = useCallback((projectId: string): string => {
    const assessmentId = crypto.randomUUID();
    const timestamp = now();
    mutate(projectId, (project) => createProjectAssessment(project, assessmentId, timestamp).project);
    return assessmentId;
  }, [mutate]);
  const saveAssessment = useCallback((projectId: string, assessment: ProjectAssessment) => mutate(projectId, (project) => replaceProjectAssessment(project, assessment, now())), [mutate]);
  const setActiveAssessment = useCallback((projectId: string, assessmentId: string) => mutate(projectId, (project) => setProjectAssessmentActive(project, assessmentId, now())), [mutate]);
  const markAssessmentReadyForReview = useCallback((projectId: string, assessmentId: string) => mutate(projectId, (project) => readyProjectAssessment(project, assessmentId, now())), [mutate]);

  return { projects, hydrated, createProject, updateProject, initializeDiscovery, deleteProject, getProject, addActivity, removeActivity, cloneActivity, updateOverhead, createAssessment, saveAssessment, setActiveAssessment, markAssessmentReadyForReview };
}
