'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export function FileUpload({
  onFilesSelected,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = false,
  title = "Select PDF files",
  subtitle = "or drop PDFs here"
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full max-w-2xl p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
        isDragActive
          ? "border-blue-500 bg-blue-500/10"
          : "border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-neutral-500"
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className={cn(
        "w-16 h-16 mb-4 transition-colors duration-300",
        isDragActive ? "text-blue-500" : "text-neutral-400"
      )} />
      <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-400">{subtitle}</p>
    </div>
  );
}
