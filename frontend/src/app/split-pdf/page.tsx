'use client';

import React, { useState } from 'react';
import { FileUpload } from '../../components/ui/FileUpload';
import { splitPdf } from '../../lib/pdfClient';
import { File as FileIcon } from 'lucide-react';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const splitBytes = await splitPdf(file);
      
      const toDownload = splitBytes.slice(0, 10);
      
      for (let i = 0; i < toDownload.length; i++) {
        const blob = new Blob([toDownload[i] as unknown as BlobPart], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        await new Promise(r => setTimeout(r, 200));
      }
      
      if (splitBytes.length > 10) {
        alert(`Only the first 10 pages were downloaded to prevent browser blocking. In a production app, we would bundle these in a ZIP file using jszip.`);
      }
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-12 pt-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            Split PDF
          </h1>
          <p className="text-xl text-neutral-400">
            Separate one page or a whole set for easy conversion into independent PDF files.
          </p>
        </div>

        <div className="flex justify-center">
          <FileUpload 
            onFilesSelected={handleFileSelected}
            multiple={false}
            title="Select PDF file"
          />
        </div>

        {file && (
          <div className="bg-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Selected File</h2>
            <div className="flex items-center space-x-3 bg-neutral-700/50 p-3 rounded-lg mb-6">
              <FileIcon className="text-orange-400" />
              <span>{file.name}</span>
            </div>
            
            <button 
              onClick={handleSplit}
              disabled={isProcessing}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-xl transition-colors"
            >
              {isProcessing ? 'Splitting...' : 'Split PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
