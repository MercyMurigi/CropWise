"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Phone, Store } from "lucide-react";
import type { DealerResult } from "@/app/actions";

interface DealersDisplayProps {
  dealers: DealerResult;
}

export function DealersDisplay({ dealers }: DealersDisplayProps) {
  return (
    <div className="mt-8">
        <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-accent/20 text-accent rounded-full p-3 w-fit">
                        <Store className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                        <CardTitle className="font-headline text-3xl">Local Agro-Dealers</CardTitle>
                        <CardDescription>Here are some dealers near you where you might find your seeds.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dealers.map((dealer, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-background">
                            <h4 className="font-bold text-lg">{dealer.name}</h4>
                            <div className="text-muted-foreground text-sm mt-2 space-y-1">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                                    <span>{dealer.location}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                                    <span>{dealer.phone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
