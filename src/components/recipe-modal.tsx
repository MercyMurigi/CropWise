"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRecipe, RecipeResult, getAudioForText, AudioResult } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Play, Pause, ChefHat, Info } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface RecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropName: string;
  nutritionContext: string;
}

const RecipeLoadingSkeleton = () => (
    <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
         <div className="space-y-2 pt-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
)

export function RecipeModal({ open, onOpenChange, cropName, nutritionContext }: RecipeModalProps) {
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [audio, setAudio] = useState<AudioResult | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && cropName) {
      setIsLoadingRecipe(true);
      setRecipe(null);
      setAudio(null);
      setIsPlaying(false);
      
      const fetchRecipe = async () => {
        try {
          const result = await getRecipe({ cropName, context: nutritionContext });
          setRecipe(result);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Could not load recipe.";
          toast({ variant: 'destructive', title: 'Error', description: errorMessage });
          onOpenChange(false);
        } finally {
          setIsLoadingRecipe(false);
        }
      };
      fetchRecipe();
    }
  }, [open, cropName, nutritionContext, toast, onOpenChange]);
  
  const handlePlayAudio = async () => {
    if (audio?.audioDataUri && audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    } else if (recipe?.fullTextForAudio && !isLoadingAudio) {
        setIsLoadingAudio(true);
        try {
            const audioResult = await getAudioForText({ text: recipe.fullTextForAudio });
            setAudio(audioResult);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Could not generate audio.";
            toast({ variant: 'destructive', title: 'Error', description: errorMessage });
        } finally {
            setIsLoadingAudio(false);
        }
    }
  }

  useEffect(() => {
    if(audio?.audioDataUri && audioRef.current) {
        audioRef.current.src = audio.audioDataUri;
        audioRef.current.play();
    }
  }, [audio])
  
  const handlePrint = () => {
    const printContent = document.getElementById('recipe-print-content');
    if (printContent) {
      const newWindow = window.open('', '', 'height=600,width=800');
      if(newWindow) {
        newWindow.document.write('<html><head><title>Print Recipe</title>');
        newWindow.document.write('<style>body{font-family:sans-serif;} h1{font-size:1.5rem} h2{font-size:1.2rem} ul, ol{padding-left: 20px;} </style>');
        newWindow.document.write('</head><body>');
        newWindow.document.write(printContent.innerHTML);
        newWindow.document.write('</body></html>');
        newWindow.document.close();
        newWindow.print();
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-3xl text-primary">
            <ChefHat className="h-8 w-8" />
            <span>Recipe Corner</span>
          </DialogTitle>
          <DialogDescription>
            A simple, healthy recipe for {cropName}.
          </DialogDescription>
        </DialogHeader>

        {isLoadingRecipe ? (
          <RecipeLoadingSkeleton />
        ) : recipe ? (
          <div className="space-y-6" id="recipe-print-content">
             <div>
                <h1 className="text-2xl font-bold text-foreground">{recipe.title}</h1>
                <p className="text-muted-foreground">{recipe.description}</p>
             </div>
             
             <div>
                <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                <ul className="list-disc list-inside space-y-1 text-foreground/90">
                    {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
             </div>

             <div>
                <h2 className="text-xl font-semibold mb-2">Instructions</h2>
                <ol className="list-decimal list-inside space-y-2 text-foreground/90">
                    {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
             </div>
          </div>
        ) : (
            <div className="text-center py-8 text-muted-foreground">
                <Info className="mx-auto h-8 w-8 mb-2" />
                No recipe could be loaded.
            </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handlePlayAudio} disabled={isLoadingAudio || isLoadingRecipe || !recipe} className="flex-1">
            {isLoadingAudio ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : isPlaying ? (
              <Pause className="mr-2" />
            ) : (
              <Play className="mr-2" />
            )}
            {isPlaying ? 'Pause' : 'Play Audio'}
          </Button>
          <Button onClick={handlePrint} variant="outline" disabled={isLoadingRecipe || !recipe}>
            <Printer className="mr-2" /> Print
          </Button>
        </div>
        <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
