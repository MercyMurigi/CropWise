
'use server';
/**
 * @fileOverview A crop recommendation AI agent.
 *
 * - generateCropRecommendations - A function that handles the crop recommendation process.
 * - GenerateCropRecommendationsInput - The input type for the generateCropRecommendations function.
 * - GenerateCropRecommendationsOutput - The return type for the generateCropRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropRecommendationsInputSchema = z.object({
  landSize: z.string().describe('The size of the land available for farming.'),
  region: z.string().describe('The region or county where the farm is located.'),
  familySize: z.number().describe('The number of people in the family.'),
  dietaryNeeds: z.string().describe('Specific dietary needs or restrictions of the family.'),
  waterAvailability: z
    .enum(['rainfed', 'irrigated', 'sack/bag garden', 'balcony garden'])
    .describe('The type of water setup available.'),
});
export type GenerateCropRecommendationsInput = z.infer<
  typeof GenerateCropRecommendationsInputSchema
>;

const GenerateCropRecommendationsOutputSchema = z.object({
  overallRationale: z
    .string()
    .describe('A summary rationale behind the recommended crop combination.'),
  crops: z
    .array(
      z.object({
        name: z.string().describe('The name of the recommended crop.'),
        rationale: z
          .string()
          .describe(
            'The rationale for recommending this specific crop, highlighting its nutritional benefits.'
          ),
      })
    )
    .describe('An array of recommended crops, each with a name and a rationale. MUST contain at least 3 crops.'),
});
export type GenerateCropRecommendationsOutput = z.infer<
  typeof GenerateCropRecommendationsOutputSchema
>;

export async function generateCropRecommendations(
  input: GenerateCropRecommendationsInput
): Promise<GenerateCropRecommendationsOutput> {
  return generateCropRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCropRecommendationsPrompt',
  input: {schema: GenerateCropRecommendationsInputSchema},
  output: {schema: GenerateCropRecommendationsOutputSchema},
  prompt: `You are an expert in recommending crop combinations for home gardens, schools, and community farms, with deep knowledge of nutrition.

Your task is to suggest an optimized set of at least THREE crops that provide a balanced micronutrient supply based on the user's context. Be creative and ensure the recommendations are well-suited for the given conditions.

Context for water availability options:
- rainfed: crops are watered by natural rainfall.
- irrigated: crops are watered through an irrigation system.
- sack/bag garden: crops are grown in sacks or bags, suitable for small spaces.
- balcony garden: crops are grown in containers on a balcony.

User's context:
- Land Size: {{{landSize}}}
- Region: {{{region}}}
- Family Size: {{{familySize}}}
- Dietary Needs: {{{dietaryNeeds}}}
- Water Availability: {{{waterAvailability}}}

Please respond with a JSON object. This object should contain:
1. "overallRationale": a string summarizing why this combination of crops is recommended.
2. "crops": an array of objects. Each object must have:
   - "name": a string with the crop's name.
   - "rationale": a string explaining the nutritional benefits of this specific crop and how it addresses the user's dietary needs.

It is crucial that you ALWAYS recommend at least three different crops.

Example output format:
{
  "overallRationale": "This combination provides a good mix of vitamins A and C, is suitable for the specified region, and can be grown in the available land size.",
  "crops": [
    {
      "name": "Kale",
      "rationale": "Kale is rich in vitamins K, A, and C, and is a good source of calcium. It's excellent for boosting immunity and supporting bone health, which is beneficial for growing children."
    },
    {
      "name": "Spinach",
      "rationale": "Spinach is packed with iron, making it ideal for addressing iron deficiencies. It also provides folate, which is important for pregnant women."
    },
    {
      "name": "Carrots",
      "rationale": "Carrots are a fantastic source of beta-carotene, which the body converts to vitamin A. This is essential for good vision and a healthy immune system."
    }
  ]
}
`,
});

const generateCropRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateCropRecommendationsFlow',
    inputSchema: GenerateCropRecommendationsInputSchema,
    outputSchema: GenerateCropRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
