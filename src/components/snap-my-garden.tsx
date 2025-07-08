"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getGardenFeedback } from "@/app/actions";
import { Camera, Loader2, PartyPopper, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

type FeedbackResult = {
  feedback: string;
  alerts: string[];
};

export function SnapMyGarden() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUri);
        setFeedbackResult(null);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setCapturedImage(dataUri);
        setFeedbackResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    setFeedbackResult(null);
    try {
      const result = await getGardenFeedback({ photoDataUri: capturedImage });
      setFeedbackResult(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setFeedbackResult(null);
  }

  return (
    <section className="mt-16">
      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Snap My Garden</CardTitle>
          <CardDescription>
            Get instant, AI-powered feedback on your garden's health.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!capturedImage ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
                        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold">Camera access is needed</p>
                        <p className="text-muted-foreground">Please allow camera access in your browser settings to use this feature, or upload a photo.</p>
                    </div>
                )}
                 {hasCameraPermission === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
                  <Camera className="mr-2" /> Take Photo
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="secondary">
                  Upload Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Image src={capturedImage} alt="Captured garden" width={600} height={400} className="rounded-lg w-full aspect-video object-cover" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze My Garden"
                  )}
                </Button>
                 <Button onClick={reset} variant="outline" className="w-full">
                    Take New Photo
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {feedbackResult && (
            <div className="pt-4 space-y-4">
                <Alert>
                    <PartyPopper className="h-4 w-4" />
                    <AlertTitle className="font-headline text-xl">Expert Feedback</AlertTitle>
                    <AlertDescription>{feedbackResult.feedback}</AlertDescription>
                </Alert>
                {feedbackResult.alerts.length > 0 && (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-headline text-xl">Suggestions</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 space-y-1">
                                {feedbackResult.alerts.map((alert, i) => <li key={i}>{alert}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
