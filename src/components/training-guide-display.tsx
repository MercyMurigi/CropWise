"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TrainingGuideResult } from "@/app/actions";
import { Printer, Sparkles } from "lucide-react";

export function TrainingGuideDisplay({ data }: { data: TrainingGuideResult }) {
  
  const handlePrint = () => {
    // Temporarily add a class to body to apply print-specific styles from globals.css
    document.body.classList.add('printing-guide');
    window.print();
    // Remove the class after printing dialog is closed
    setTimeout(() => document.body.classList.remove('printing-guide'), 1);
  };
  
  return (
    <div className="mt-8 printable-guide-container">
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <CardTitle className="font-headline text-3xl">Your Training Guide</CardTitle>
                    <CardDescription>A printable guide for your garden. Click the print button to get a physical copy.</CardDescription>
                </div>
                 <Button variant="outline" className="print-button ml-4" onClick={handlePrint}>
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

                {data.poster && (
                    <div className="break-inside-avoid my-8">
                        <Card className="bg-accent/10 border-accent border-2">
                           <CardHeader className="text-center">
                                <Sparkles className="mx-auto h-8 w-8 text-accent mb-2" />
                                <CardTitle className="font-headline text-3xl text-accent">{data.poster.title}</CardTitle>
                           </CardHeader>
                           <CardContent>
                                <p className="text-center text-accent-foreground/80 text-lg">{data.poster.body}</p>
                           </CardContent>
                        </Card>
                    </div>
                )}

                {data.sections.map((section, index) => (
                    <div key={index} className="break-inside-avoid pt-6">
                        <h3 className="font-headline text-2xl text-primary mb-4 border-b pb-2">{section.cropName}</h3>
                        <div className="prose prose-sm max-w-none text-foreground/90" 
                             dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />').replace(/\*(.*?)\*/g, '<li>$1</li>').replace(/(\*\*.*?\*\*)/g, '<strong>$1</strong>') }} />
                    </div>
                ))}
                
                <div className="pt-8 mt-8 border-t">
                    <h3 className="font-headline text-2xl text-primary mb-2">Conclusion</h3>
                    <p className="text-muted-foreground">{data.conclusion}</p>
                </div>
            </CardContent>
        </div>
      </Card>
       <style jsx global>{`
        @media print {
            body > *:not(.printable-guide-container) {
                display: none;
            }
            .printable-guide-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
            main {
                padding: 0 !important;
            }
            #guide-content {
                visibility: visible;
                padding: 0;
            }
             .print-button, header, .back-button {
                display: none !important;
            }
            .break-inside-avoid {
                page-break-inside: avoid;
            }
             @page {
                size: auto;
                margin: 0.75in;
            }
        }
      `}</style>
    </div>
  );
}
