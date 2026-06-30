'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function JpgToWordPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleConvert = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/convert/image-to-word`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errDetail = await response.json().catch(() => ({ detail: 'Conversion failed' }));
        throw new Error(errDetail.detail || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Replace original image extension with .docx
      const originalName = file.name;
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      a.download = `${baseName}.docx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col p-6 selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-12">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-500/30 transition-all duration-300 text-slate-300 hover:text-white text-sm font-semibold shadow-lg shadow-black/10"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-slate-400">
            iLove<span className="text-sky-400">PDF</span> Ultra
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto text-center space-y-8 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            OCR Powered
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            JPG to Word Converter
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Extract text from document images (JPG, PNG, WebP) and convert them into fully editable, clean Word documents in seconds.
          </p>
        </div>
        
        <div className="flex justify-center w-full">
          <FileUpload 
            onFilesSelected={handleConvert}
            accept={{ 
              'image/jpeg': ['.jpg', '.jpeg'], 
              'image/png': ['.png'],
              'image/webp': ['.webp'] 
            }}
            multiple={false}
            title="Select document image"
            subtitle="or drag and drop JPG, PNG, or WebP here"
          />
        </div>

        {isProcessing && (
          <div className="flex flex-col items-center gap-3 text-sky-400 font-medium">
            <Loader2 className="w-8 h-8 animate-spin" />
            <div className="animate-pulse text-lg">
              Performing OCR & generating Word document, please wait...
            </div>
          </div>
        )}
        
        {success && !isProcessing && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-lg">
            ✓ Conversion successful! Your Word document download has started.
          </div>
        )}
        
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-lg">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
