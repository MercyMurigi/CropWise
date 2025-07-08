import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
       <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary mb-2">
          Garden Planner
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose a tool below to start planning your thriving garden.
        </p>
      </header>
      {children}
    </div>
  );
}
