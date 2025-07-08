'use server';
/**
 * @fileOverview Generates a rationale for crop recommendations based on user input.
 *
 * - generateRationale - A function that generates the rationale for crop recommendations.
 * - GenerateRationaleInput - The input type for the generateRationale function.
 * - GenerateRationaleOutput - The return type for the generateRationale function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRationaleInputSchema = z.object({
  landSize: z.string().describe('The size of the land available for farming.'),
  region: z.string().describe('The region or county where the farm is located.'),
  familySize: z.string().describe('The number of people in the family.'),
  dietaryNeeds: z.string().describe('Specific dietary needs or restrictions (e.g., pregnancy, children under 5).'),
  cropRecommendations: z.array(z.string()).describe('A list of recommended crops.'),
});
export type GenerateRationaleInput = z.infer<typeof GenerateRationaleInputSchema>;

const GenerateRationaleOutputSchema = z.object({
  rationale: z.record(z.string(), z.string()).describe('A map of crop names to rationales.'),
});
export type GenerateRationaleOutput = z.infer<typeof GenerateRationaleOutputSchema>;

export async function generateRationale(input: GenerateRationaleInput): Promise<GenerateRationaleOutput> {
  return generateRationaleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRationalePrompt',
  input: {schema: GenerateRationaleInputSchema},
  output: {schema: GenerateRationaleOutputSchema},
  prompt: `You are an expert nutritionist and agricultural advisor. Given the following information, provide a clear and concise rationale for each crop recommendation, explaining the nutritional benefits and how it addresses the specified dietary needs.

Land Size: {{{landSize}}}
Region: {{{region}}}
Family Size: {{{familySize}}}
Dietary Needs: {{{dietaryNeeds}}}

Crop Recommendations: {{#each cropRecommendations}}{{{this}}}, {{/each}}

For each crop, explain its nutritional benefits and how it addresses the specified dietary needs in the context of the provided information.

Return a JSON object with a single key "rationale". The value of "rationale" should be another JSON object where each key is a crop name and the value is the rationale for that crop.

Example output format:
{
  "rationale": {
    "crop1": "Rationale for crop1...",
    "crop2": "Rationale for crop2..."
  }
}
`,
});

const generateRationaleFlow = ai.defineFlow(
  {
    name: 'generateRationaleFlow',
    inputSchema: GenerateRationaleInputSchema,
    outputSchema: GenerateRationaleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
