'use server';

/**
 * @fileOverview A flow to provide summarization of activities for reporting purposes.
 *
 * - summarizeActivities - A function that summarizes a list of activities.
 * - SummarizeActivitiesInput - The input type for the summarizeActivities function.
 * - SummarizeActivitiesOutput - The return type for the summarizeActivities function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeActivitiesInputSchema = z.object({
  activities: z
    .string()
    .describe('A JSON string representing an array of activities with properties like name, type, and effort.'),
});
export type SummarizeActivitiesInput = z.infer<typeof SummarizeActivitiesInputSchema>;

const SummarizeActivitiesOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the activities, highlighting key aspects and overall effort.'),
});
export type SummarizeActivitiesOutput = z.infer<typeof SummarizeActivitiesOutputSchema>;

export async function summarizeActivities(
  input: SummarizeActivitiesInput
): Promise<SummarizeActivitiesOutput> {
  return summarizeActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeActivitiesPrompt',
  input: {
    schema: z.object({
      activities: z
        .string()
        .describe('A JSON string representing an array of activities with properties like name, type, and effort.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z
        .string()
        .describe('A concise summary of the activities, highlighting key aspects and overall effort.'),
    }),
  },
  prompt: `You are an AI assistant specialized in summarizing software development activities for reporting purposes.

Given a JSON string representing an array of activities, provide a concise summary highlighting key aspects and overall effort.

Activities: {{{activities}}}`,
});

const summarizeActivitiesFlow = ai.defineFlow<
  typeof SummarizeActivitiesInputSchema,
  typeof SummarizeActivitiesOutputSchema
>(
  {
    name: 'summarizeActivitiesFlow',
    inputSchema: SummarizeActivitiesInputSchema,
    outputSchema: SummarizeActivitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
