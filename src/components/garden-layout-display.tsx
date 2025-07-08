"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LayoutResult } from "@/app/actions";

interface GardenLayoutDisplayProps {
  data: LayoutResult;
}

const getCellColor = (crop: string, legend: Record<string, string>) => {
    if (crop === 'empty') {
        return 'bg-muted/30';
    }
    const color = legend[crop] || 'primary';
    const colorMap: Record<string, string> = {
        green: 'bg-green-500',
        darkgreen: 'bg-green-700',
        lightgreen: 'bg-green-300',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-400',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        brown: 'bg-amber-800',
        primary: 'bg-primary'
    };
    return colorMap[color.toLowerCase()] || 'bg-primary';
}

export function GardenLayoutDisplay({ data }: GardenLayoutDisplayProps) {
  const { layout, description, legend } = data;

  if (!layout || layout.length === 0) {
    return null;
  }

  const gridCols = layout[0]?.length || 1;

  return (
    <Card className="mt-8 border-2 border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Visual Garden Layout</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                {layout.flat().map((cell, index) => (
                    <div key={index} className="aspect-square flex items-center justify-center rounded-sm p-1" title={cell !== 'empty' ? cell : 'Empty'}>
                       <div className={`w-full h-full rounded-sm ${getCellColor(cell, legend)}`}></div>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {Object.entries(legend).map(([crop, color]) => (
                    <div key={crop} className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded ${getCellColor(crop, legend)}`}></div>
                        <span className="text-sm font-medium">{crop}</span>
                    </div>
                ))}
                 <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted/30"></div>
                    <span className="text-sm font-medium">Empty</span>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
