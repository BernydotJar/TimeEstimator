'use server';

/**
 * @fileOverview A flow to provide intelligent defaults for overhead percentages based on project type.
 *
 * - getEstimateDefaults - A function that returns estimate defaults based on project type.
 * - EstimateDefaultsInput - The input type for the getEstimateDefaults function.
 * - EstimateDefaultsOutput - The return type for the getEstimateDefaults function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const EstimateDefaultsInputSchema = z.object({
  projectType: z
    .string()
    .describe('The type of project, e.g., "Mobile App Development", "Web Application", "Data Migration".'),
});
export type EstimateDefaultsInput = z.infer<typeof EstimateDefaultsInputSchema>;

const EstimateDefaultsOutputSchema = z.object({
  contingency: z.number().describe('The contingency percentage, e.g., 0.15 for 15%.'),
  pm: z.number().describe('The project management percentage, e.g., 0.05 for 5%.'),
  sa: z.number().describe('The solution architect percentage, e.g., 0.05 for 5%.'),
  sdd: z.number().describe('The SDD percentage, e.g., 0.05 for 5%.'),
  releaseConfig: z
    .number()
    .describe('The release and configuration guide percentage, e.g., 0.025 for 2.5%.'),
  userManual: z.number().describe('The user manual percentage, e.g., 0.025 for 2.5%.'),
});
export type EstimateDefaultsOutput = z.infer<typeof EstimateDefaultsOutputSchema>;

export async function getEstimateDefaults(
  input: EstimateDefaultsInput
): Promise<EstimateDefaultsOutput> {
  return estimateDefaultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateDefaultsPrompt',
  input: {
    schema: z.object({
      projectType: z
        .string()
        .describe('The type of project, e.g., "Mobile App Development", "Web Application", "Data Migration".'),
    }),
  },
  output: {
    schema: z.object({
      contingency: z.number().describe('The contingency percentage, e.g., 0.15 for 15%.'),
      pm: z.number().describe('The project management percentage, e.g., 0.05 for 5%.'),
      sa: z.number().describe('The solution architect percentage, e.g., 0.05 for 5%.'),
      sdd: z.number().describe('The SDD percentage, e.g., 0.05 for 5%.'),
      releaseConfig: z
        .number()
        .describe('The release and configuration guide percentage, e.g., 0.025 for 2.5%.'),
      userManual: z.number().describe('The user manual percentage, e.g., 0.025 for 2.5%.'),
    }),
  },
  prompt: `You are an AI assistant specialized in providing reasonable default overhead percentages for effort estimates based on the project type.

Given the project type, provide reasonable default percentages for contingency, project management, solution architect, SDD, release configuration, and user manual efforts.

Return the percentages as decimals (e.g., 0.15 for 15%).

Project Type: {{{projectType}}}`,
});

const estimateDefaultsFlow = ai.defineFlow<
  typeof EstimateDefaultsInputSchema,
  typeof EstimateDefaultsOutputSchema
>(
  {
    name: 'estimateDefaultsFlow',
    inputSchema: EstimateDefaultsInputSchema,
    outputSchema: EstimateDefaultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
