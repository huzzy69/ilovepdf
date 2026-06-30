import Link from 'next/link';
import { 
  Minimize2, FileText, FileSpreadsheet, Layers, 
  Scissors, Image, ShieldCheck, Unlock, ScanEye 
} from 'lucide-react';

const tools = [
  { name: 'Compress PDF', desc: 'Reduce file size while optimizing for maximal PDF quality.', icon: Minimize2, color: 'text-green-500', bg: 'bg-green-500/10', href: '/compress-pdf', label: 'Optimize' },
  { name: 'PDF to Word', desc: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/pdf-to-word', label: 'Convert' },
  { name: 'JPG to Word', desc: 'Convert document images to editable Word files via high-accuracy OCR.', icon: FileText, color: 'text-sky-500', bg: 'bg-sky-500/10', href: '/jpg-to-word', label: 'Convert' },
  { name: 'PDF to Excel', desc: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/pdf-to-excel', label: 'Convert' },
  { name: 'Excel to PDF', desc: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-600/10', href: '/excel-to-pdf', label: 'Convert' },
  { name: 'Merge PDF', desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: Layers, color: 'text-red-500', bg: 'bg-red-500/10', href: '/merge-pdf', label: 'Organize' },
  { name: 'Split PDF', desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-500/10', href: '/split-pdf', label: 'Organize' },
  { name: 'PDF to JPG', desc: 'Convert each PDF page into a JPG or extract all images contained in a PDF.', icon: Image, color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/pdf-to-jpg', label: 'Convert' },
  { name: 'JPG to PDF', desc: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.', icon: Image, color: 'text-yellow-500', bg: 'bg-yellow-500/10', href: '/jpg-to-pdf', label: 'Convert' },
  { name: 'OCR PDF', desc: 'Easily convert scanned PDF into searchable and selectable documents.', icon: ScanEye, color: 'text-lime-500', bg: 'bg-lime-500/10', href: '/ocr-pdf', label: 'Enhance' },
  { name: 'Protect PDF', desc: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', href: '/protect-pdf', label: 'Security' },
  { name: 'Unlock PDF', desc: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.', icon: Unlock, color: 'text-cyan-500', bg: 'bg-cyan-500/10', href: '/unlock-pdf', label: 'Security' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            iLove<span className="text-indigo-400">PDF</span> Ultra
          </span>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Every PDF tool you need, built locally, worldwide
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            100% secure processing inside your workstation. Zero data tracking. Maximum speed.
          </p>
        </div>

        {/* Tools Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            if (tool.comingSoon) {
              return (
                <div 
                  key={tool.name} 
                  className="relative bg-slate-950/20 border border-slate-900/60 rounded-2xl p-6 opacity-40 cursor-not-allowed overflow-hidden select-none"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-3 rounded-xl ${tool.bg} ${tool.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-slate-950 text-slate-500 rounded-full border border-slate-900">
                      Coming Soon
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-500 mb-2">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-normal font-sans">
                    {tool.desc}
                  </p>
                </div>
              );
            }
            return (
              <Link 
                key={tool.name} 
                href={tool.href}
                className="group relative bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-950 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${tool.bg} ${tool.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-slate-800/60 text-slate-400 rounded-full border border-slate-700/30">
                    {tool.label}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-100 mb-2 transition-colors group-hover:text-indigo-400">
                  {tool.name}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-normal font-sans">
                  {tool.desc}
                </p>
                
                {/* Decorative Hover Edge */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
