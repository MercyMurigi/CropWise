'use server';
/**
 * @fileOverview An AI agent for finding local agro-dealers.
 *
 * - findAgroDealers - A function that finds agro-dealers in a given region.
 * - FindAgroDealersInput - The input type for the findAgroDealers function.
 * - FindAgroDealersOutput - The return type for the findAgroDealers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindAgroDealersInputSchema = z.object({
  region: z.string().describe('The region or county to search for agro-dealers.'),
});
export type FindAgroDealersInput = z.infer<typeof FindAgroDealersInputSchema>;

const FindAgroDealersOutputSchema = z.object({
    dealers: z.array(z.object({
        name: z.string().describe("The name of the agro-dealer shop."),
        location: z.string().describe("A plausible physical location or address for the dealer."),
        phone: z.string().describe("A plausible phone number for the dealer."),
    })).describe("A list of at least 3 plausible agro-dealers.")
});
export type FindAgroDealersOutput = z.infer<typeof FindAgroDealersOutputSchema>;

export async function findAgroDealers(input: FindAgroDealersInput): Promise<FindAgroDealersOutput> {
  return findAgroDealersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findAgroDealersPrompt',
  input: {schema: FindAgroDealersInputSchema},
  output: {schema: FindAgroDealersOutputSchema},
  prompt: `You are a helpful assistant for a farming app. Your task is to provide a list of agro-dealers for a user in a specific region of Kenya.

User's Region: {{{region}}}

Based on the region, generate a list of at least three plausible, but fictional, agro-dealer shops. For each dealer, provide a name, a general location (like "Main Street, Town Center"), and a fictional Kenyan phone number.

It is very important that you create fictional data, as you do not have access to real-time business directories. The purpose is to demonstrate the functionality of the app.

Respond with a JSON object containing a "dealers" array.
`,
});

const findAgroDealersFlow = ai.defineFlow(
  {
    name: 'findAgroDealersFlow',
    inputSchema: FindAgroDealersInputSchema,
    outputSchema: FindAgroDealersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
