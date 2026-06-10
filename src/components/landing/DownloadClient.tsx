"use client";

import { motion } from "framer-motion";
import { Monitor, Apple, MonitorSmartphone, ArrowLeft, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MagneticButton } from "@/components/landing/MagneticButton";

export function DownloadClient() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (os: string) => {
    setDownloading(os);
    setTimeout(() => {
      setDownloading(null);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white font-sans selection:bg-[#6366F1]/30 overflow-hidden relative flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-br from-[#6366F1]/10 to-transparent rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-[#06B6D4]/10 to-transparent rounded-full blur-3xl animate-[pulse_12s_ease-in-out_infinite_alternate_reverse]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-semibold text-sm">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">
            B
          </div>
          <span className="font-bold text-xl tracking-tight">BillingOS</span>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto w-full pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Get the full <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#06B6D4]">experience.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Download BillingOS for your platform and transform your retail operations today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Windows */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col items-center text-center group hover:border-[#6366F1]/50 transition-colors relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Monitor className="h-16 w-16 text-[#6366F1] mb-6" />
            <h3 className="text-2xl font-bold mb-2">Windows</h3>
            <p className="text-slate-400 text-sm mb-8">Windows 10 and 11 (64-bit)</p>
            
            <div className="mt-auto w-full">
              <a href="/downloads/BillingSystem.exe" download onClick={() => handleDownload('win')}>
                <MagneticButton className="w-full py-4 rounded-xl bg-white text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                  {downloading === 'win' ? <CheckCircle2 className="h-5 w-5 text-[#10B981]" /> : <Download className="h-5 w-5" />}
                  {downloading === 'win' ? 'Downloading...' : 'Download .exe'}
                </MagneticButton>
              </a>
            </div>
          </motion.div>

          {/* Mac */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col items-center text-center group hover:border-white/30 transition-colors relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Apple className="h-16 w-16 text-white mb-6" />
            <h3 className="text-2xl font-bold mb-2">macOS</h3>
            <p className="text-slate-400 text-sm mb-8">macOS 10.15 or later (Intel & Apple Silicon)</p>
            
            <div className="mt-auto w-full">
              <MagneticButton className="w-full py-4 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors cursor-not-allowed opacity-50">
                Coming Soon
              </MagneticButton>
            </div>
          </motion.div>

          {/* Linux */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col items-center text-center group hover:border-[#06B6D4]/50 transition-colors relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#06B6D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MonitorSmartphone className="h-16 w-16 text-[#06B6D4] mb-6" />
            <h3 className="text-2xl font-bold mb-2">Linux</h3>
            <p className="text-slate-400 text-sm mb-8">AppImage for major distributions</p>
            
            <div className="mt-auto w-full">
              <MagneticButton className="w-full py-4 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors cursor-not-allowed opacity-50">
                Coming Soon
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
