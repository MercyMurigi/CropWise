import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-recommendations.ts';
import '@/ai/flows/diagnose-garden.ts';
import '@/ai/flows/generate-garden-layout.ts';
import '@/ai/flows/find-agro-dealers.ts';
import '@/ai/flows/generate-training-materials.ts';
import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/text-to-speech.ts';
