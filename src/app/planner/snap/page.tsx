
"use client";

import { SnapMyGarden } from "@/components/snap-my-garden";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SnapPage() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="mb-8">
            <Button asChild variant="outline">
            <Link href="/planner">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Planner
            </Link>
            </Button>
        </div>
        <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary mb-2">
            Snap My Garden
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get instant, AI-powered feedback on your garden's health.
            </p>
      </header>
      <div className="max-w-3xl mx-auto">
        <SnapMyGarden />
      </div>
    </main>
  );
}
