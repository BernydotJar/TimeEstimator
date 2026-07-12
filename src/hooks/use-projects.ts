"use client";

import { useCallback } from "react";

import { useLocalStorage } from "./use-local-storage";
import { Activity, DEFAULT_OVERHEAD, OverheadKey, Project } from "@/app/types";

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>("te_projects", []);

  const createProject = useCallback(
    (name: string, description?: string): Project => {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        description: description ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [],
        overheadPercentages: { ...DEFAULT_OVERHEAD },
      };
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    },
    [setProjects],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Pick<Project, "name" | "description">>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
    },
    [setProjects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setProjects],
  );

  const getProject = useCallback(
    (id: string): Project | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects],
  );

  const addActivity = useCallback(
    (projectId: string, activity: Activity) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                activities: [...p.activities, activity],
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
    },
    [setProjects],
  );

  const removeActivity = useCallback(
    (projectId: string, activityId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                activities: p.activities.filter((a) => a.id !== activityId),
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
    },
    [setProjects],
  );

  const cloneActivity = useCallback(
    (projectId: string, activityId: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const activity = p.activities.find((a) => a.id === activityId);
          if (!activity) return p;
          const cloned: Activity = {
            ...activity,
            id: crypto.randomUUID(),
            activityName: `${activity.activityName} (copy)`,
          };
          return {
            ...p,
            activities: [...p.activities, cloned],
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [setProjects],
  );

  const updateOverhead = useCallback(
    (projectId: string, overhead: Record<OverheadKey, number>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                overheadPercentages: overhead,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
    },
    [setProjects],
  );

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    addActivity,
    removeActivity,
    cloneActivity,
    updateOverhead,
  };
}
