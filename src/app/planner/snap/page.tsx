
"use client";

import { SnapMyGarden } from "@/components/snap-my-garden";

export default function SnapPage() {
  return (
    <>
      <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">
            Snap My Garden
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get instant, AI-powered feedback on your garden's health.
            </p>
      </header>
      <div className="max-w-3xl mx-auto">
        <SnapMyGarden />
      </div>
    </>
  );
}
