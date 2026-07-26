import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (base64: string) => void;
  label?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export function ImageUploader({ value, onChange, label = "Upload Image", className, aspectRatio = 'video' }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension 800px to keep base64 string size small for DB
        const MAX_DIMENSION = 800;
        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onChange(dataUrl);
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const aspectClass = aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : '';

  if (value) {
    return (
      <div className={cn("relative rounded-sm overflow-hidden border border-divider group", aspectClass, className)}>
        <img src={value} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="p-3 bg-surface text-red-600 rounded-full hover:scale-105 shadow-premium transition-transform"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors",
        aspectClass,
        isDragging ? "border-primary bg-primary/5" : "border-divider bg-background hover:bg-surface-hover hover:border-primary",
        className,
        !aspectClass && "p-8"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      {isProcessing ? (
        <Loader2 size={32} className="text-text-muted animate-spin" />
      ) : (
        <>
          <div className="w-12 h-12 bg-surface rounded-full shadow-premium flex items-center justify-center mb-3">
            <Upload size={20} className="text-primary" />
          </div>
          <span className="font-medium text-text-secondary">{label}</span>
          <span className="text-sm text-text-secondary opacity-60 mt-1">Drag & drop or click</span>
        </>
      )}
    </div>
  );
}
