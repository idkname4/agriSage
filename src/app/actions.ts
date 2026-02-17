'use server';

import { z } from 'zod';
import { farmerLeafImageAnalysis, FarmerLeafImageAnalysisOutput } from '@/ai/flows/farmer-leaf-image-analysis';
import { farmerAIRecommendations, FarmerAIRecommendationsOutput } from '@/ai/flows/farmer-ai-recommendations';

const FormSchema = z.object({
  crop: z.string().optional(),
  location: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'An image is required.')
    .refine(
      (file) => file.size <= 4 * 1024 * 1024, // 4MB
      'Image size must be 4MB or less.'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .png, and .webp formats are supported.'
    ),
});

export type AnalysisState = {
  error?: string | null;
  analysisResult?: FarmerLeafImageAnalysisOutput | null;
  recommendationResult?: FarmerAIRecommendationsOutput | null;
};

export async function analyzeLeafImage(prevState: AnalysisState, formData: FormData): Promise<AnalysisState> {
  const validatedFields = FormSchema.safeParse({
    crop: formData.get('crop'),
    location: formData.get('location'),
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.image?.[0] || 'Invalid input.',
    };
  }

  const { image, crop, location } = validatedFields.data;

  try {
    const buffer = Buffer.from(await image.arrayBuffer());
    const photoDataUri = `data:${image.type};base64,${buffer.toString('base64')}`;

    const descriptionParts = [];
    if (crop) descriptionParts.push(`Crop: ${crop}`);
    if (location) descriptionParts.push(`Location: ${location}`);
    const description = descriptionParts.join(', ');

    const analysisResult = await farmerLeafImageAnalysis({
      photoDataUri,
      description,
    });

    if (!analysisResult) {
        return { error: 'Image analysis failed to produce a result.' };
    }
    
    if (!analysisResult.identification.isPlant) {
        return { analysisResult, error: 'The uploaded image does not appear to be a plant leaf. Please try another image.' };
    }

    let recommendationResult: FarmerAIRecommendationsOutput | null = null;
    if (analysisResult.identification.issueDetected) {
        recommendationResult = await farmerAIRecommendations({
            issueDescription: analysisResult.identification.issueDescription,
            cropType: analysisResult.identification.plantType || crop || '',
            location: location || '',
        });
    }

    return { analysisResult, recommendationResult };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred during analysis.' };
  }
}
