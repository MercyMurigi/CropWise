import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Leaf, Users, Camera, ArrowRight } from 'lucide-react';

export default function PlannerHubPage() {
  return (
    <>
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary mb-2 opacity-0 animate-fade-in-up">
          Garden Planner
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Choose a tool below to start planning your thriving garden.
        </p>
      </header>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Link 
            href="/planner/recommend" 
            className="group opacity-0 animate-fade-in-up" 
            style={{ animationDelay: '0.2s' }}
        >
          <Card className="h-full border-2 border-transparent group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex-row items-center gap-4">
              <div className="bg-accent/20 text-accent rounded-full p-4">
                <Leaf className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">For My Family</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                Get personalized crop suggestions based on your location, family size, and dietary needs.
              </CardDescription>
              <div className="flex items-center font-semibold text-accent">
                Start Planning <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link 
            href="/planner/community" 
            className="group opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
        >
          <Card className="h-full border-2 border-transparent group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex-row items-center gap-4">
              <div className="bg-accent/20 text-accent rounded-full p-4">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="font-headline text-3xl">For My Community</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base mb-4">
                Design nutrition gardens for schools or groups. Generate bulk crop plans and printable training materials.
              </CardDescription>
              <div className="flex items-center font-semibold text-accent">
                Plan for a Group <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link 
            href="/planner/snap" 
            className="group opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
        >
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
                Upload a photo of your garden to get instant, AI-powered feedback and actionable tips for improvement.
              </CardDescription>
              <div className="flex items-center font-semibold text-accent">
                Get Feedback <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
}
