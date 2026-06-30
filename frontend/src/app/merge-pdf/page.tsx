'use client';

import React, { useState } from 'react';
import { FileUpload } from '../../components/ui/FileUpload';
import { mergePdfs } from '../../lib/pdfClient';
import { File as FileIcon, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    
    try {
      const mergedBytes = await mergePdfs(files);
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Failed to merge PDFs");
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
      <div className="flex-1 max-w-4xl w-full mx-auto space-y-12 pb-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
            Merge PDF
          </h1>
          <p className="text-xl text-neutral-400 font-sans">
            Combine PDFs in the order you want with the easiest PDF merger available.
          </p>
        </div>

        <div className="flex justify-center w-full">
          <FileUpload 
            onFilesSelected={handleFilesSelected}
            multiple={true}
            title="Select PDF files"
          />
        </div>

        {files.length > 0 && (
          <div className="bg-neutral-800 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Selected Files</h2>
            <div className="space-y-2 mb-6">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-700/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="text-red-400" />
                    <span>{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-neutral-400 hover:text-red-400 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-xl transition-colors"
            >
              {isProcessing ? 'Merging...' : 'Merge PDFs'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
