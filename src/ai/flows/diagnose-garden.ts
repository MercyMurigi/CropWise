'use server';
/**
 * @fileOverview A garden diagnosis AI agent.
 *
 * - diagnoseGarden - A function that handles the garden diagnosis process.
 * - DiagnoseGardenInput - The input type for the diagnoseGarden function.
 * - DiagnoseGardenOutput - The return type for the diagnoseGarden function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseGardenInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a garden, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DiagnoseGardenInput = z.infer<typeof DiagnoseGardenInputSchema>;

const DiagnoseGardenOutputSchema = z.object({
    feedback: z.string().describe("Encouraging feedback or tips for the user's garden."),
    alerts: z.array(z.string()).describe("A list of specific alerts or suggestions, like 'Spacing too tight' or 'Mulch needed'. Can be empty if the garden looks great.")
});
export type DiagnoseGardenOutput = z.infer<typeof DiagnoseGardenOutputSchema>;

export async function diagnoseGarden(input: DiagnoseGardenInput): Promise<DiagnoseGardenOutput> {
  return diagnoseGardenFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseGardenPrompt',
  input: {schema: DiagnoseGardenInputSchema},
  output: {schema: DiagnoseGardenOutputSchema},
  prompt: `You are a friendly and encouraging gardening expert. Your goal is to provide helpful feedback on a user's garden photo.

Analyze the provided photo of the garden.

- Provide overall encouraging feedback.
- Identify potential issues and provide actionable tips as alerts. For example: "Spacing too tight," "Mulch needed," or "Signs of nutrient deficiency."
- If the garden looks healthy, provide a celebratory message.

Photo: {{media url=photoDataUri}}

Respond with a JSON object containing "feedback" and an array of "alerts".
`,
});

const diagnoseGardenFlow = ai.defineFlow(
  {
    name: 'diagnoseGardenFlow',
    inputSchema: DiagnoseGardenInputSchema,
    outputSchema: DiagnoseGardenOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
