'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { imagesToPdf } from '@/lib/pdfClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function JpgToPdfPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfBytes = await imagesToPdf(files);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error converting Images to PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col p-6">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-12">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/30 hover:border-neutral-500/50 transition-all text-neutral-300 hover:text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-neutral-400">
            iLove<span className="text-indigo-400">PDF</span> Ultra
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto text-center space-y-8 pb-12">
        <h1 className="text-5xl font-bold text-yellow-400">JPG to PDF</h1>
        <p className="text-xl text-neutral-400">Convert JPG/PNG images to PDF in seconds.</p>
        
        <div className="flex justify-center w-full">
          <FileUpload 
            onFilesSelected={handleConvert} 
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
            multiple={true}
            title="Select Images"
            subtitle="or drop images here"
          />
        </div>
        {isProcessing && <p className="text-yellow-400 animate-pulse mt-4">Creating PDF...</p>}
      </div>
    </div>
  );
}
