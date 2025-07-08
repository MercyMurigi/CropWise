
"use client";

import { useState } from "react";
import { CropForm } from "@/components/crop-form";
import { RecommendationsDisplay } from "@/components/recommendations-display";
import { getRecommendations, RecommendationResult, getGardenLayout, LayoutResult, getDealers, DealerResult, getTrainingGuide, TrainingGuideResult } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { CropFormValues } from "@/components/crop-form";
import { useToast } from "@/hooks/use-toast";
import { GardenLayoutDisplay } from "@/components/garden-layout-display";
import { DealersDisplay } from "@/components/dealers-display";
import { TrainingGuideDisplay } from "@/components/training-guide-display";

const LoadingSkeletons = () => (
  <div className="mt-12 space-y-8">
    <div className="flex justify-center items-center gap-2 mb-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-center text-lg text-muted-foreground">
        Generating your group's crop plan...
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

export default function CommunityRecommendPage() {
  const [recommendations, setRecommendations] =
    useState<RecommendationResult | null>(null);
  const [layout, setLayout] = useState<LayoutResult | null>(null);
  const [dealers, setDealers] = useState<DealerResult | null>(null);
  const [trainingGuide, setTrainingGuide] = useState<TrainingGuideResult | null>(null);
  const [formValues, setFormValues] = useState<CropFormValues | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);
  const [isDealersLoading, setIsDealersLoading] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);


  const { toast } = useToast();

  const handleSubmit = async (formData: CropFormValues) => {
    setIsLoading(true);
    setRecommendations(null);
    setLayout(null);
    setDealers(null);
    setTrainingGuide(null);
    setFormValues(formData);
    
    let recommendationsResult: RecommendationResult | null = null;
    
    try {
      recommendationsResult = await getRecommendations({...formData, gardenType: 'community' });
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

  const handleGenerateGuide = async () => {
    if (!recommendations || !formValues) return;
    setIsGuideLoading(true);
    setTrainingGuide(null);
    try {
        const guideResult = await getTrainingGuide({
            crops: recommendations.crops.map(c => c.name),
            gardenType: 'community',
        });
        setTrainingGuide(guideResult);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Could not generate guide",
            description: errorMessage,
        });
    } finally {
        setIsGuideLoading(false);
    }
  }

  return (
    <>
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
          Community & School Garden Planner
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Design nutrition gardens for groups and generate printable training materials.
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <CropForm onSubmit={handleSubmit} isLoading={isLoading || isLayoutLoading || isDealersLoading || isGuideLoading} isCommunity={true} />
      </div>

      {isLoading && <LoadingSkeletons />}

      {recommendations && !isLoading && (
        <div className="mt-16">
          <RecommendationsDisplay
            data={recommendations}
            onFindDealers={handleFindDealers}
            isDealersLoading={isDealersLoading}
            dealersFound={!!dealers}
            gardenType={'community'}
            onGenerateGuide={handleGenerateGuide}
            isGuideLoading={isGuideLoading}
            guideGenerated={!!trainingGuide}
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
          {isGuideLoading && (
            <div className="flex justify-center items-center gap-2 mt-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-center text-lg text-muted-foreground">
                    Generating your training guide...
                </p>
            </div>
          )}
          {trainingGuide && !isGuideLoading && <TrainingGuideDisplay data={trainingGuide} />}
        </div>
      )}
    </>
  );
}
