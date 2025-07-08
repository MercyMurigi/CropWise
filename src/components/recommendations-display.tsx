
"use client";

import { useState, useRef, useEffect } from "react";
import type { RecommendationResult } from "@/app/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sprout, Info, Dna, ShoppingCart, MapPin, Loader2, BookOpenCheck, FileText, Utensils, Volume2, Pause, Square, Package, CalendarDays, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import type { CropFormValues } from "./crop-form";
import { nutritionBaskets } from "./crop-form";
import { RecipeModal } from "./recipe-modal";

interface RecommendationsDisplayProps {
  data: RecommendationResult;
  formValues: CropFormValues | null;
  onFindDealers: () => void;
  isDealersLoading: boolean;
  dealersFound: boolean;
  gardenType?: 'family' | 'community';
  onGenerateGuide?: () => void;
  isGuideLoading?: boolean;
  guideGenerated?: boolean;
  audioDataUri: string | null;
  isAudioLoading: boolean;
}

export function RecommendationsDisplay({ 
  data, 
  formValues,
  onFindDealers, 
  isDealersLoading, 
  dealersFound, 
  gardenType, 
  onGenerateGuide, 
  isGuideLoading, 
  guideGenerated,
  audioDataUri,
  isAudioLoading
}: RecommendationsDisplayProps) {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (audioDataUri && a) {
        a.src = audioDataUri;
        a.play().catch(e => console.error("Audio autoplay failed.", e));
    }
  }, [audioDataUri]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
    } else {
      a.play();
    }
  }

  return (
    <section className="space-y-12">
      <div>
        <div className="flex justify-center items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center text-primary">
            {gardenType === 'community' ? 'Your Community Garden Plan' : 'Your Personalized Crop Plan'}
          </h2>
          {(isAudioLoading || audioDataUri) && (
              <Button size="icon" variant="outline" onClick={togglePlay} disabled={isAudioLoading} title={isPlaying ? "Pause summary" : "Play summary"}>
                  {isAudioLoading ? <Loader2 className="animate-spin" /> : (isPlaying ? <Pause/> : <Volume2/>)}
              </Button>
          )}
        </div>
        <p className="mt-2 text-center text-lg text-muted-foreground max-w-3xl mx-auto">
          {data.overallRationale}
        </p>
      </div>

       {gardenType === 'community' && (
        <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Bulk Planning Details</CardTitle>
            <CardDescription>Key metrics for planning your community or school garden.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-background rounded-lg">
              <Square className="mx-auto h-8 w-8 text-accent mb-2"/>
              <h4 className="font-bold text-lg">Area Required</h4>
              <p className="text-xl text-primary font-semibold">{data.areaRequired}</p>
            </div>
             <div className="p-4 bg-background rounded-lg">
              <TrendingUp className="mx-auto h-8 w-8 text-accent mb-2"/>
              <h4 className="font-bold text-lg">Est. Weekly Yield</h4>
              <p className="text-xl text-primary font-semibold">{data.estimatedWeeklyYield}</p>
            </div>
            <div className="p-4 bg-background rounded-lg">
                <Package className="mx-auto h-8 w-8 text-accent mb-2"/>
                <h4 className="font-bold text-lg">Seed Quantities</h4>
                <ul className="text-sm text-muted-foreground">
                    {data.seedQuantities?.map(s => <li key={s.cropName}>{s.cropName}: {s.quantity}</li>)}
                </ul>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <CalendarDays className="mx-auto h-8 w-8 text-accent mb-2"/>
              <h4 className="font-bold text-lg">Planting Schedule</h4>
              <p className="text-sm text-muted-foreground">{data.plantingSchedule}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.crops.map((crop) => (
          <Card key={crop.name} className="flex flex-col bg-card/50 hover:bg-card/100 transition-colors duration-300 overflow-hidden">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={crop.imageDataUri}
                alt={`Image of ${crop.name}`}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{crop.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col pt-0">
              <p className="text-muted-foreground flex-grow mb-4">{crop.rationale}</p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-base font-bold hover:no-underline text-primary/80">
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
             <CardFooter className="p-4 pt-0 mt-auto border-t">
                <Button variant="ghost" className="w-full text-primary hover:bg-primary/10" onClick={() => setSelectedCrop(crop.name)}>
                    <Utensils className="mr-2 h-4 w-4"/> View Recipe
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div>
          <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5 text-center">
            <CardHeader>
                <div className="mx-auto bg-accent/20 text-accent rounded-full p-3 w-fit mb-2">
                    <ShoppingCart className="h-6 w-6" />
                </div>
                <CardTitle className="font-headline text-3xl">
                    Get Your Seed Bundles
                </CardTitle>
                <CardDescription>
                    Ready to start planting? Order your recommended seeds online or find a local dealer.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" disabled>
                    <ShoppingCart className="mr-2" /> Order for Delivery (Coming Soon)
                </Button>
                <Button size="lg" variant="secondary" onClick={onFindDealers} disabled={isDealersLoading || dealersFound}>
                    {isDealersLoading ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <MapPin className="mr-2" />
                    )}
                    {dealersFound ? 'Dealers Found Below' : 'Find a Local Dealer'}
                </Button>
            </CardContent>
          </Card>
      </div>

      {gardenType === 'community' && onGenerateGuide && (
        <div>
            <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5 text-center">
                <CardHeader>
                    <div className="mx-auto bg-accent/20 text-accent rounded-full p-3 w-fit mb-2">
                        <BookOpenCheck className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline text-3xl">
                        Community &amp; School Garden Resources
                    </CardTitle>
                    <CardDescription>
                        Generate printable training guides and resources for your group.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" onClick={onGenerateGuide} disabled={isGuideLoading || guideGenerated}>
                        {isGuideLoading ? (
                            <Loader2 className="mr-2 animate-spin" />
                        ) : (
                            <FileText className="mr-2" />
                        )}
                        {guideGenerated ? 'Guide Generated Below' : 'Generate Training Guide'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}

      {formValues && <RecipeModal
        open={!!selectedCrop}
        onOpenChange={(isOpen) => !isOpen && setSelectedCrop(null)}
        cropName={selectedCrop || ''}
        nutritionContext={nutritionBaskets[formValues.dietaryNeeds]}
      />}

      <audio ref={audioRef} className="hidden" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
    </section>
  );
}
