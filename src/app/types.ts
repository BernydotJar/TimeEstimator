export type OverheadKey =
  | "contingency"
  | "pm"
  | "sa"
  | "sdd"
  | "releaseConfig"
  | "userManual";

export const OVERHEAD_LABELS: Record<OverheadKey, string> = {
  contingency: "Contingency",
  pm: "Project Management",
  sa: "Solution Architect",
  sdd: "Solution Design & Documentation",
  releaseConfig: "Config & Release",
  userManual: "User Manual",
};

export const DEFAULT_OVERHEAD: Record<OverheadKey, number> = {
  contingency: 0.15,
  pm: 0.05,
  sa: 0.05,
  sdd: 0.05,
  releaseConfig: 0.025,
  userManual: 0.025,
};

export interface Activity {
  id: string;
  applicationName: string;
  adapter: string;
  activityName: string;
  activityType: string;
  coreSupervised: string;
  reused: boolean;
  effort: number;
  businessException: string;
  assumption: string;
  rpaTool: string;
  applicationType: string;
  detailedActivityType: string;
  exceptionHandlingComplexity: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
  overheadPercentages: Record<OverheadKey, number>;
}

export const DEFAULT_FORM_DATA: Omit<Activity, "id"> = {
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
};

export interface EstimateMetrics {
  totalEffort: number;
  coreEffort: number;
  supervisedEffort: number;
  effortByType: Record<string, number>;
  contingencyEffort: number;
  pmEffort: number;
  saEffort: number;
  sddEffort: number;
  releaseConfigEffort: number;
  userManualEffort: number;
  grandTotalEffort: number;
}
