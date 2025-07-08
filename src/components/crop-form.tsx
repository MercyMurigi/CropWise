
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mic, MicOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseQueryForForm } from "@/app/actions";

export const nutritionBaskets = {
  general: "General Nutrition",
  iron_rich: "Iron-Rich Boost",
  vitamin_a: "Vitamin A Boost",
  child_health: "Child Health (U5)",
  maternal_health: "Maternal Health"
};

const formSchema = z.object({
  landSize: z.string().min(1, "Land size is required."),
  region: z.string().min(1, "Region or county is required."),
  familySize: z.coerce.number().min(1, "Size must be at least 1."),
  dietaryNeeds: z.enum(Object.keys(nutritionBaskets) as [keyof typeof nutritionBaskets, ...(keyof typeof nutritionBaskets)[]]),
  waterAvailability: z.enum(["rainfed", "irrigated", "sack/bag garden", "balcony garden"]),
});

export type CropFormValues = z.infer<typeof formSchema>;

interface CropFormProps {
  onSubmit: (values: CropFormValues) => void;
  isLoading: boolean;
  isCommunity?: boolean;
}

export function CropForm({ onSubmit, isLoading, isCommunity = false }: CropFormProps) {
  const form = useForm<CropFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      landSize: "",
      region: "",
      familySize: isCommunity ? 20 : 1,
      dietaryNeeds: "general",
      waterAvailability: "rainfed",
    },
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = async (event) => {
        const query = event.results[0][0].transcript;
        toast({ title: "Thinking...", description: `You said: "${query}"` });
        
        try {
            const parsedData = await parseQueryForForm(query);
            for (const [key, value] of Object.entries(parsedData)) {
                if (value !== undefined) {
                    form.setValue(key as keyof CropFormValues, value as any);
                }
            }
            toast({
                title: "Form Updated!",
                description: "I've filled in the form with what I understood. Please review and submit.",
            });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Could not process your request.";
            toast({ variant: 'destructive', title: 'Sorry, I had trouble understanding.', description: errorMessage });
        } finally {
            setIsListening(false);
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({ variant: 'destructive', title: 'Speech Recognition Error', description: event.error });
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

  }, [form, toast]);

  const handleMicClick = () => {
      if (!recognitionRef.current) {
          toast({
              variant: 'destructive',
              title: 'Not Supported',
              description: 'Voice input is not supported on your browser.',
          });
          return;
      }
      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };


  return (
    <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Plan Your Garden
        </CardTitle>
        <CardDescription>
            Fill in the details below or use the microphone to get personalized crop recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="landSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 50 sq meters" {...field} />
                    </FormControl>
                    <FormDescription>
                      The area you have for planting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region / County</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nakuru County" {...field} />
                    </FormControl>
                    <FormDescription>Your geographical location.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="familySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isCommunity ? 'Group Size' : 'Family Size'}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="e.g., 5" {...field} />
                    </FormControl>
                    <FormDescription>Number of people to feed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waterAvailability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planting Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rainfed">On Ground (Rain-fed)</SelectItem>
                        <SelectItem value="irrigated">On Ground (Irrigated)</SelectItem>
                        <SelectItem value="sack/bag garden">
                          Sack/Bag Garden
                        </SelectItem>
                        <SelectItem value="balcony garden">
                          Balcony Garden
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Where you will be planting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dietaryNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nutrition Goal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a nutrition goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(nutritionBaskets).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a nutritional focus for your garden.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-stretch gap-4">
              <Button
                type="submit"
                disabled={isLoading || isListening}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Get Recommendations"
                )}
              </Button>
               {!isCommunity && <Button 
                  type="button" 
                  size="icon" 
                  variant={isListening ? "destructive" : "outline"} 
                  onClick={handleMicClick} 
                  title="Use Voice Input"
                  disabled={isLoading}
                  className="w-16 h-auto"
              >
                  {isListening ? <MicOff className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6" />}
              </Button>}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
