"use client";

import type { RecommendationResult } from "@/app/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sprout, Info, Dna } from "lucide-react";

interface RecommendationsDisplayProps {
  data: RecommendationResult;
}

const getIconForCrop = (cropName: string) => {
  // This can be expanded to return different icons based on crop type
  return <Sprout className="h-8 w-8 text-primary" />;
};

export function RecommendationsDisplay({ data }: RecommendationsDisplayProps) {
  return (
    <section className="space-y-12">
      <div>
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-center text-primary">
          Your Personalized Crop Plan
        </h2>
        <p className="mt-2 text-center text-lg text-muted-foreground max-w-3xl mx-auto">
          {data.overallRationale}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.crops.map((crop) => (
          <Card key={crop.name} className="flex flex-col bg-card/50 hover:bg-card/100 transition-colors duration-300">
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
              {getIconForCrop(crop.name)}
              <div className="flex-1">
                <CardTitle className="font-headline text-2xl">{crop.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-muted-foreground flex-grow mb-4">{crop.rationale}</p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-base font-bold hover:no-underline">
                    Planting Guide
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2 text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <strong>Spacing:</strong> {crop.plantingInfo.spacing}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Dna className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <strong>Maturity:</strong> {crop.plantingInfo.maturity}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sprout className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <strong>Intercropping:</strong> {crop.plantingInfo.intercropping}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
