import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, Camera, ArrowRight } from 'lucide-react';

export default function PlannerHubPage() {
  return (
    <main className="container mx-auto px-4 py-12 md:py-20">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary mb-2">
          Garden Planner
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose a tool below to start planning your thriving garden.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/planner/recommend" className="group">
          <Card className="h-full border-2 border-transparent group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex-row items-center gap-4">
              <div className="bg-accent/20 text-accent rounded-full p-4">
                <Leaf className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">Crop Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                Get personalized crop suggestions based on your location, family size, and dietary needs. Find out what grows best for you.
              </CardDescription>
              <div className="flex items-center font-semibold text-accent">
                Start Planning <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/planner/snap" className="group">
          <Card className="h-full border-2 border-transparent group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex-row items-center gap-4">
               <div className="bg-accent/20 text-accent rounded-full p-4">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">Snap My Garden</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                Upload a photo of your garden to get instant, AI-powered feedback on its health and actionable tips for improvement.
              </CardDescription>
              <div className="flex items-center font-semibold text-accent">
                Get Feedback <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
