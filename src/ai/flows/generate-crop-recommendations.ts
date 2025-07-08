
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
  gardenType: z.enum(['family', 'community']).describe("The type of garden being planned."),
  landSize: z.string().describe('The size of the land available for farming.'),
  region: z.string().describe('The region or county where the farm is located.'),
  plantingMonth: z.string().describe('The month for planting.'),
  familySize: z.number().describe('The number of people in the family or group.'),
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
  // New optional fields for community plan
  areaRequired: z.string().optional().describe("The estimated land area required in square meters."),
  seedQuantities: z.array(z.object({ cropName: z.string(), quantity: z.string() })).optional().describe("Estimated seed quantity needed for each crop."),
  plantingSchedule: z.string().optional().describe("A simple weekly planting schedule."),
  estimatedWeeklyYield: z.string().optional().describe("An estimation of the weekly harvest yield.")
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
    // New optional fields for community plan
    areaRequired: z.string().optional().describe("The estimated land area required in square meters."),
    seedQuantities: z.array(z.object({ cropName: z.string(), quantity: z.string() })).optional().describe("Estimated seed quantity needed for each crop."),
    plantingSchedule: z.string().optional().describe("A simple weekly planting schedule."),
    estimatedWeeklyYield: z.string().optional().describe("An estimation of the weekly harvest yield.")
});


const prompt = ai.definePrompt({
  name: 'generateCropRecommendationsPrompt',
  input: {schema: GenerateCropRecommendationsInputSchema},
  output: {schema: TextRecommendationsSchema}, // Use the text-only schema here
  prompt: `You are an expert in recommending crop combinations for home gardens, schools, and community farms, with deep knowledge of nutrition and sustainable agriculture in East Africa.

Your task is to suggest an optimized set of at least THREE crops that provide a balanced micronutrient supply based on the user's context. Your recommendations should be suitable for the given region and planting month, considering typical weather patterns like rainy or dry seasons. For each crop, you must also provide detailed planting information.

If the user specifies a "community" garden type, your recommendations must be suitable for a larger group and include detailed planning information. For a "family" garden, tailor the recommendations to a smaller scale.

Context for water availability options:
- rainfed: crops are watered by natural rainfall.
- irrigated: crops are watered through an irrigation system.
- sack/bag garden: crops are grown in sacks or bags, suitable for small spaces.
- balcony garden: crops are grown in containers on a balcony.

User's context:
- Garden Type: {{{gardenType}}}
- Land Size: {{{landSize}}}
- Region: {{{region}}}
- Planting Month: {{{plantingMonth}}}
- Number of People: {{{familySize}}}
- Dietary Needs: {{{dietaryNeeds}}}
- Water Availability: {{{waterAvailability}}}

Please respond with a JSON object.

The object must contain the following top-level fields:
- "overallRationale": A string summarizing why this combination of crops is recommended for the user's specific context.
- "crops": An array of objects. Each object must have:
  - "name": A string with the crop's name.
  - "rationale": A CONCISE, 1-2 sentence string explaining the nutritional benefits of this crop and how it is suitable for the user's region, land size, and dietary needs.
  - "imageKeywords": A string with one or two keywords for an image search of the crop (e.g., 'kale plant', 'carrot').
  - "plantingInfo": An object with the following keys:
    - "spacing": A string with the recommended spacing between plants.
    - "maturity": A string indicating the time until harvest.
    - "intercropping": A string with advice on companion plants.

{{#if (eq gardenType "community")}}
For community gardens, the JSON object MUST ALSO include these additional top-level fields:
- "areaRequired": A string estimating the total land area required in square meters to feed the specified number of people.
- "seedQuantities": An array of objects, one for each recommended crop, with "cropName" and "quantity" (e.g., [{ "cropName": "Maize", "quantity": "500g" }]).
- "plantingSchedule": A string describing a simple, actionable planting schedule over a few weeks.
- "estimatedWeeklyYield": A string estimating the expected weekly harvest in kilograms once the crops mature.
{{/if}}

It is crucial that you ALWAYS recommend at least three different crops and respond with a valid JSON object that strictly follows the format described.
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

    if (!textOutput || !textOutput.crops || textOutput.crops.length === 0) {
        throw new Error("Could not generate text recommendations. The AI did not return the expected data.");
    }
    
    // 2. Generate images in parallel for each crop, with error handling for each
    const imagePromises = textOutput.crops.map(async (crop) => {
        let imageDataUri = `https://placehold.co/400x300.png?text=${crop.name.replace(/\s/g, '+')}`; // Default fallback
        
        try {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: `A vibrant, high-quality photo of ${crop.imageKeywords} growing in a garden, suitable for a gardening app.`,
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });

            if (media?.url) {
                imageDataUri = media.url;
            }
        } catch (error) {
            console.error(`Failed to generate image for "${crop.name}". Using fallback. Error:`, error);
            // imageDataUri remains the default fallback
        }
        
        return {
            name: crop.name,
            rationale: crop.rationale,
            plantingInfo: crop.plantingInfo,
            imageDataUri: imageDataUri,
        };
    });

    const cropsWithImages = await Promise.all(imagePromises);

    // 3. Assemble the final output
    return {
        overallRationale: textOutput.overallRationale,
        crops: cropsWithImages,
        areaRequired: textOutput.areaRequired,
        seedQuantities: textOutput.seedQuantities,
        plantingSchedule: textOutput.plantingSchedule,
        estimatedWeeklyYield: textOutput.estimatedWeeklyYield,
    };
  }
);
