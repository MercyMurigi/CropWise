
"use client";

import { useState } from "react";
import { CropForm } from "@/components/crop-form";
import { RecommendationsDisplay } from "@/components/recommendations-display";
import { getRecommendations, RecommendationResult, getGardenLayout, LayoutResult } from "@/app/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { CropFormValues } from "@/components/crop-form";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GardenLayoutDisplay } from "@/components/garden-layout-display";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: CropFormValues) => {
    setIsLoading(true);
    setRecommendations(null);
    setLayout(null);
    try {
      const result = await getRecommendations(formData);
      if (!result || result.crops.length === 0) {
        throw new Error(
          "Could not generate recommendations for the given input."
        );
      }
      setRecommendations(result);
      
      setIsLayoutLoading(true);
      const layoutResult = await getGardenLayout({
          crops: result.crops.map(c => ({ 
              name: c.name, 
              spacing: c.plantingInfo.spacing, 
              intercropping: c.plantingInfo.intercropping 
            })),
          landSize: formData.landSize,
          plantingLocation: formData.waterAvailability,
      });
      setLayout(layoutResult);

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
      setIsLayoutLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/planner">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Planner
          </Link>
        </Button>
      </div>

      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary mb-2">
          Crop Recommendations
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI partner for a healthier harvest. Get intelligent crop
          recommendations tailored to your needs.
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <CropForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {isLoading && <LoadingSkeletons />}

      {recommendations && (
        <div className="mt-16">
          <RecommendationsDisplay data={recommendations} />
          {isLayoutLoading && <LayoutLoadingSkeleton />}
          {layout && <GardenLayoutDisplay data={layout} />}
        </div>
      )}
    </main>
  );
}
