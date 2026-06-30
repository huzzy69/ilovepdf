'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Unlock, ArrowLeft, ShieldAlert, Zap } from 'lucide-react';
import Link from 'next/link';

type UnlockMode = 'password' | 'force' | 'brute';

export default function UnlockPdfPage() {
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<UnlockMode>('password');
  const [result, setResult] = useState<{ filename: string; foundPassword?: string } | null>(null);

  const handleUnlock = async (files: File[]) => {
    if (mode === 'password' && !password) {
      alert("Please enter the password first!");
      return;
    }
    const file = files[0];
    setIsProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      if (mode === 'brute') {
        // Brute force mode — returns JSON
        const response = await fetch(`${apiUrl}/api/security/brute-force-unlock`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Brute force failed');
        }
        const data = await response.json();
        setResult({ filename: data.filename, foundPassword: data.found_password });

      } else if (mode === 'force') {
        // Force unlock (owner-password only PDFs)
        const response = await fetch(`${apiUrl}/api/security/force-unlock`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || 'Force unlock failed. This PDF requires a user password.');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.setAttribute('download', `unlocked_${file.name}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        setResult({ filename: `unlocked_${file.name}` });

      } else {
        // Password mode
        formData.append('password', password);
        const response = await fetch(`${apiUrl}/api/security/unlock`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error('Incorrect password!');
          throw new Error('Unlocking failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.setAttribute('download', `unlocked_${file.name}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        setResult({ filename: `unlocked_${file.name}` });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error unlocking PDF');
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
        <h1 className="text-5xl font-bold text-cyan-400">Unlock PDF</h1>
        <p className="text-xl text-neutral-400">Remove password security from your PDF.</p>

        {/* Mode Selector */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => setMode('password')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${
              mode === 'password'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Unlock className="w-4 h-4" />
            I know the password
          </button>
          <button
            onClick={() => setMode('force')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${
              mode === 'force'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Force Unlock
          </button>
          <button
            onClick={() => setMode('brute')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border ${
              mode === 'brute'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Zap className="w-4 h-4" />
            Brute Force Attack
          </button>
        </div>

        {/* Mode description */}
        {mode === 'password' && (
          <input
            type="password"
            placeholder="Enter current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-6 py-4 rounded-xl text-white w-full max-w-md border outline-none transition-all bg-slate-800 border-slate-700/50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        )}
        {mode === 'force' && (
          <div className="px-5 py-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm max-w-md w-full">
            <ShieldAlert className="w-5 h-5 inline mr-2" />
            Works only on PDFs with <strong>permissions/owner password</strong> (not user open-password).
          </div>
        )}
        {mode === 'brute' && (
          <div className="px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-md w-full">
            <Zap className="w-5 h-5 inline mr-2" />
            Tries <strong>50,000+ passwords</strong> automatically. Works for simple/common passwords.
            May take 30–60 seconds. Saved to Downloads folder on success.
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl max-w-md w-full text-center">
            <p className="font-semibold mb-1">🎉 PDF successfully unlocked!</p>
            <p className="text-sm break-all">
              File: <strong className="text-white">{result.filename}</strong>
            </p>
            {result.foundPassword && (
              <p className="text-sm mt-1">
                🔑 Password found: <strong className="text-yellow-300 font-mono">{result.foundPassword}</strong>
              </p>
            )}
            {mode === 'brute' && (
              <p className="text-xs text-emerald-500/70 mt-1">Saved to your Downloads folder</p>
            )}
          </div>
        )}

        <div className="flex justify-center w-full">
          <FileUpload onFilesSelected={handleUnlock} title="Select Protected PDF" />
        </div>

        {isProcessing && (
          <div className="text-center mt-4">
            <p className={`animate-pulse font-semibold ${mode === 'brute' ? 'text-red-400' : 'text-cyan-400'}`}>
              {mode === 'brute' ? '⚡ Brute forcing password... please wait (30–60s)...' : 'Unlocking document...'}
            </p>
            {mode === 'brute' && (
              <p className="text-xs text-slate-500 mt-1">Trying common passwords and numeric combinations...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
