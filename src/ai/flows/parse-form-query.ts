'use server';
/**
 * @fileOverview An AI agent for parsing natural language queries into form data.
 *
 * - parseFormQuery - A function that parses a user's spoken or typed query.
 * - ParseFormQueryInput - The input type for the parseFormQuery function.
 * - ParseFormQueryOutput - The return type for the parseFormQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Must match the keys from the form component
const NUTRITION_BASKET_KEYS = ["general", "iron_rich", "vitamin_a", "child_health", "maternal_health"];
const WATER_AVAILABILITY_KEYS = ["rainfed", "irrigated", "sack/bag garden", "balcony garden"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


const ParseFormQueryOutputSchema = z.object({
  landSize: z.string().optional().describe("The size of the land available for farming (e.g., '1/8 acre', '50 sqm')."),
  region: z.string().optional().describe('The region or county where the farm is located.'),
  familySize: z.number().optional().describe('The number of people in the family or group.'),
  plantingMonth: z.enum(MONTHS as [string, ...string[]]).optional().describe('The month the user wants to plant in.'),
  dietaryNeeds: z.enum(NUTRITION_BASKET_KEYS as [string, ...string[]]).optional().describe('The specific dietary need or nutritional goal.'),
  waterAvailability: z.enum(WATER_AVAILABILITY_KEYS as [string, ...string[]]).optional().describe('The type of water setup or planting location.'),
});
export type ParseFormQueryOutput = z.infer<typeof ParseFormQueryOutputSchema>;

const ParseFormQueryInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
});
export type ParseFormQueryInput = z.infer<typeof ParseFormQueryInputSchema>;


export async function parseFormQuery(input: ParseFormQueryInput): Promise<ParseFormQueryOutput> {
  return parseFormQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseFormQueryPrompt',
  input: {schema: ParseFormQueryInputSchema},
  output: {schema: ParseFormQueryOutputSchema},
  prompt: `You are a helpful assistant for a farming app. Your task is to parse a user's natural language query and extract information to fill out a form.

User's Query: "{{{query}}}"

Extract the following fields from the user's query. If a piece of information is not present, omit the corresponding field from the output.

- landSize: The size of the land.
- region: The geographical location, like a county or town.
- familySize: The number of people to feed.
- plantingMonth: The month for planting. Must be one of: ${MONTHS.join(", ")}.
- dietaryNeeds: The nutritional goal. Map the user's intent to one of the following keys: ${NUTRITION_BASKET_KEYS.join(", ")}. For example, 'for my pregnant wife' should map to 'maternal_health'. 'For my baby' maps to 'child_health'.
- waterAvailability: The planting location or water source. Map the user's intent to one of the following keys: ${WATER_AVAILABILITY_KEYS.join(", ")}. For example, 'in bags' should map to 'sack/bag garden'. 'On my veranda' maps to 'balcony garden'.

Example:
User Query: "I want to plant vegetables in March for my 5 children in Nakuru. I have a small kitchen garden that relies on rain."
Output:
{
  "familySize": 5,
  "region": "Nakuru",
  "plantingMonth": "March",
  "dietaryNeeds": "child_health",
  "waterAvailability": "rainfed",
  "landSize": "small kitchen garden"
}

Respond with a JSON object containing the extracted fields.
`,
});

const parseFormQueryFlow = ai.defineFlow(
  {
    name: 'parseFormQueryFlow',
    inputSchema: ParseFormQueryInputSchema,
    outputSchema: ParseFormQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
