'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { analyzeLeafImage, AnalysisState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, UploadCloud, Leaf, Droplets, Shield, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState: AnalysisState = {
  error: null,
  analysisResult: null,
  recommendationResult: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Analyze Image
    </Button>
  );
}

export function ImageAnalysisForm() {
  const [state, formAction] = useFormState(analyzeLeafImage, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: state.error,
      });
    }
    if(state.analysisResult || state.recommendationResult) {
        formRef.current?.reset();
        setPreviewUrl(null);
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Upload Leaf Image</CardTitle>
          <CardDescription>
            Select an image of a plant leaf for analysis. You can also provide crop and location details for more accurate recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-primary/50 bg-card hover:bg-muted transition-colors"
              >
                {previewUrl ? (
                  <Image src={previewUrl} alt="Image preview" width={256} height={256} className="object-contain h-full w-full p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (MAX. 4MB)</p>
                  </div>
                )}
              </Label>
              <Input
                id="image-upload"
                name="image"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Crop Type (Optional)</Label>
                <Input id="crop" name="crop" placeholder="e.g., Tomato, Corn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <div className="relative">
                  <Input id="location" name="location" placeholder="e.g., Punjab, India" />
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-muted-foreground animate-pulse hover:bg-transparent">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {state.analysisResult ? (
          <Card className="bg-gradient-to-br from-card to-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Leaf className="text-accent" />Identification Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="font-medium text-muted-foreground">Plant Type</p><p>{state.analysisResult.identification.plantType}</p></div>
                <div><p className="font-medium text-muted-foreground">Confidence</p><p>{state.analysisResult.identification.confidence}</p></div>
                <div><p className="font-medium text-muted-foreground">Issue Detected</p><p className={state.analysisResult.identification.issueDetected ? 'text-destructive' : 'text-green-600'}>{state.analysisResult.identification.issueDetected ? 'Yes' : 'No'}</p></div>
                <div><p className="font-medium text-muted-foreground">Severity</p><p>{state.analysisResult.identification.severity || 'N/A'}</p></div>
              </div>
              {state.analysisResult.identification.issueDetected && (
                <div>
                  <p className="font-medium text-muted-foreground">Issue Description</p>
                  <p className="text-sm">{state.analysisResult.identification.issueDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
            <Card className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]">
              <CardContent>
                  <Leaf className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Ready for Analysis</h3>
                  <p className="text-muted-foreground/80">Your analysis results will appear here.</p>
              </CardContent>
            </Card>
        )}

        {state.recommendationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Droplets className="text-primary" />AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-1"><Clock className="w-4 h-4"/>Urgency Level</h3>
                    <p className="text-sm font-bold text-primary">{state.recommendationResult.urgencyLevel}</p>
                </div>
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-1"><Droplets className="w-4 h-4"/>Treatment</h3>
                    <p className="text-sm leading-relaxed">{state.recommendationResult.treatmentRecommendation}</p>
                </div>
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-1"><Shield className="w-4 h-4"/>Prevention</h3>
                    <p className="text-sm leading-relaxed">{state.recommendationResult.preventionMeasures}</p>
                </div>
                <Alert variant="default" className="bg-accent/10">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent">Disclaimer</AlertTitle>
                    <AlertDescription className="text-accent-foreground/80">
                    {state.recommendationResult.disclaimer}
                    </AlertDescription>
                </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
