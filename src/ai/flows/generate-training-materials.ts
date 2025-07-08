'use server';
/**
 * @fileOverview Generates training materials for selected crops.
 *
 * - generateTrainingMaterials - A function that generates a guide for the given crops.
 * - GenerateTrainingMaterialsInput - The input type for the generateTrainingMaterials function.
 * - GenerateTrainingMaterialsOutput - The return type for the generateTrainingMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrainingMaterialsInputSchema = z.object({
  crops: z.array(z.string()).describe("A list of crop names."),
  gardenType: z.enum(['family', 'community']).describe("The type of garden this guide is for."),
});
export type GenerateTrainingMaterialsInput = z.infer<typeof GenerateTrainingMaterialsInputSchema>;

const GenerateTrainingMaterialsOutputSchema = z.object({
  title: z.string().describe("A catchy title for the training guide."),
  introduction: z.string().describe("A brief introductory paragraph for the guide."),
  sections: z.array(z.object({
      cropName: z.string().describe("The name of the crop this section is about."),
      content: z.string().describe("The training content for this crop. Use newlines for formatting. Include information on planting, watering, pest control, and harvesting. Tailor the tone for the specified garden type (e.g., educational and simple for schools).")
  })),
  conclusion: z.string().describe("A concluding paragraph to encourage the gardeners.")
});
export type GenerateTrainingMaterialsOutput = z.infer<typeof GenerateTrainingMaterialsOutputSchema>;

export async function generateTrainingMaterials(input: GenerateTrainingMaterialsInput): Promise<GenerateTrainingMaterialsOutput> {
  return generateTrainingMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrainingMaterialsPrompt',
  input: {schema: GenerateTrainingMaterialsInputSchema},
  output: {schema: GenerateTrainingMaterialsOutputSchema},
  prompt: `You are an expert curriculum developer for agriculture education. Your task is to create a simple, printable training guide for a set of crops.

The guide should be easy to understand for beginners, including teachers, community health workers, or families.

If the garden type is "community", write the guide with a tone suitable for teaching groups or children. Use simple language and focus on the educational aspects. Use formatting like titles with ** and lists with *.
If the garden type is "family", the tone can be more direct and focused on home gardening success.

Crops to cover:
{{#each crops}}
- {{{this}}}
{{/each}}

Garden Type: {{{gardenType}}}

Instructions:
1.  Create a catchy 'title' for the guide.
2.  Write a brief 'introduction'.
3.  For each crop, create a 'section' with 'cropName' and 'content'. The content should cover:
    -   **Planting:** How to plant the seeds/seedlings.
    -   **Care:** Simple instructions for watering, sunlight, and basic pest control.
    -   **Harvesting:** When and how to harvest.
    -   **Fun Fact (for community/school gardens):** An interesting fact about the plant.
4.  Write a positive 'conclusion' to wrap up the guide.

Respond with a JSON object following the specified output schema.
`,
});

const generateTrainingMaterialsFlow = ai.defineFlow(
  {
    name: 'generateTrainingMaterialsFlow',
    inputSchema: GenerateTrainingMaterialsInputSchema,
    outputSchema: GenerateTrainingMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
