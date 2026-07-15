"use client";

import { useCallback } from "react";

import { useLocalStorage } from "./use-local-storage";
import { Activity, DEFAULT_OVERHEAD, OverheadKey, Project } from "@/app/types";
import {
  createEmptyDiscoveryState,
  migrateProjectDiscovery,
} from "@/persistence/project-migrations";

export function useProjects() {
  const [projects, setProjects, hydrated] = useLocalStorage<Project[]>(
    "te_projects",
    [],
  );

  const createProject = useCallback(
    (name: string, description?: string): Project => {
      const now = new Date().toISOString();
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        description: description ?? "",
        createdAt: now,
        updatedAt: now,
        activities: [],
        overheadPercentages: { ...DEFAULT_OVERHEAD },
        discovery: createEmptyDiscoveryState(),
      };
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    },
    [setProjects],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Pick<Project, "name" | "description">>) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? {
                ...migrateProjectDiscovery(project),
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      );
    },
    [setProjects],
  );

  const initializeDiscovery = useCallback(
    (projectId: string) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...migrateProjectDiscovery(project),
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      );
    },
    [setProjects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((project) => project.id !== id));
    },
    [setProjects],
  );

  const getProject = useCallback(
    (id: string): Project | undefined => projects.find((project) => project.id === id),
    [projects],
  );

  const addActivity = useCallback(
    (projectId: string, activity: Activity) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...migrateProjectDiscovery(project),
                activities: [...project.activities, activity],
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      );
    },
    [setProjects],
  );

  const removeActivity = useCallback(
    (projectId: string, activityId: string) => {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...migrateProjectDiscovery(project),
                activities: project.activities.filter(
                  (activity) => activity.id !== activityId,
                ),
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      );
    },
    [setProjects],
  );

  const cloneActivity = useCallback(
    (projectId: string, activityId: string) => {
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          const activity = project.activities.find((item) => item.id === activityId);
          if (!activity) return project;
          const cloned: Activity = {
            ...activity,
            id: crypto.randomUUID(),
            activityName: `${activity.activityName} (copy)`,
          };
          return {
            ...migrateProjectDiscovery(project),
            activities: [...project.activities, cloned],
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
        prev.map((project) =>
          project.id === projectId
            ? {
                ...migrateProjectDiscovery(project),
                overheadPercentages: overhead,
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      );
    },
    [setProjects],
  );

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
  };
}
