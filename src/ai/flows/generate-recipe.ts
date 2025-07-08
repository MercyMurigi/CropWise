'use server';
/**
 * @fileOverview Generates simple, localized recipes for a given crop.
 *
 * - generateRecipe - A function that generates a recipe.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  cropName: z.string().describe("The name of the crop to generate a recipe for."),
  context: z.string().describe("Context about the user, like 'for toddlers' or 'for a family'.")
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  title: z.string().describe("A simple, descriptive title for the recipe."),
  description: z.string().describe("A short, one-sentence description of the dish."),
  ingredients: z.array(z.string()).describe("A list of simple ingredients."),
  instructions: z.array(z.string()).describe("A list of step-by-step instructions, written in simple language."),
  fullTextForAudio: z.string().describe("The full recipe text concatenated for text-to-speech conversion. Should start with the title, then ingredients, then instructions.")
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a nutritionist who creates simple, healthy, and localized recipes for East African home cooks. Your recipes should use common household tools and locally available ingredients. The language must be very simple and clear, suitable for users with low literacy.

Create one simple recipe for "{{cropName}}". The recipe should be appropriate for "{{context}}".

For example, if the crop is "moringa" and the context is "for toddlers", a good recipe title would be "How to make moringa ugali for toddlers."

Instructions:
1.  Generate a simple, descriptive 'title'.
2.  Write a one-sentence 'description' of the dish.
3.  List the 'ingredients' as an array of strings.
4.  Provide 'instructions' as an array of simple, numbered steps. Each step should be a short sentence.
5.  Combine the title, ingredients, and instructions into a single string called 'fullTextForAudio' for text-to-speech. Format it nicely for listening. For example: "Title: How to make... Ingredients: one cup... Instructions: First, wash... Second...".

Crop: {{{cropName}}}
Context: {{{context}}}

Respond with a JSON object following the specified output schema.
`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
      throw new Error("Could not generate a recipe.");
    }

    const fullText = `
      Recipe: ${output.title}.
      Description: ${output.description}.
      Ingredients: ${output.ingredients.join(', ')}.
      Instructions: ${output.instructions.map((step, i) => `${i + 1}. ${step}`).join(' ')}
    `;
    output.fullTextForAudio = fullText;

    return output;
  }
);
