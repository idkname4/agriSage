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
    urgencyLevel: z.enum(['Immediate Action Required', 'High', 'Moderate', 'Low']).describe('The recommended urgency level for addressing the problem.'),
    immediateFix: z.string().optional().describe('A concise, immediate action the farmer should take to mitigate the problem.'),
    organicTreatment: z.string().describe('Recommended organic treatment methods to address the issue.'),
    chemicalTreatment: z.string().describe('Recommended chemical treatment methods, including specific product types if appropriate.'),
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
    issueType: z.enum(['Disease', 'Pest', 'Nutrient Deficiency', 'Other', 'Healthy']).describe('The general category of the detected issue. If no issue, set to "Healthy".'),
    issueName: z.string().describe('The specific name of the disease, pest, or deficiency (e.g., "Early Blight", "Aphids", "Nitrogen Deficiency"). Set to "None" if no issue is detected.'),
    diseaseStage: z.string().optional().describe('If a disease is detected, specify its stage (e.g., "Early", "Advanced", "Fruiting Body Formation").'),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The severity level of the detected issue. Set to "Low" if healthy.'),
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
  prompt: `You are an expert agricultural AI assistant for AgriSage. Your task is to analyze a plant leaf image and provide a comprehensive analysis and recommendations for farmers.

Analyze the provided image and any accompanying description to identify potential issues.

1.  **Image validation:** If the image does not clearly show a plant leaf, set 'isPlant' to false and provide a brief explanation in 'issueName', then stop.
2.  **Identification:** If it is a plant leaf:
    *   Identify the plant type.
    *   Determine if a disease, pest, or nutrient deficiency is present. Set 'issueDetected' accordingly.
    *   If an issue is found, classify it under 'issueType' as 'Disease', 'Pest', 'Nutrient Deficiency', or 'Other'. If the plant is healthy, set 'issueType' to 'Healthy'.
    *   Provide the specific 'issueName' (e.g., "Early Blight", "Aphids", "Nitrogen Deficiency"). If healthy, set to "Healthy Plant".
    *   If it's a disease, specify the 'diseaseStage' if visible (e.g., "Early", "Advanced").
    *   Assess the 'severity' ('Low', 'Medium', 'High', 'Critical'). If healthy, severity is 'Low'.
    *   Provide a 'confidence' level for your analysis.
3.  **Recommendations:** If an issue is detected ('issueDetected' is true), provide detailed, localized recommendations. This must include:
    *   **Urgency:** An urgency level ('Immediate Action Required', 'High', 'Moderate', 'Low').
    *   **Immediate Fix:** A concise, immediate action the farmer should take.
    *   **Organic Treatment:** Recommended organic treatment methods.
    *   **Chemical Treatment:** Recommended chemical treatment methods.
    *   **Prevention:** Steps to prevent recurrence.
    *   **Disclaimer:** A standard disclaimer to consult local experts.
    *   Consider the user's location if provided in the description.

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
