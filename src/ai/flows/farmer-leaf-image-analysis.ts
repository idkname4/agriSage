'use server';
/**
 * @fileOverview A Genkit flow for analyzing an image of a plant leaf to identify potential diseases or pests
 * and provide detailed recommendations.
 *
 * - farmerLeafImageAnalysis - A function that handles the image analysis process.
 * - FarmerLeafImageAnalysisInput - The input type for the farmerLeafImageAnalysis function.
 * - FarmerLeafImageAnalysisOutput - The return type for the farmerLeafImageAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const FarmerLeafImageAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe(
      'Optional additional description from the farmer about what they observe (e.g., crop type, location).'
    ),
});
export type FarmerLeafImageAnalysisInput = z.infer<
  typeof FarmerLeafImageAnalysisInputSchema
>;

const RecommendationsSchema = z.object({
  treatmentRecommendation: z.string().describe('Actionable steps to treat the identified crop problem.'),
  urgencyLevel: z.enum(['Immediate', 'High', 'Moderate', 'Low']).describe('The recommended urgency level for addressing the problem.'),
  preventionMeasures: z.string().describe('Steps to prevent the recurrence of the crop problem.'),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer indicating that the recommendations are AI-generated and should be verified with local agricultural experts.'
    ),
});

const FarmerLeafImageAnalysisOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input image contains a plant leaf.'),
    plantType: z.string().describe('The identified type of plant (e.g., "Tomato", "Corn", "Mango").'),
    issueDetected: z.boolean().describe('Whether a disease or pest issue has been detected.'),
    issueDescription: z.string().describe('A detailed description of the identified issue, if any.'),
    severity: z.enum(['Low', 'Medium', 'High']).describe('The severity level of the detected issue.'),
    confidence: z.string().describe('The AI model\'s confidence level in the identification (e.g., "High", "Medium", "Low", or a percentage).'),
  }).describe('Identification results for the plant and any detected issues.'),
  recommendations: RecommendationsSchema.optional().describe('Detailed recommendations if an issue is detected.'),
}).describe('Output containing plant issue identification and detailed recommendations.');
export type FarmerLeafImageAnalysisOutput = z.infer<
  typeof FarmerLeafImageAnalysisOutputSchema
>;

export async function farmerLeafImageAnalysis(
  input: FarmerLeafImageAnalysisInput
): Promise<FarmerLeafImageAnalysisOutput> {
  return farmerLeafImageAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmerLeafImageAnalysisPrompt',
  input: { schema: FarmerLeafImageAnalysisInputSchema },
  output: { schema: FarmerLeafImageAnalysisOutputSchema },
  model: googleAI.model('gemini-2.5-flash-image'),
  prompt: `You are an expert agricultural AI assistant for AgriSage. Your task is to analyze a plant leaf image and provide a comprehensive analysis and recommendations.

Analyze the provided image and any accompanying description to identify potential issues.

1.  **Image validation:** If the image does not clearly show a plant leaf, set 'isPlant' to false and stop.
2.  **Identification:** If it is a plant leaf, identify the plant type, determine if any disease or pest is present, describe the issue, assess its severity (Low, Medium, High), and provide a confidence level for your analysis.
3.  **Recommendations:** If an issue is detected, provide detailed, localized recommendations. This should include:
    *   **Treatment:** Actionable steps to treat the problem.
    *   **Urgency:** An urgency level ('Immediate', 'High', 'Moderate', 'Low').
    *   **Prevention:** Steps to prevent recurrence.
    *   **Disclaimer:** A standard disclaimer to consult local experts.
    *   Consider the user's location if provided.

Input Description: {{{description}}}
Image of Leaf: {{media url=photoDataUri}}

Generate the full output according to the schema. If no issue is detected, do not include the recommendations field.`,
});

const farmerLeafImageAnalysisFlow = ai.defineFlow(
  {
    name: 'farmerLeafImageAnalysisFlow',
    inputSchema: FarmerLeafImageAnalysisInputSchema,
    outputSchema: FarmerLeafImageAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
