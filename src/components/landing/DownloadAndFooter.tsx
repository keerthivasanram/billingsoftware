"use client";

import { motion } from "framer-motion";
import { Monitor, Apple, MonitorSmartphone, Globe, Download, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { MagneticButton } from "./MagneticButton";

export function DownloadSection() {
  const platforms = [
    { 
      name: "Windows", 
      icon: Monitor, 
      version: "v2.4.0", 
      size: "84 MB", 
      color: "from-[#6366F1] to-[#8B5CF6]", 
      reqs: "Windows 10+, 64-bit",
      features: ["Native Hardware Integration", "Offline Database", "Auto-updates"] 
    },
    { 
      name: "macOS", 
      icon: Apple, 
      version: "v2.4.0", 
      size: "92 MB", 
      color: "from-[#0F172A] to-[#334155]", 
      reqs: "macOS 11+, Apple Silicon / Intel",
      features: ["Native Performance", "Offline Database", "Auto-updates"]
    },
  ];

  return (
    <section id="download" className="py-12 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Start building your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">business empire today.</span>
          </motion.h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Download the desktop app for offline support and direct hardware integration, or start immediately on the web.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {platforms.map((p, i) => (
            <motion.a
              key={i}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col p-8 bg-white border border-slate-200 rounded-[2rem] transition-all duration-300 shadow-sm hover:shadow-[0_20px_50px_-12px_rgba(99,102,241,0.2)] overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${p.color}`}></div>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${p.color} shadow-inner`}>
                    <p.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{p.name}</h3>
                    <div className="text-sm font-semibold text-slate-500 mt-1">{p.reqs}</div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[#6366F1] group-hover:bg-[#6366F1] group-hover:text-white transition-colors">
                  <Download className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <Check className="h-4 w-4 text-[#10B981]" /> {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                <span className="text-sm font-bold text-[#6366F1] bg-[#6366F1]/10 px-3 py-1 rounded-full">{p.version}</span>
                <span className="text-sm font-semibold text-slate-400">{p.size}</span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/download" className="relative group inline-block">
            <MagneticButton className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center gap-3">
              <Download className="h-5 w-5" />
              Download for Windows
            </MagneticButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#030712] pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#6366F1]/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <Monitor className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">BillingSystem</h3>
            </div>
            
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed font-medium">
              The modern operating system for retail businesses. Lightning-fast billing, intelligent inventory, and deep financial analytics.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#6366F1] hover:border-[#6366F1] transition-all cursor-pointer text-slate-300 shadow-sm">X</div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#6366F1] hover:border-[#6366F1] transition-all cursor-pointer text-slate-300 shadow-sm">in</div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#6366F1] hover:border-[#6366F1] transition-all cursor-pointer text-slate-300 shadow-sm">fb</div>
            </div>
          </div>
          
          <div className="lg:col-start-4">
            <h4 className="text-white font-bold mb-6 text-sm">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Point of Sale</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Inventory Sync</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Digital Khata</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">GST Reports</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Documentation</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Hardware Setup</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">API Reference</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">About Us</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Careers</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Privacy Policy</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} BillingSystem Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Designed with</span>
            <span className="text-rose-500">♥</span>
            <span>for Modern Retail</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
