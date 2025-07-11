
"use client";

import { useState } from "react";
import { CropForm } from "@/components/crop-form";
import { RecommendationsDisplay } from "@/components/recommendations-display";
import { getRecommendations, RecommendationResult, getGardenLayout, LayoutResult, getDealers, DealerResult, getAudioForText } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { CropFormValues } from "@/components/crop-form";
import { useToast } from "@/hooks/use-toast";
import { GardenLayoutDisplay } from "@/components/garden-layout-display";
import { DealersDisplay } from "@/components/dealers-display";

const LoadingSkeletons = () => (
  <div className="mt-12 space-y-8">
    <div className="flex justify-center items-center gap-2 mb-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-center text-lg text-muted-foreground">
        Generating your personalized crop plan...
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const LayoutLoadingSkeleton = () => (
    <div className="mt-8">
         <div className="flex justify-center items-center gap-2 mb-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-center text-lg text-muted-foreground">
                Creating your visual garden map...
            </p>
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-8 gap-1">
                    {[...Array(64)].map((_, i) => (
                        <Skeleton key={i} className="aspect-square" />
                    ))}
                </div>
                 <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                 </div>
            </CardContent>
        </Card>
    </div>
)

export default function RecommendPage() {
  const [recommendations, setRecommendations] =
    useState<RecommendationResult | null>(null);
  const [layout, setLayout] = useState<LayoutResult | null>(null);
  const [dealers, setDealers] = useState<DealerResult | null>(null);
  const [formValues, setFormValues] = useState<CropFormValues | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);
  const [isDealersLoading, setIsDealersLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [responseAudioUri, setResponseAudioUri] = useState<string | null>(null);


  const { toast } = useToast();

  const handleSubmit = async (formData: CropFormValues) => {
    setIsLoading(true);
    setRecommendations(null);
    setLayout(null);
    setDealers(null);
    setFormValues(formData);
    setResponseAudioUri(null);
    
    let recommendationsResult: RecommendationResult | null = null;
    
    try {
      recommendationsResult = await getRecommendations({...formData, gardenType: 'family' });
      if (!recommendationsResult || recommendationsResult.crops.length === 0) {
        throw new Error(
          "Could not generate recommendations for the given input."
        );
      }
      setRecommendations(recommendationsResult);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }

    if (recommendationsResult) {
        setIsLayoutLoading(true);
        setIsAudioLoading(true);
        try {
            const layoutResult = await getGardenLayout({
                crops: recommendationsResult.crops.map(c => ({ 
                    name: c.name, 
                    spacing: c.plantingInfo.spacing, 
                    intercropping: c.plantingInfo.intercropping 
                })),
                landSize: formData.landSize,
                plantingLocation: formData.waterAvailability,
            });
            setLayout(layoutResult);
        } catch(e) {
            const errorMessage =
                e instanceof Error ? e.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Layout generation failed",
                description: errorMessage,
            });
            setLayout(null);
        } finally {
            setIsLayoutLoading(false);
        }

        try {
          const summaryText = `${recommendationsResult.overallRationale} I recommend planting: ${recommendationsResult.crops.map(c => c.name).join(', ')}.`;
          const audioResult = await getAudioForText({ text: summaryText });
          setResponseAudioUri(audioResult.audioDataUri);
        } catch (e) {
          console.error("Failed to generate audio response", e);
        } finally {
          setIsAudioLoading(false);
        }
    }
  };

  const handleFindDealers = async () => {
    if (!formValues) return;
    setIsDealersLoading(true);
    setDealers(null);
    try {
        const dealersResult = await getDealers(formValues.region);
        setDealers(dealersResult);
    } catch (e) {
        const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Could not find dealers",
            description: errorMessage,
        });
    } finally {
        setIsDealersLoading(false);
    }
  }

  return (
    <>
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
          Recommendations for your Family
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get intelligent crop recommendations tailored to your family's needs.
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <CropForm onSubmit={handleSubmit} isLoading={isLoading || isLayoutLoading || isDealersLoading} />
      </div>

      {isLoading && <LoadingSkeletons />}

      {recommendations && !isLoading && (
        <div className="mt-16">
          <RecommendationsDisplay
            data={recommendations}
            formValues={formValues}
            onFindDealers={handleFindDealers}
            isDealersLoading={isDealersLoading}
            dealersFound={!!dealers}
            audioDataUri={responseAudioUri}
            isAudioLoading={isAudioLoading}
          />
          {isLayoutLoading && <LayoutLoadingSkeleton />}
          {layout && !isLayoutLoading && <GardenLayoutDisplay data={layout} />}
          {isDealersLoading && (
             <div className="flex justify-center items-center gap-2 mt-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-center text-lg text-muted-foreground">
                    Searching for local agro-dealers...
                </p>
            </div>
          )}
          {dealers && <DealersDisplay dealers={dealers} />}
        </div>
      )}
    </>
  );
}
