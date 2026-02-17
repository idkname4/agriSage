'use server';
/**
 * @fileOverview A Genkit flow for providing AI-generated, localized recommendations
 * for crop problems, including treatment, urgency, and prevention.
 *
 * - farmerAIRecommendations - A function that handles the generation of recommendations.
 * - FarmerAIRecommendationsInput - The input type for the farmerAIRecommendations function.
 * - FarmerAIRecommendationsOutput - The return type for the farmerAIRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmerAIRecommendationsInputSchema = z.object({
  issueDescription: z.string().describe('A detailed description of the identified crop problem.'),
  cropType: z.string().describe('The type of crop affected by the problem (e.g., "wheat", "potatoes", "mango").'),
  location: z.string().describe('The geographical location of the farm, used for localized advice.'),
});
export type FarmerAIRecommendationsInput = z.infer<typeof FarmerAIRecommendationsInputSchema>;

const FarmerAIRecommendationsOutputSchema = z.object({
  treatmentRecommendation: z.string().describe('Actionable steps to treat the identified crop problem.'),
  urgencyLevel: z.enum(['Immediate', 'High', 'Moderate', 'Low']).describe('The recommended urgency level for addressing the problem.'),
  preventionMeasures: z.string().describe('Steps to prevent the recurrence of the crop problem.'),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer indicating that the recommendations are AI-generated and should be verified with local agricultural experts.'
    ),
});
export type FarmerAIRecommendationsOutput = z.infer<typeof FarmerAIRecommendationsOutputSchema>;

export async function farmerAIRecommendations(input: FarmerAIRecommendationsInput): Promise<FarmerAIRecommendationsOutput> {
  return farmerAIRecommendationsFlow(input);
}

const farmerAIRecommendationsPrompt = ai.definePrompt({
  name: 'farmerAIRecommendationsPrompt',
  input: {schema: FarmerAIRecommendationsInputSchema},
  output: {schema: FarmerAIRecommendationsOutputSchema},
  prompt: `You are an expert agricultural advisor for AgriVoice, a platform that helps farmers. Your task is to provide comprehensive, localized recommendations for crop problems, grounded in trusted agricultural knowledge.

Based on the following information, generate a treatment recommendation, an urgency level, and prevention measures.

Issue Description: {{{issueDescription}}}
Crop Type: {{{cropType}}}
Location: {{{location}}}

Provide practical, trusted agricultural methods. For urgency, choose one of 'Immediate', 'High', 'Moderate', or 'Low'.
Also include a disclaimer reminding the farmer to verify this AI-generated advice with local agricultural experts.

Consider local conditions and common practices for the given location and crop type when formulating your advice. Your recommendations should be clear, concise, and easy for a farmer to understand and implement.
`,
});

const farmerAIRecommendationsFlow = ai.defineFlow(
  {
    name: 'farmerAIRecommendationsFlow',
    inputSchema: FarmerAIRecommendationsInputSchema,
    outputSchema: FarmerAIRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await farmerAIRecommendationsPrompt(input);
    return output!;
  }
);
