"use client";

import { ChangeEvent, useRef, useState, DragEvent } from "react";
import { UploadCloud, File as FileIcon } from "lucide-react";

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  selectedFile: File | null;
}

export function PdfUploader({
  onFileSelect,
  isLoading,
  selectedFile,
}: PdfUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo no formato PDF.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        className={`relative w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center ease-in-out cursor-pointer overflow-hidden ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.02]"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept="application/pdf"
          className="hidden"
          disabled={isLoading}
        />

        <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <UploadCloud size={32} strokeWidth={2} />
        </div>

        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Clique ou arraste seu PDF aqui
        </h3>

        {selectedFile && !error && (
          <div className="mt-6 flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg w-full max-w-sm shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <FileIcon className="text-blue-500" size={24} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm font-medium text-center animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
