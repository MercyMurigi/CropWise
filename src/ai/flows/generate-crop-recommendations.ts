
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

// This is the final output schema with the image data URI
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
            'A CONCISE, 1-2 sentence rationale for recommending this specific crop, highlighting its nutritional benefits and suitability for the provided context.'
          ),
        imageDataUri: z.string().describe("A data URI for a generated image of the crop."),
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


// This schema is for the text-only prompt. It gets keywords we can use for image generation.
const TextRecommendationsSchema = z.object({
    overallRationale: z.string().describe('A summary rationale behind the recommended crop combination.'),
    crops: z.array(z.object({
        name: z.string().describe('The name of the recommended crop.'),
        rationale: z.string().describe('A CONCISE, 1-2 sentence rationale for recommending this specific crop, highlighting its nutritional benefits and suitability for the provided context.'),
        imageKeywords: z.string().describe("One or two keywords for an image search of the crop (e.g., 'kale plant', 'carrot')."),
        plantingInfo: z.object({
            spacing: z.string().describe("Recommended spacing between plants (e.g., '30cm apart')."),
            maturity: z.string().describe("Time to maturity from planting (e.g., '60-80 days')."),
            intercropping: z.string().describe("Advice on companion planting or intercropping (e.g., 'Good with beans and maize.')."),
        }).describe("Detailed planting information for this specific crop.")
    })).describe('An array of recommended crops, each with a name, rationale, and planting info. MUST contain at least 3 crops.'),
});


const prompt = ai.definePrompt({
  name: 'generateCropRecommendationsPrompt',
  input: {schema: GenerateCropRecommendationsInputSchema},
  output: {schema: TextRecommendationsSchema}, // Use the text-only schema here
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
   - "rationale": a CONCISE, 1-2 sentence string explaining the nutritional benefits of this crop and how it is suitable for the user's region, land size, and dietary needs.
   - "imageKeywords": a string with one or two keywords for an image search of the crop (e.g., 'kale plant', 'carrot').
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
      "rationale": "Kale is a nutritional powerhouse, rich in vitamins K, A, and C, supporting bone health and immunity. It's a hardy crop that grows well in your specified region.",
      "imageKeywords": "kale plant",
      "plantingInfo": {
        "spacing": "45cm apart",
        "maturity": "55-75 days",
        "intercropping": "Grows well with onions and herbs, which can help deter pests."
      }
    },
    {
      "name": "Carrots",
      "rationale": "Carrots are an excellent source of Vitamin A, essential for vision and immune function. They are suitable for the land size and grow well in irrigated conditions.",
      "imageKeywords": "carrots",
      "plantingInfo": {
        "spacing": "5-8cm apart",
        "maturity": "70-80 days",
        "intercropping": "Planting with rosemary or sage can help deter the carrot rust fly."
      }
    },
    {
      "name": "Beans (Bush variety)",
      "rationale": "Beans are a fantastic source of plant-based protein and iron, crucial for combating anemia. They also fix nitrogen in the soil, improving its fertility.",
      "imageKeywords": "bush beans",
      "plantingInfo": {
        "spacing": "10-15cm apart",
        "maturity": "60-80 days",
        "intercropping": "A classic companion to maize and squash, but also grows well alongside carrots."
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
    // 1. Get text-based recommendations first
    const {output: textOutput} = await prompt(input);

    if (!textOutput) {
        throw new Error("Could not generate text recommendations.");
    }
    
    // 2. Generate images in parallel for each crop
    const imagePromises = textOutput.crops.map(async (crop) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `A vibrant, high-quality photo of ${crop.imageKeywords} growing in a garden, suitable for a gardening app.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        
        return {
            name: crop.name,
            rationale: crop.rationale,
            plantingInfo: crop.plantingInfo,
            imageDataUri: media?.url || 'https://placehold.co/400x300.png', // Fallback
        };
    });

    const cropsWithImages = await Promise.all(imagePromises);

    // 3. Assemble the final output
    return {
        overallRationale: textOutput.overallRationale,
        crops: cropsWithImages,
    };
  }
);
