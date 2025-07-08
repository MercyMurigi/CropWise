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
  dietaryNeeds: z.string().describe("The primary nutritional goal for the garden, e.g., 'Child Health (U5)' or 'Iron-Rich Boost'."),
});
export type GenerateTrainingMaterialsInput = z.infer<typeof GenerateTrainingMaterialsInputSchema>;

const GenerateTrainingMaterialsOutputSchema = z.object({
  title: z.string().describe("A catchy title for the training guide."),
  introduction: z.string().describe("A brief introductory paragraph for the guide."),
  sections: z.array(z.object({
      cropName: z.string().describe("The name of the crop this section is about."),
      content: z.string().describe("The training content for this crop. Use Markdown for formatting (e.g., **bold** for titles, * for list items). Include information on planting, watering, pest control, and harvesting. Tailor the tone for the specified garden type (e.g., educational and simple for schools).")
  })),
  conclusion: z.string().describe("A concluding paragraph to encourage the gardeners."),
  poster: z.object({
    title: z.string().describe("A catchy, encouraging title for a nutrition poster, related to the dietary goal (e.g., 'Grow These for a Stronger Child!')."),
    body: z.string().describe("A short, encouraging body text for the poster, highlighting the benefits of the recommended crops for the specified dietary need."),
  }).optional().describe("Content for a printable nutrition poster. Should only be generated for community gardens.")
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

If the garden type is "community", write the guide with a tone suitable for teaching groups or children. Use simple language and focus on the educational aspects. Use Markdown formatting like **Bold Titles** and * for lists.
If the garden type is "family", the tone can be more direct and focused on home gardening success.

Crops to cover:
{{#each crops}}
- {{{this}}}
{{/each}}

Garden Type: {{{gardenType}}}
Dietary Goal: {{{dietaryNeeds}}}

Instructions:
1.  Create a catchy 'title' for the guide.
2.  Write a brief 'introduction'.
3.  For each crop, create a 'section' with 'cropName' and 'content'. The content should cover:
    -   **Planting:** How to plant the seeds/seedlings.
    -   **Care:** Simple instructions for watering, sunlight, and basic pest control.
    -   **Harvesting:** When and how to harvest.
    -   **Fun Fact (for community/school gardens):** An interesting fact about the plant.
4.  Write a positive 'conclusion' to wrap up the guide.

If the 'gardenType' is "community", you MUST also generate content for a printable 'poster'. The poster should have:
    - A catchy 'title' related to the dietary goal. For example, if the goal is 'Child Health (U5)', the title could be "A Garden for Stronger Children!".
    - A short, motivational 'body' text encouraging the community to grow and eat these crops to meet their health goals.
If the 'gardenType' is "family", you MUST OMIT the 'poster' field from the JSON output.

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
