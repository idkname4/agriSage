'use server';
/**
 * @fileOverview A Genkit flow for analyzing an image of a plant leaf to identify potential diseases or pests.
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
      'Optional additional description from the farmer about what they observe.'
    ),
});
export type FarmerLeafImageAnalysisInput = z.infer<
  typeof FarmerLeafImageAnalysisInputSchema
>;

const FarmerLeafImageAnalysisOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the input image contains a plant leaf.'),
    plantType: z.string().describe('The identified type of plant (e.g., "Tomato", "Corn", "Mango").'),
    issueDetected: z.boolean().describe('Whether a disease or pest issue has been detected.'),
    issueDescription: z.string().describe('A detailed description of the identified issue, if any.'),
    severity: z.enum(['Low', 'Medium', 'High']).describe('The severity level of the detected issue.'),
    confidence: z.string().describe('The AI model\'s confidence level in the identification (e.g., "High", "Medium", "Low", or a percentage).'),
  }).describe('Identification results for the plant and any detected issues.'),
  recommendations: z.array(z.string()).describe('A list of initial actionable recommendations for the farmer.'),
}).describe('Output containing plant issue identification and recommendations.');
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
  model: googleAI.model('gemini-2.5-flash-image'), // Specify the image model here
  prompt: `You are an expert agricultural AI assistant specializing in plant disease and pest identification.\nAnalyze the provided image of a plant leaf and any accompanying description to identify potential issues.\n\nIf the image does not clearly show a plant leaf or is irrelevant, set 'isPlant' to false and provide a generic message.\nOtherwise, identify the plant type, determine if any disease or pest issue is present, describe it, assess its severity (Low, Medium, High), and provide a confidence level.\nFinally, offer 2-3 initial, actionable recommendations for the farmer based on your findings.\n\nInput Description: {{{description}}}\nImage of Leaf: {{media url=photoDataUri}}`,
});

const farmerLeafImageAnalysisFlow = ai.defineFlow(
  {
    name: 'farmerLeafImageAnalysisFlow',
    inputSchema: FarmerLeafImageAnalysisInputSchema,
    outputSchema: FarmerLeafImageAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input); // Call the prompt directly. It handles the model and parsing.
    return output!;
  }
);
