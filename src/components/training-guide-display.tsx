"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TrainingGuideResult } from "@/app/actions";
import { Printer } from "lucide-react";

export function TrainingGuideDisplay({ data }: { data: TrainingGuideResult }) {
  return (
    <div className="mt-8 printable-guide-container">
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <CardTitle className="font-headline text-3xl">Your Training Guide</CardTitle>
                    <CardDescription>A printable guide for your garden. Click the print button to get a physical copy.</CardDescription>
                </div>
                 <Button variant="outline" className="print-button ml-4" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" /> Print Guide
                </Button>
            </div>
        </CardHeader>
        <div id="guide-content">
            <CardContent className="space-y-8">
                <div className="text-center pt-8">
                    <h2 className="font-headline text-4xl text-primary">{data.title}</h2>
                    <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">{data.introduction}</p>
                </div>

                {data.sections.map((section, index) => (
                    <div key={index} className="break-after-page">
                        <h3 className="font-headline text-2xl text-primary mb-4 border-b pb-2">{section.cropName}</h3>
                        <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: section.content }}/>
                    </div>
                ))}
                
                <div className="pt-4">
                    <h3 className="font-headline text-2xl text-primary mb-2 border-b pb-2">Conclusion</h3>
                    <p className="text-muted-foreground">{data.conclusion}</p>
                </div>
            </CardContent>
        </div>
      </Card>
      <style jsx global>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #guide-content, #guide-content * {
                visibility: visible;
            }
            #guide-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 1rem;
            }
            .print-button {
                display: none;
            }
            @page {
                size: auto;
                margin: 0.5in;
            }
            .break-after-page {
                page-break-after: always;
            }
        }
      `}</style>
    </div>
  );
}
