
'use server';

import {
  generateCropRecommendations,
  GenerateCropRecommendationsInput,
} from '@/ai/flows/generate-crop-recommendations';
import { diagnoseGarden, DiagnoseGardenInput } from '@/ai/flows/diagnose-garden';
import { generateGardenLayout, GenerateGardenLayoutInput } from '@/ai/flows/generate-garden-layout';
import { z } from 'zod';
import type { CropFormValues } from '@/components/crop-form';
import { findAgroDealers, FindAgroDealersOutput } from '@/ai/flows/find-agro-dealers';
import { generateTrainingMaterials, GenerateTrainingMaterialsInput, GenerateTrainingMaterialsOutput } from '@/ai/flows/generate-training-materials';
import { generateRecipe, GenerateRecipeInput, GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { parseFormQuery, ParseFormQueryOutput } from '@/ai/flows/parse-form-query';


export type RecommendationResult = {
  overallRationale: string;
  crops: {
    name: string;
    rationale: string;
    imageDataUri: string;
    plantingInfo: {
      spacing: string;
      maturity: string;
      intercropping: string;
    };
  }[];
};

export type LayoutResult = {
  layout: string[][];
  description: string;
  legend: Record<string, string>;
};

export type DealerResult = FindAgroDealersOutput['dealers'];

export type TrainingGuideResult = GenerateTrainingMaterialsOutput;

export type RecipeResult = GenerateRecipeOutput;

export type AudioResult = TextToSpeechOutput;

export type ParsedFormResult = ParseFormQueryOutput;


const nutritionBasketMap = {
  general: "A balanced mix of essential vitamins and minerals for overall health.",
  iron_rich: "Focus on iron-rich crops to help combat anemia and boost energy levels.",
  vitamin_a: "Focus on crops rich in Vitamin A to support vision and immune function.",
  child_health: "Crops that provide key nutrients for growth and development in children under 5.",
  maternal_health: "Nutrient-dense crops to support the health of pregnant and lactating mothers."
};

export async function getRecommendations(
  formData: CropFormValues & { gardenType: GenerateCropRecommendationsInput['gardenType'] }
): Promise<RecommendationResult> {

  const dietaryNeedsDescription = nutritionBasketMap[formData.dietaryNeeds] || formData.dietaryNeeds;

  const recommendations = await generateCropRecommendations({
      ...formData,
      dietaryNeeds: dietaryNeedsDescription
  });

  if (!recommendations || !recommendations.crops || recommendations.crops.length === 0) {
    throw new Error('The AI could not generate recommendations for the provided data. Please try adjusting your inputs.');
  }

  return recommendations;
}

export async function getGardenFeedback(
  formData: DiagnoseGardenInput
) {
  const result = await diagnoseGarden(formData);
  if (!result) {
    throw new Error('Could not get feedback for your garden photo.');
  }
  return result;
}

export async function getGardenLayout(
  formData: GenerateGardenLayoutInput
): Promise<LayoutResult> {

  const layoutData = await generateGardenLayout(formData);

  if (!layoutData || !layoutData.layout || layoutData.layout.length === 0) {
    throw new Error('The AI could not generate a garden layout. Please try again.');
  }

  return layoutData;
}

export async function getDealers(region: string): Promise<DealerResult> {
  const result = await findAgroDealers({ region });
  if (!result || !result.dealers || result.dealers.length === 0) {
    throw new Error('The AI could not find any dealers for the selected region.');
  }
  return result.dealers;
}

export async function getTrainingGuide(
  formData: GenerateTrainingMaterialsInput
): Promise<TrainingGuideResult> {
  const result = await generateTrainingMaterials(formData);
  if (!result || !result.title) {
    throw new Error('The AI could not generate a training guide. Please try again.');
  }
  return result;
}

export async function getRecipe(
  formData: GenerateRecipeInput
): Promise<RecipeResult> {
  const result = await generateRecipe(formData);
  if (!result || !result.title) {
    throw new Error('The AI could not generate a recipe. Please try again.');
  }
  return result;
}

export async function getAudioForText(
  formData: TextToSpeechInput
): Promise<AudioResult> {
  const result = await textToSpeech(formData);
  if (!result || !result.audioDataUri) {
    throw new Error('The AI could not generate audio. Please try again.');
  }
  return result;
}

export async function parseQueryForForm(query: string): Promise<ParsedFormResult> {
    const result = await parseFormQuery({ query });
    if (!result) {
        throw new Error('Could not understand the query. Please try again.');
    }
    return result;
}
