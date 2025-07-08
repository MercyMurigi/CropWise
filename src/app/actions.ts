
'use server';

import {
  generateCropRecommendations,
} from '@/ai/flows/generate-crop-recommendations';
import { diagnoseGarden, DiagnoseGardenInput } from '@/ai/flows/diagnose-garden';
import { generateGardenLayout, GenerateGardenLayoutInput } from '@/ai/flows/generate-garden-layout';
import { z } from 'zod';
import type { CropFormValues } from '@/components/crop-form';

export type RecommendationResult = {
  overallRationale: string;
  crops: {
    name: string;
    rationale: string;
    imageKeywords: string;
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

const nutritionBasketMap = {
  general: "A balanced mix of essential vitamins and minerals for overall health.",
  iron_rich: "Focus on iron-rich crops to help combat anemia and boost energy levels.",
  vitamin_a: "Focus on crops rich in Vitamin A to support vision and immune function.",
  child_health: "Crops that provide key nutrients for growth and development in children under 5.",
  maternal_health: "Nutrient-dense crops to support the health of pregnant and lactating mothers."
};

export async function getRecommendations(
  formData: CropFormValues
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
