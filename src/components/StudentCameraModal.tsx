import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, Check, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StudentCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  studentName?: string;
  currentPhoto?: string;
}

export const StudentCameraModal: React.FC<StudentCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  studentName,
  currentPhoto
}) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Stop camera tracks helper
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  };

  // Start camera
  const startCamera = async (mode: 'user' | 'environment') => {
    setIsInitializing(true);
    setCameraError(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === 'ar'
            ? 'الكاميرا غير مدعومة في هذا المتصفح. يمكنك رفع صورة من جهازك بدلاً من ذلك.'
            : 'Camera access is not supported in this browser. You can upload a photo from your device instead.'
        );
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.warn('Auto-play was prevented', err);
        });
      }
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      let message = language === 'ar' 
        ? 'تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن للمتصفح.' 
        : 'Unable to access camera. Please make sure camera permissions are allowed.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = language === 'ar'
          ? 'تم رفض إذن الكاميرا. يرجى تمكين إذن الكاميرا في إعدادات المتصفح.'
          : 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = language === 'ar'
          ? 'لم يتم العثور على كاميرا متصلة بهذا الجهاز.'
          : 'No camera device found on this system.';
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
    } finally {
      setIsInitializing(false);
    }
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(facingMode);
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode]);

  // Ensure video element gets srcObject when stream is ready
  useEffect(() => {
    if (videoRef.current && stream && !capturedPhoto) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedPhoto]);

  // Capture snapshot from video feed
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Trigger visual flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;
    const cropSize = Math.min(videoW, videoH);
    const startX = (videoW - cropSize) / 2;
    const startY = (videoH - cropSize) / 2;

    const canvas = document.createElement('canvas');
    // Save high quality avatar dimension (360x360)
    canvas.width = 360;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Optional: mirror if front-facing
      if (facingMode === 'user') {
        ctx.translate(360, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, startX, startY, cropSize, cropSize, 0, 0, 360, 360);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhoto(dataUrl);
      stopCameraStream();
    }
  };

  // Switch camera front/back
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Save photo and exit
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  // Handle local file selection as alternative
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const cropSize = Math.min(img.width, img.height);
          const startX = (img.width - cropSize) / 2;
          const startY = (img.height - cropSize) / 2;
          ctx.drawImage(img, startX, startY, cropSize, cropSize, 0, 0, 360, 360);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCapturedPhoto(dataUrl);
          stopCameraStream();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="student-camera-modal-backdrop"
      className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div 
        id="student-camera-modal-card"
        className="bg-white rounded-2xl max-w-md w-full border border-[#e5dad0] shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-[#3b2317] text-[#faedd9] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#533322] flex items-center justify-center text-[#df9b52]">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {language === 'ar' ? 'التقاط صورة الطالب' : 'Capture Student Photo'}
              </h3>
              {studentName && (
                <p className="text-[11px] text-[#df9b52] truncate max-w-[220px]">
                  {studentName}
                </p>
              )}
            </div>
          </div>
          <button
            id="close-camera-modal-btn"
            type="button"
            onClick={onClose}
            className="text-[#d8c7b8] hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera / Preview Viewport */}
        <div className="p-5 space-y-4">
          
          {/* Main Stage */}
          <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border-2 border-[#e5dad0] shadow-inner flex items-center justify-center">
            
            {/* Flash Effect */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-20 pointer-events-none animate-fade-out" />
            )}

            {/* Live Camera View */}
            {!capturedPhoto && !cameraError && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                
                {/* Viewfinder Circle / Frame Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full border-2 border-white/60 border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/60 text-white text-[10px] backdrop-blur-xs font-medium">
                    {language === 'ar' ? 'ضع وجه الطالب داخل الدائرة' : 'Position face inside frame'}
                  </div>
                </div>

                {/* Flip camera toggle */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  title={language === 'ar' ? 'تبديل الكاميرا' : 'Switch camera'}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Captured Photo Snapshot View */}
            {capturedPhoto && (
              <div className="w-full h-full relative">
                <img
                  src={capturedPhoto}
                  alt="Captured student portrait"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  <span>{language === 'ar' ? 'تم الالتقاط' : 'Ready to Save'}</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {cameraError && !capturedPhoto && (
              <div className="p-6 text-center text-white space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-300 max-w-[240px] mx-auto leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{language === 'ar' ? 'اختيار صورة من الملفات' : 'Upload from Device'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {isInitializing && !cameraError && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white text-xs gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-[#df9b52]" />
                <span>{language === 'ar' ? 'جاري تشغيل الكاميرا...' : 'Starting camera...'}</span>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {!capturedPhoto ? (
              <>
                <button
                  id="snap-student-photo-btn"
                  type="button"
                  disabled={!stream || isInitializing}
                  onClick={handleSnap}
                  className="px-5 py-2.5 rounded-xl bg-[#854d2b] hover:bg-[#6c3e23] disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>{language === 'ar' ? 'التقاط الصورة الآن' : 'Snap Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title={language === 'ar' ? 'أو اختر ملف صورة' : 'Or upload image file'}
                  className="p-2.5 rounded-xl border border-[#e5dad0] hover:bg-[#faf7f3] text-[#635043] transition cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  id="retake-student-photo-btn"
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl border border-[#e5dad0] bg-[#faf7f3] hover:bg-[#f0e6dc] text-[#3b2317] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{language === 'ar' ? 'إعادة الالتقاط' : 'Retake'}</span>
                </button>

                <button
                  id="save-captured-student-photo-btn"
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{language === 'ar' ? 'حفظ الصورة للطالب' : 'Use Photo'}</span>
                </button>
              </>
            )}
          </div>

          {/* Hidden File Input as fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-[11px] text-center text-[#8c7464] pt-1">
            {language === 'ar'
              ? 'تُحفظ الصورة مباشرة في السجل وملف الطالب الخاص بالصف الخامس.'
              : 'The photo is instantly saved to the student’s permanent record.'}
          </p>

        </div>
      </div>
    </div>
  );
};
