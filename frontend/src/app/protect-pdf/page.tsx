'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProtectPdfPage() {
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProtect = async (files: File[]) => {
    if (!password) {
      alert("Please enter a password first!");
      return;
    }
    const file = files[0];
    setIsProcessing(true);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/security/protect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Protection failed');

      const data = await response.json();
      if (data.status === 'success') {
        setSuccessMessage(data.filename);
      } else {
        throw new Error('Failed to save file');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error protecting PDF');
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
        <h1 className="text-5xl font-bold text-indigo-400">Protect PDF</h1>
        <p className="text-xl text-neutral-400">Encrypt your PDF with a password.</p>
        
        <input 
          type="password" 
          placeholder="Enter secure password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-6 py-4 rounded-xl bg-slate-800 text-white w-full max-w-md border border-slate-755/50 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />

        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl max-w-md w-full text-center">
            <p className="font-semibold mb-1">🎉 File successfully protected!</p>
            <p className="text-sm text-emerald-500/90 break-all">Saved to Downloads folder as: <strong className="text-white font-medium">{successMessage}</strong></p>
          </div>
        )}

        <div className="flex justify-center w-full">
          <FileUpload onFilesSelected={handleProtect} title="Select PDF to Encrypt" />
        </div>
        {isProcessing && <p className="text-indigo-400 animate-pulse mt-4">Encrypting document...</p>}
      </div>
    </div>
  );
}
