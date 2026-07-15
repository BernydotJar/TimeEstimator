"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { Activity, DEFAULT_OVERHEAD, OverheadKey, Project } from "@/app/types";
import type {
  ParsedCandidateReviewState,
  ProcessDefinition,
  ProcessEdge,
  ProcessStep,
  ProjectAssessment,
  RawProcessInput,
} from "@/domain/discovery";
import {
  addProcessEdge as addEdgeToProcess,
  addProcessStep as addStepToProcess,
  connectLinearSteps as connectProcessLinearly,
  removeProcessEdge as removeEdgeFromProcess,
  removeProcessStep as removeStepFromProcess,
  updateProcessEdge as updateEdgeInProcess,
  updateProcessStep as updateStepInProcess,
} from "@/domain/discovery";
import { createEmptyDiscoveryState, migrateProjectDiscovery } from "@/persistence/project-migrations";
import { createProjectAssessment, readyProjectAssessment, replaceProjectAssessment, setProjectAssessmentActive } from "@/persistence/assessment-operations";
import {
  createProjectCurrentStateProcess,
  normalizeProjectProcess,
  parseProjectRawProcessInput,
  replaceProjectProcess,
  saveProjectRawProcessInput,
  setProjectActiveProcess,
  updateProjectCandidateReview,
  validateProjectProcess,
} from "@/persistence/process-operations";

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

  const createCurrentStateProcess = useCallback((projectId: string): string => {
    const processId = crypto.randomUUID();
    const timestamp = now();
    mutate(projectId, (project) => createProjectCurrentStateProcess(project, processId, timestamp).project);
    return processId;
  }, [mutate]);
  const setActiveProcess = useCallback((projectId: string, processId: string) => mutate(projectId, (project) => setProjectActiveProcess(project, processId, now())), [mutate]);
  const saveProcessDefinition = useCallback((projectId: string, process: ProcessDefinition) => mutate(projectId, (project) => replaceProjectProcess(project, process, now())), [mutate]);
  const saveRawProcessInput = useCallback((projectId: string, processId: string, input: RawProcessInput) => mutate(projectId, (project) => saveProjectRawProcessInput(project, processId, input, now())), [mutate]);
  const parseRawProcessInput = useCallback((projectId: string, processId: string, rawInputId: string) => mutate(projectId, (project) => parseProjectRawProcessInput(project, processId, rawInputId, now())), [mutate]);
  const saveCandidateReview = useCallback((projectId: string, processId: string, review: ParsedCandidateReviewState) => mutate(projectId, (project) => updateProjectCandidateReview(project, processId, review, now())), [mutate]);
  const normalizeProcess = useCallback((projectId: string, processId: string) => mutate(projectId, (project) => normalizeProjectProcess(project, processId, now())), [mutate]);
  const validateProcess = useCallback((projectId: string, processId: string) => mutate(projectId, (project) => validateProjectProcess(project, processId, now())), [mutate]);

  const addProcessStep = useCallback((projectId: string, processId: string, step: ProcessStep) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, addStepToProcess(process, step, now()), now()) : project;
  }), [mutate]);
  const updateProcessStep = useCallback((projectId: string, processId: string, stepId: string, updates: Partial<Omit<ProcessStep, "id" | "processId">>) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, updateStepInProcess(process, stepId, updates, now()), now()) : project;
  }), [mutate]);
  const removeProcessStep = useCallback((projectId: string, processId: string, stepId: string, cascade = false) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, removeStepFromProcess(process, stepId, now(), cascade).process, now()) : project;
  }), [mutate]);
  const addProcessEdge = useCallback((projectId: string, processId: string, edge: ProcessEdge) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, addEdgeToProcess(process, edge, now()).process, now()) : project;
  }), [mutate]);
  const updateProcessEdge = useCallback((projectId: string, processId: string, edgeId: string, updates: Partial<Omit<ProcessEdge, "id" | "processId">>) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, updateEdgeInProcess(process, edgeId, updates, now()).process, now()) : project;
  }), [mutate]);
  const removeProcessEdge = useCallback((projectId: string, processId: string, edgeId: string) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, removeEdgeFromProcess(process, edgeId, now()), now()) : project;
  }), [mutate]);
  const connectLinearSteps = useCallback((projectId: string, processId: string) => mutate(projectId, (project) => {
    const process = migrateProjectDiscovery(project).discovery?.processes.find((item) => item.id === processId);
    return process ? replaceProjectProcess(project, connectProcessLinearly(process, now()).process, now()) : project;
  }), [mutate]);

  return {
    projects,
    hydrated,
    createProject,
    updateProject,
    initializeDiscovery,
    deleteProject,
    getProject,
    addActivity,
    removeActivity,
    cloneActivity,
    updateOverhead,
    createAssessment,
    saveAssessment,
    setActiveAssessment,
    markAssessmentReadyForReview,
    createCurrentStateProcess,
    setActiveProcess,
    saveProcessDefinition,
    saveRawProcessInput,
    parseRawProcessInput,
    saveCandidateReview,
    normalizeProcess,
    validateProcess,
    addProcessStep,
    updateProcessStep,
    removeProcessStep,
    addProcessEdge,
    updateProcessEdge,
    removeProcessEdge,
    connectLinearSteps,
  };
}
