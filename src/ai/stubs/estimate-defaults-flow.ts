export interface EstimateDefaultsInput {
  projectType: string;
}

export interface EstimateDefaultsOutput {
  contingency: number;
  pm: number;
  sa: number;
  sdd: number;
  releaseConfig: number;
  userManual: number;
}

export async function getEstimateDefaults(
  _input: EstimateDefaultsInput,
): Promise<EstimateDefaultsOutput> {
  return {
    contingency: 0.15,
    pm: 0.05,
    sa: 0.05,
    sdd: 0.05,
    releaseConfig: 0.025,
    userManual: 0.025,
  };
}
