export interface Activity {
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

export interface OverheadPercentages {
  contingency: number;
  pm: number;
  sa: number;
  sdd: number;
  releaseConfig: number;
  userManual: number;
}

export interface EstimateMetrics {
  totalEffort: number;
  coreEffort: number;
  supervisedEffort: number;
  contingencyEffort: number;
  pmEffort: number;
  saEffort: number;
  sddEffort: number;
  releaseConfigEffort: number;
  userManualEffort: number;
  supportEffort: number;
  grandTotalEffort: number;
  effortByActivityType: Record<string, number>;
}

export const overheadLabels: Record<keyof OverheadPercentages, string> = {
  contingency: "Contingency",
  pm: "Project Management",
  sa: "Solution Architect",
  sdd: "SDD",
  releaseConfig: "Release and Configuration Guide",
  userManual: "User Manual",
};

export const formatHours = (value: number) => `${value.toFixed(2)} h`;
