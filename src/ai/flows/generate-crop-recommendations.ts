
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
            'The rationale for recommending this specific crop, highlighting its nutritional benefits and suitability for the provided context.'
          ),
        plantingInfo: z.object({
          spacing: z.string().describe("Recommended spacing between plants (e.g., '30cm apart')."),
          maturity: z.string().describe("Time to maturity from planting (e.g., '60-80 days')."),
          intercropping: z.string().describe("Advice on companion planting or intercropping (e.g., 'Good with beans and maize.')."),
        }).describe("Detailed planting information for this specific crop.")
      })
    )
    .describe('An array of recommended crops, each with a name, rationale, and planting info. MUST contain at least 3 crops.'),
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
  prompt: `You are an expert in recommending crop combinations for home gardens, schools, and community farms, with deep knowledge of nutrition and sustainable agriculture.

Your task is to suggest an optimized set of at least THREE crops that provide a balanced micronutrient supply based on the user's context. For each crop, you must also provide detailed planting information.

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
1. "overallRationale": a string summarizing why this combination of crops is recommended for the user's specific context.
2. "crops": an array of objects. Each object must have:
   - "name": a string with the crop's name.
   - "rationale": a string explaining the nutritional benefits of this crop and how it is suitable for the user's region, land size, and dietary needs.
   - "plantingInfo": an object with the following keys:
     - "spacing": a string with the recommended spacing between plants.
     - "maturity": a string indicating the time until harvest.
     - "intercropping": a string with advice on companion plants.

It is crucial that you ALWAYS recommend at least three different crops.

Example output format:
{
  "overallRationale": "This combination of Kale, Carrots, and Beans offers a balanced nutritional profile rich in vitamins, iron, and protein. It is well-suited for a small, irrigated plot in your region and provides key nutrients for maternal health.",
  "crops": [
    {
      "name": "Kale",
      "rationale": "Kale is a nutritional powerhouse, rich in vitamins K, A, and C. It supports bone health and boosts immunity, which is highly beneficial during pregnancy. It's a hardy crop that grows well in your specified region.",
      "plantingInfo": {
        "spacing": "45cm apart",
        "maturity": "55-75 days",
        "intercropping": "Grows well with onions and herbs, which can help deter pests."
      }
    },
    {
      "name": "Carrots",
      "rationale": "Carrots are an excellent source of beta-carotene (Vitamin A), essential for vision and immune function for both mother and child. They are suitable for the land size and grow well in irrigated conditions.",
      "plantingInfo": {
        "spacing": "5-8cm apart",
        "maturity": "70-80 days",
        "intercropping": "Planting with rosemary or sage can help deter the carrot rust fly."
      }
    },
    {
      "name": "Beans (Bush variety)",
      "rationale": "Beans are a fantastic source of plant-based protein and iron, crucial for combating anemia and supporting fetal development. They also fix nitrogen in the soil, improving its fertility for other plants.",
      "plantingInfo": {
        "spacing": "10-15cm apart",
        "maturity": "60-80 days",
        "intercropping": "A classic companion to maize and squash (Three Sisters method), but also grows well alongside carrots."
      }
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
