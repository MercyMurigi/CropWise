
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
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  return (
    <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          Plan Your Garden
        </CardTitle>
        <CardDescription>
            Fill in the details below to get personalized crop recommendations.
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
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
