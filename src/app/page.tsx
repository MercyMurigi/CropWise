import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Map, Package, Camera } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1
                    className="text-5xl font-headline font-bold tracking-tighter text-primary sm:text-6xl xl:text-7xl/none opacity-0 animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}
                  >
                    Cultivate Your Perfect Garden
                  </h1>
                  <p
                    className="max-w-[600px] text-foreground/80 md:text-xl lg:text-lg xl:text-xl opacity-0 animate-fade-in-up"
                    style={{ animationDelay: '0.3s' }}
                  >
                    Get AI-powered crop recommendations, visual planting guides, and expert feedback to grow a thriving, nutritious garden tailored to your family's needs.
                  </p>
                </div>
                <div
                  className="flex flex-col sm:flex-row gap-4 items-start opacity-0 animate-fade-in-up"
                  style={{ animationDelay: '0.4s' }}
                >
                    <Link href="/planner">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg animate-pulse-subtle">
                        Start Planning Your Garden
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="https://plus.unsplash.com/premium_photo-1663134176504-c64cede0d0a2?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  width={600}
                  height={700}
                  alt="A vibrant home garden with various vegetables"
                  className="mx-auto overflow-hidden rounded-xl object-cover object-center shadow-2xl shadow-primary/10"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-4">
                        <div
                          className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary opacity-0 animate-fade-in-up"
                          style={{ animationDelay: '0.5s' }}
                        >
                          Key Features
                        </div>
                        <h2
                          className="text-3xl font-headline font-bold tracking-tighter text-primary md:text-4xl/tight opacity-0 animate-fade-in-up"
                          style={{ animationDelay: '0.6s' }}
                        >
                            Smart Tools for a Thriving Garden
                        </h2>
                        <p
                          className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-0 animate-fade-in-up"
                          style={{ animationDelay: '0.7s' }}
                        >
                            From intelligent planning to expert feedback, our app provides everything you need to cultivate a successful and nutritious garden with confidence.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
                    <div
                      className="grid gap-4 text-left p-6 rounded-lg bg-card/50 border border-transparent hover:border-primary/20 hover:bg-card transition-all duration-300 opacity-0 animate-fade-in-up"
                      style={{ animationDelay: '0.8s' }}
                    >
                        <div className="bg-accent/20 text-accent rounded-full p-3 w-fit">
                            <Map className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Visual Garden Planner</h3>
                        <p className="text-sm text-muted-foreground">
                            Generate a simple planting map based on your land size and chosen nutrition goals.
                        </p>
                    </div>
                    <div
                      className="grid gap-4 text-left p-6 rounded-lg bg-card/50 border border-transparent hover:border-primary/20 hover:bg-card transition-all duration-300 opacity-0 animate-fade-in-up"
                      style={{ animationDelay: '0.9s' }}
                    >
                        <div className="bg-accent/20 text-accent rounded-full p-3 w-fit">
                            <Package className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Seed Bundles</h3>
                        <p className="text-sm text-muted-foreground">
                            Order pre-packaged seed bundles or find nearby agro-dealers for easy pickup.
                        </p>
                    </div>
                    <div
                      className="grid gap-4 text-left p-6 rounded-lg bg-card/50 border border-transparent hover:border-primary/20 hover:bg-card transition-all duration-300 opacity-0 animate-fade-in-up"
                      style={{ animationDelay: '1.0s' }}
                    >
                        <div className="bg-accent/20 text-accent rounded-full p-3 w-fit">
                             <Camera className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Snap My Garden</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload a photo of your garden for instant AI-powered feedback and tips.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 border-t">
         <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CropWise Nutrition</p>
      </footer>
    </>
  );
}
