import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User, RefreshCw, Sparkles, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StudentPhotoFrameProps {
  photoUrl?: string;
  studentName: string;
  arabicName?: string;
  rollNumber: number;
  classNameText?: string;
  parentName?: string;
  parentPhone?: string;
  groupName?: string;
  onPhotoChange: (newPhotoUrl: string) => void;
  onPhotoRemove: () => void;
  allowEdit?: boolean;
  size?: 'normal' | 'large';
  className?: string;
}

export const StudentPhotoFrame: React.FC<StudentPhotoFrameProps> = ({
  photoUrl,
  studentName,
  arabicName,
  rollNumber,
  classNameText = 'Class Five (Boys)',
  parentName,
  parentPhone,
  groupName,
  onPhotoChange,
  onPhotoRemove,
  allowEdit = true,
  size = 'normal',
  className = ''
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const hasPhoto = Boolean(photoUrl && photoUrl.trim().length > 0);

  // Handle local file selection and convert to optimized base64 Data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى اختيار ملف صورة صالح.' : 'Please select a valid image file.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimize to standard portrait dimension using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 480;
        const MAX_HEIGHT = 560;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          onPhotoChange(dataUrl);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const frameDimensions = size === 'large' 
    ? 'w-44 h-52 sm:w-52 sm:h-64' 
    : 'w-36 h-44 sm:w-44 sm:h-52';

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        id="student-flyer-photo-input"
      />

      {/* THE ORNATE FLYER PHOTO FRAME */}
      <div className="relative group">
        {/* Outer Baroque / Islamic Gold Rim Frame */}
        <div
          onDrop={allowEdit ? handleDrop : undefined}
          onDragOver={allowEdit ? handleDragOver : undefined}
          onDragLeave={allowEdit ? handleDragLeave : undefined}
          onClick={allowEdit && !hasPhoto ? () => fileInputRef.current?.click() : undefined}
          className={`${frameDimensions} rounded-2xl p-1.5 sm:p-2 bg-gradient-to-b from-[#df9b52] via-[#f5d09b] to-[#854d2b] shadow-lg relative transition-all duration-200 ${
            allowEdit && !hasPhoto ? 'cursor-pointer hover:scale-102 hover:shadow-xl' : ''
          } ${dragOver ? 'ring-4 ring-[#854d2b] scale-102' : ''}`}
        >
          {/* Decorative Corner Ornaments */}
          <span className="absolute top-1 left-1.5 text-[#3b2317] text-xs font-serif leading-none select-none opacity-80">❖</span>
          <span className="absolute top-1 right-1.5 text-[#3b2317] text-xs font-serif leading-none select-none opacity-80">❖</span>
          <span className="absolute bottom-1 left-1.5 text-[#3b2317] text-xs font-serif leading-none select-none opacity-80">❖</span>
          <span className="absolute bottom-1 right-1.5 text-[#3b2317] text-xs font-serif leading-none select-none opacity-80">❖</span>

          {/* Inner Picture Matting & Canvas */}
          <div className="w-full h-full rounded-xl overflow-hidden bg-[#faf7f3] border-2 border-[#854d2b]/60 flex items-center justify-center relative shadow-inner">
            {hasPhoto ? (
              <img
                src={photoUrl}
                alt={studentName}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              /* EMPTY FRAME STATE: Inviting Placeholder */
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-[#faf7f3] to-[#f0e6dc] border-2 border-dashed border-[#c88642]/60 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[#faedd9] text-[#854d2b] flex items-center justify-center mb-2 shadow-xs">
                  <User className="w-6 h-6 stroke-[1.75]" />
                </div>
                <span className="text-xs font-extrabold text-[#3b2317] block leading-tight">
                  {language === 'ar' ? 'إطار صورة الطالب' : 'Student Photo Frame'}
                </span>
                <span className="text-[10px] text-[#8c7464] font-medium mt-1 leading-tight">
                  {language === 'ar' ? 'انقر أو اسحب لإدراج الصورة' : 'Click or drop to insert photo'}
                </span>
                {allowEdit && (
                  <span className="mt-2.5 inline-flex items-center gap-1 bg-[#854d2b] text-[#faedd9] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    <Upload className="w-2.5 h-2.5" />
                    <span>{language === 'ar' ? 'إدراج صورة' : 'Insert Photo'}</span>
                  </span>
                )}
              </div>
            )}

            {/* Processing Spinner Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-[#1b110b]/70 flex flex-col items-center justify-center text-white rounded-lg z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-[#df9b52] mb-1.5" />
                <span className="text-[11px] font-bold">
                  {language === 'ar' ? 'جارٍ تحميل الصورة...' : 'Processing...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE CONTROLS BAR (Marked with 'no-export' so hidden from exported PNG and Print!) */}
        {allowEdit && (
          <div className="no-export mt-2 flex items-center justify-center gap-1.5">
            {/* Insert / Change Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#3b2317] hover:bg-[#4f2f1e] text-[#faedd9] text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
              title={hasPhoto ? (language === 'ar' ? 'تغيير صورة الطالب' : 'Change Photo') : (language === 'ar' ? 'إدراج صورة الطالب' : 'Insert Photo')}
            >
              <Upload className="w-3 h-3 text-[#df9b52]" />
              <span>
                {hasPhoto 
                  ? (language === 'ar' ? 'تغيير الصورة' : 'Change Photo') 
                  : (language === 'ar' ? 'إدراج صورة' : 'Insert Photo')}
              </span>
            </button>

            {/* Remove Photo Button */}
            {hasPhoto && (
              <button
                type="button"
                onClick={onPhotoRemove}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                title={language === 'ar' ? 'إزالة الصورة من الإطار' : 'Remove Photo from Frame'}
              >
                <Trash2 className="w-3 h-3 text-red-600" />
                <span>{language === 'ar' ? 'إزالة' : 'Remove'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* STUDENT NAME UNDER THE FRAME */}
      <div className="mt-3.5 space-y-1 w-full max-w-sm">
        {/* Roll Number & Class Pill */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span className="bg-[#3b2317] text-[#faedd9] text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
            {language === 'ar' ? `رقم #${rollNumber}` : `Roll #${rollNumber}`}
          </span>
          <span className="bg-[#faedd9] text-[#854d2b] border border-[#c88642]/40 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
            {classNameText}
          </span>
          {groupName && (
            <span className="bg-[#f0e6dc] text-[#635043] text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {groupName}
            </span>
          )}
        </div>

        {/* Student English Name */}
        <h3 className="text-lg sm:text-xl font-black text-[#1b110b] tracking-tight leading-tight">
          {studentName}
        </h3>

        {/* Student Arabic Calligraphy Name */}
        {arabicName && (
          <p className="font-arabic text-base sm:text-lg text-[#854d2b] font-bold leading-normal">
            {arabicName}
          </p>
        )}

        {/* Guardian & Contact Information */}
        {(parentName || parentPhone) && (
          <p className="text-xs text-[#7c695d] font-medium pt-0.5">
            <span className="text-[#8c7464]">{language === 'ar' ? 'ولي الأمر: ' : 'Guardian: '}</span>
            <strong className="text-[#1b110b]">{parentName || (language === 'ar' ? 'غير محدد' : 'Not specified')}</strong>
            {parentPhone && (
              <span className="text-[#854d2b] font-semibold"> • {parentPhone}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
