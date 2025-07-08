"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getGardenFeedback } from "@/app/actions";
import { Camera, Loader2, PartyPopper, AlertTriangle, Video, Upload, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

type FeedbackResult = {
  feedback: string;
  alerts: string[];
};

export function SnapMyGarden() {
  const [view, setView] = useState<'idle' | 'camera'>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
      return;
    }
    
    setIsCameraInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setView('camera');
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
        });
      setView('idle');
    } finally {
        setIsCameraInitializing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setView('idle');
  }

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
        stopCamera();
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
    setView('idle');
  }

  const renderIdleView = () => (
    <div className="space-y-4">
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 text-center">
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Take or upload a photo</h3>
            <p className="text-muted-foreground">Use your camera or upload an image file from your device.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={startCamera} disabled={isCameraInitializing} className="w-full">
                {isCameraInitializing ? <Loader2 className="mr-2 animate-spin"/> : <Video className="mr-2" />}
                Use Camera
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="secondary">
                <Upload className="mr-2" />
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
  );

  const renderCameraView = () => (
    <div className="space-y-4">
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleCapture} className="w-full">
                <Camera className="mr-2" /> Capture Photo
            </Button>
            <Button onClick={stopCamera} variant="outline" className="w-full">
                <ArrowLeft className="mr-2" /> Back
            </Button>
        </div>
    </div>
  );

  const renderPreviewAndFeedback = () => (
     <div className="space-y-4">
        <Image src={capturedImage!} alt="Captured garden" width={600} height={400} className="rounded-lg w-full aspect-video object-cover" />
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
    </div>
  );

  return (
     <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Garden Analysis</CardTitle>
            <CardDescription>
                Get instant, AI-powered feedback on your garden's health.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {capturedImage ? renderPreviewAndFeedback() : (view === 'camera' ? renderCameraView() : renderIdleView())}
        </CardContent>
     </Card>
  );
}
