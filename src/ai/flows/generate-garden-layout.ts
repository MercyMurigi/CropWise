'use server';
/**
 * @fileOverview A visual garden layout planner AI agent.
 *
 * - generateGardenLayout - A function that handles the garden layout generation.
 * - GenerateGardenLayoutInput - The input type for the generateGardenLayout function.
 * - GenerateGardenLayoutOutput - The return type for the generateGardenLayout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGardenLayoutInputSchema = z.object({
  crops: z
    .array(
      z.object({
        name: z.string(),
        spacing: z.string(),
        intercropping: z.string(),
      })
    )
    .describe('An array of recommended crops with their planting info.'),
  landSize: z.string().describe('The size of the land available for planting.'),
  plantingLocation: z
    .string()
    .describe(
      'The type of planting location (e.g., On Ground, Sack Garden, Balcony Garden).'
    ),
});
export type GenerateGardenLayoutInput = z.infer<
  typeof GenerateGardenLayoutInputSchema
>;

const GenerateGardenLayoutOutputSchema = z.object({
  layout: z
    .array(z.array(z.string().describe("The crop name, or 'empty' for an empty space.")))
    .describe(
      'A 2D array representing the garden grid. A smaller grid is better for visualization (e.g., 10x10).'
    ),
  description: z
    .string()
    .describe('A brief, friendly description of the layout and planting advice.'),
  legend: z
    .record(z.string(), z.string())
    .describe(
      'A legend mapping crop names to colors or symbols for the visual plan. e.g. {"Kale": "green", "Carrots": "orange"}'
    ),
});
export type GenerateGardenLayoutOutput = z.infer<
  typeof GenerateGardenLayoutOutputSchema
>;

export async function generateGardenLayout(
  input: GenerateGardenLayoutInput
): Promise<GenerateGardenLayoutOutput> {
  return generateGardenLayoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGardenLayoutPrompt',
  input: {schema: GenerateGardenLayoutInputSchema},
  output: {schema: GenerateGardenLayoutOutputSchema},
  prompt: `You are an expert landscape designer specializing in kitchen gardens. Your task is to create a simple, visual planting map based on user inputs.

User's Context:
- Land Size: {{{landSize}}}
- Planting Location: {{{plantingLocation}}}
- Recommended Crops:
{{#each crops}}
  - {{name}} (Spacing: {{spacing}}, Intercropping: {{intercropping}})
{{/each}}

Instructions:
1.  Generate a simple, grid-based visual layout for the garden. The grid should be small and easy to visualize, ideally no larger than 10x10.
2.  Arrange the crops in the grid, considering their spacing needs and beneficial intercropping combinations. Use the full crop name in the grid. Represent empty spaces with the string 'empty'.
3.  The layout should be a practical representation, not a literal to-scale map. For "Sack Garden" or "Balcony Garden", the layout should represent planting in containers.
4.  Provide a short, encouraging description of the layout, explaining the placement of crops.
5.  Create a legend that maps each crop name to a common color name (e.g., "green", "orange", "red"). This will be used to color-code the visual plan.

Example Output for a small balcony garden:
{
  "layout": [
    ["Tomatoes", "Tomatoes", "Basil"],
    ["Kale", "Kale", "empty"],
    ["Spinach", "Spinach", "Spinach"]
  ],
  "description": "Here is a simple layout for your balcony containers! Tomatoes are paired with basil, which can improve their flavor. Leafy greens like Kale and Spinach are grouped together for easy harvesting.",
  "legend": {
    "Tomatoes": "red",
    "Basil": "green",
    "Kale": "darkgreen",
    "Spinach": "lightgreen"
  }
}
`,
});

const generateGardenLayoutFlow = ai.defineFlow(
  {
    name: 'generateGardenLayoutFlow',
    inputSchema: GenerateGardenLayoutInputSchema,
    outputSchema: GenerateGardenLayoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
