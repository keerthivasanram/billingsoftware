"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Store, Download, LogIn, Command } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-6 px-6 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto transition-all duration-300 w-full max-w-5xl rounded-full border ${
          scrolled 
            ? "bg-white/80 backdrop-blur-xl border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-3 px-6" 
            : "bg-transparent border-transparent py-4 px-2"
        } flex items-center justify-between`}
      >
        {/* Left */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            BillingSystem
          </span>
        </div>

        {/* Center */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Demo", "Ecosystem", "Integrations", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full border border-slate-200/50 text-xs text-slate-500 font-medium mr-2">
            <Command className="w-3 h-3" /> K
          </div>
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#6366F1] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link href="/download">
            <MagneticButton 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#030712] rounded-full shadow-lg"
              glowColor="rgba(99, 102, 241, 0.4)"
            >
              <Download className="h-4 w-4" />
              Download
            </MagneticButton>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}
