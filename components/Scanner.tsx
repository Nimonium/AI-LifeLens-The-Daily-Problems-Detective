import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Image as ImageIcon, Loader2, RefreshCw, Aperture } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { ScanResult, AnalysisState } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
  onCancel: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onCancel }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    stage: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted and you are using a secure connection (HTTPS).");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!imagePreview) return;

    setAnalysisState({ isAnalyzing: true, progress: 10, stage: 'Initializing Gemini...' });

    try {
      // Simulate progress stages for better UX
      const progressTimer = setInterval(() => {
        setAnalysisState(prev => {
           if (prev.progress >= 90) return prev;
           return { ...prev, progress: prev.progress + 15 };
        });
      }, 500);
      
      setAnalysisState(prev => ({ ...prev, stage: 'Detecting objects & reading text...' }));
      
      const resultData = await analyzeImage(imagePreview);
      
      clearInterval(progressTimer);
      setAnalysisState({ isAnalyzing: true, progress: 100, stage: 'Finalizing results...' });

      const newScan: ScanResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: imagePreview,
        itemsDetected: resultData.itemsDetected || [],
        summary: resultData.summary || "No summary available.",
        tasks: resultData.tasks || [],
        events: resultData.events || [],
        notes: resultData.notes || [],
        studyPlan: resultData.studyPlan
      };

      // Small delay to show 100%
      setTimeout(() => {
        onScanComplete(newScan);
      }, 800);

    } catch (error) {
      console.error(error);
      setAnalysisState({ isAnalyzing: false, progress: 0, stage: 'Error occurred. Please try again.' });
      alert("Failed to analyze image. Please check your API key or try another image.");
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    stopCamera();
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">New Scan</h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Capture a messy desk, document, or screenshot.</p>
        </div>
        <button onClick={() => { stopCamera(); onCancel(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-sm transition-all hover:border-indigo-400 dark:hover:border-indigo-500">
        
        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {analysisState.isAnalyzing ? (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 z-20 flex flex-col items-center justify-center p-8 transition-colors">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Camera className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Analyzing Scene</h3>
                <p className="text-slate-500 dark:text-slate-400 transition-colors">{analysisState.stage}</p>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${analysisState.progress}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 opacity-50">
                 <div className="h-20 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                 <div className="h-20 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse delay-75"></div>
                 <div className="h-20 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        ) : isCameraOpen ? (
          <div className="absolute inset-0 bg-black flex flex-col">
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-contain"
              />
              {/* Camera Overlay Guide */}
              <div className="absolute inset-0 border-[30px] border-black/30 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 relative">
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              </div>
            </div>
            
            <div className="h-24 bg-black flex items-center justify-around px-8">
               <button 
                 onClick={stopCamera}
                 className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
               
               <button 
                 onClick={captureImage}
                 className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center relative group"
               >
                 <div className="w-14 h-14 bg-white rounded-full transition-transform group-active:scale-90"></div>
               </button>
               
               {/* Spacer for alignment */}
               <div className="w-12"></div>
            </div>
          </div>
        ) : imagePreview ? (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
            <div className="absolute bottom-8 flex gap-4">
              <button 
                onClick={handleRetake}
                className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white/20 transition-all font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button 
                onClick={handleProcess}
                className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all font-medium flex items-center gap-2"
              >
                <Aperture className="w-4 h-4" />
                Process with Gemini
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white transition-colors">Upload or Capture</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto transition-colors">
                Use your camera to scan physical notes, or upload a screenshot.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                onClick={startCamera}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all font-medium flex items-center gap-2 justify-center"
              >
                <Camera className="w-5 h-5" />
                Use Camera
              </button>
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 transition-all font-medium flex items-center gap-2 justify-center"
              >
                <ImageIcon className="w-5 h-5" />
                Select File
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
