
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

If the user specifies a "community" garden type, your recommendations should be suitable for a larger group, potentially for educational purposes. Focus on crops that are resilient, have a good yield, and are easy to manage for groups. For a "family" garden, tailor the recommendations to a smaller scale.

Context for water availability options:
- rainfed: crops are watered by natural rainfall.
- irrigated: crops are watered through an irrigation system.
- sack/bag garden: crops are grown in sacks or bags, suitable for small spaces.
- balcony garden: crops are grown in containers on a balcony.

User's context:
- Garden Type: {{{gardenType}}}
- Land Size: {{{landSize}}}
- Region: {{{region}}}
- Number of People: {{{familySize}}}
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
    };
  }
);
