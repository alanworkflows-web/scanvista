import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

interface ImageUploaderProps {
  label: string;
  onImageSelected: (url: string) => void;
  currentImage?: string | null;
}

export function ImageUploader({ label, onImageSelected, currentImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // In a real app, you would upload to a server and get a URL back.
    // Here we'll just use a local object URL or read as base64 for preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelected(url);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden",
          isDragging ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300",
          preview ? "p-0 aspect-[21/9]" : "min-h-[160px]"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {preview ? (
          <>
            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <UploadCloud className="w-8 h-8 text-white mb-2" />
              <span className="text-white text-sm font-medium">Click or drag to replace</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-3 text-gray-400">
              <ImageIcon size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
