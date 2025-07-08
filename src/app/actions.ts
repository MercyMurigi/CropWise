
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

const plantingInfoDatabase: {
  [key: string]: RecommendationResult['crops'][0]['plantingInfo'];
} = {
  amaranth: {
    spacing: '30cm apart',
    maturity: '30-50 days',
    intercropping: 'Good with beans and maize.',
  },
  'orange-fleshed sweet potato': {
    spacing: '30-40cm apart',
    maturity: '3-4 months',
    intercropping: 'Works well with legumes.',
  },
  beans: {
    spacing: '10-15cm apart',
    maturity: '60-80 days',
    intercropping: 'Companion to maize and squash (Three Sisters).',
  },
  moringa: {
    spacing: '1m apart',
    maturity: '6-8 months for first harvest',
    intercropping: 'Can be planted with shade-tolerant crops.',
  },
  kale: {
    spacing: '45cm apart',
    maturity: '55-75 days',
    intercropping: 'Grows well with onions and herbs.',
  },
  spinach: {
    spacing: '15cm apart',
    maturity: '40-50 days',
    intercropping: 'Beneficial with strawberries.',
  },
  tomatoes: {
    spacing: '60cm apart',
    maturity: '60-85 days',
    intercropping: 'Plant with basil and carrots.',
  },
  maize: {
    spacing: '25cm apart in rows',
    maturity: '60-100 days',
    intercropping: 'Best with beans and squash.',
  },
  squash: {
    spacing: '90cm apart',
    maturity: '50-100 days',
    intercropping: 'Best with maize and beans.',
  },
  sorghum: {
    spacing: '15-20cm apart',
    maturity: '90-120 days',
    intercropping: 'Good with cowpeas.',
  },
  cowpeas: {
    spacing: '10cm apart',
    maturity: '60-90 days',
    intercropping: 'Excellent nitrogen fixer for cereals like maize or sorghum.',
  },
  cassava: {
    spacing: '1m x 1m',
    maturity: '8-12 months',
    intercropping: 'Can be intercropped with maize or beans in early stages.',
  },
  default: {
    spacing: 'Varies by plant',
    maturity: 'Varies by plant',
    intercropping: 'Check local guides for best combinations.',
  },
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

  const combinedCrops = recommendations.crops.map((crop) => {
    const lowerCaseCrop = crop.name.toLowerCase();
    const info =
      plantingInfoDatabase[lowerCaseCrop] || plantingInfoDatabase['default'];
    return {
      name: crop.name,
      rationale: crop.rationale,
      plantingInfo: info,
    };
  });

  return {
    overallRationale: recommendations.overallRationale,
    crops: combinedCrops,
  };
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
