'use server';

/**
 * @fileOverview A flow to provide automated analysis of activity descriptions to suggest appropriate effort estimates.
 *
 * - analyzeEstimate - A function that suggests effort estimates based on activity descriptions.
 * - AnalyzeEstimateInput - The input type for the analyzeEstimate function.
 * - AnalyzeEstimateOutput - The return type for the analyzeEstimate function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeEstimateInputSchema = z.object({
  activityDescription: z
    .string()
    .describe('The description of the activity for which an effort estimate is needed.'),
});
export type AnalyzeEstimateInput = z.infer<typeof AnalyzeEstimateInputSchema>;

const AnalyzeEstimateOutputSchema = z.object({
  suggestedEffort: z
    .number()
    .describe('The suggested effort estimate in hours based on the activity description.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested effort estimate.'),
});
export type AnalyzeEstimateOutput = z.infer<typeof AnalyzeEstimateOutputSchema>;

export async function analyzeEstimate(
  input: AnalyzeEstimateInput
): Promise<AnalyzeEstimateOutput> {
  return analyzeEstimateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEstimatePrompt',
  input: {
    schema: z.object({
      activityDescription: z
        .string()
        .describe('The description of the activity for which an effort estimate is needed.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedEffort: z
        .number()
        .describe('The suggested effort estimate in hours based on the activity description.'),
      reasoning: z
        .string()
        .describe('The reasoning behind the suggested effort estimate.'),
    }),
  },
  prompt: `You are an AI assistant specialized in providing effort estimates for software development activities based on their description.

Given the activity description, provide a reasonable effort estimate in hours and explain your reasoning.

Activity Description: {{{activityDescription}}}`,
});

const analyzeEstimateFlow = ai.defineFlow<
  typeof AnalyzeEstimateInputSchema,
  typeof AnalyzeEstimateOutputSchema
>(
  {
    name: 'analyzeEstimateFlow',
    inputSchema: AnalyzeEstimateInputSchema,
    outputSchema: AnalyzeEstimateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
