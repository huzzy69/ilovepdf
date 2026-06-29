'use client';

import React, { useState } from 'react';
import { FileUpload } from '../../components/ui/FileUpload';

export default function PdfToWordPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/convert/pdf-to-word', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.docx');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          PDF to Word Converter
        </h1>
        <p className="text-xl text-neutral-400">
          Convert your PDF to an editable Word document with incredible accuracy.
        </p>
        
        <div className="flex justify-center">
          <FileUpload 
            onFilesSelected={handleConvert}
            accept={{ 'application/pdf': ['.pdf'] }}
            multiple={false}
            title="Select PDF file"
          />
        </div>

        {isProcessing && (
          <div className="text-blue-400 animate-pulse text-lg">
            Converting your document, please wait...
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-lg">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
