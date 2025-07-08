import { config } from 'dotenv';
config();

import '@/ai/flows/generate-crop-recommendations.ts';
import '@/ai/flows/diagnose-garden.ts';
import '@/ai/flows/generate-garden-layout.ts';
