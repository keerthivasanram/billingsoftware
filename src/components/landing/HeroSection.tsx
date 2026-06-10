"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ReceiptText, TrendingUp, AlertTriangle, Package, Printer, ScanLine } from "lucide-react";

function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);
  return mousePosition;
}

// Background Mesh and Particles (Layer 1)
function BackgroundGlow() {
  const [particles, setParticles] = useState<any[]>([]);
  const mouse = useMousePosition();
  
  // Parallax calculation
  const px = typeof window !== 'undefined' ? (mouse.x - window.innerWidth / 2) * 0.02 : 0;
  const py = typeof window !== 'undefined' ? (mouse.y - window.innerHeight / 2) * 0.02 : 0;

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x1: `${Math.random() * 100}vw`,
        y1: `${Math.random() * 100}vh`,
        x2: `${Math.random() * 100}vw`,
        y2: `${Math.random() * 100}vh`,
        duration: Math.random() * 30 + 30,
        size: Math.random() * 4 + 1,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 bg-[#F8FAFC]">
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
      
      {/* Layered Gradient Orbs */}
      <motion.div 
        animate={{ x: px, y: py }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#6366F1]/10 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate]" 
      />
      <motion.div 
        animate={{ x: px * -1, y: py * -1 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#8B5CF6]/10 blur-[150px] animate-[pulse_12s_ease-in-out_infinite_alternate_reverse]" 
      />
      
      {/* Floating abstract particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#6366F1]/20"
          style={{ width: p.size, height: p.size }}
          initial={{ x: p.x1, y: p.y1 }}
          animate={{ y: [null, p.y2], x: [null, p.x2] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// Sub-component for FloatingInvoices (Layer 2)
function FloatingInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const mouse = useMousePosition();

  useEffect(() => {
    setInvoices(
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        number: `INV-2026${Math.floor(Math.random() * 10000)}`,
        amount: (Math.random() * 5000 + 100).toFixed(2),
        status: Math.random() > 0.3 ? "PAID" : "PENDING",
        delay: Math.random() * 15,
        duration: Math.random() * 15 + 20,
        xOffset: Math.random() * 80 - 40,
        z: Math.random() * 100, // Depth value
      }))
    );
  }, []);

  return (
    <div className="absolute left-0 top-0 bottom-0 w-1/3 overflow-hidden pointer-events-none opacity-40 md:opacity-100 hidden md:block z-0 perspective-1000">
      {invoices.map((inv) => {
        // Parallax depth calculation
        const depthFactor = inv.z / 100; // 0 to 1
        const blur = depthFactor > 0.7 ? 'blur(3px)' : depthFactor > 0.4 ? 'blur(1px)' : 'blur(0px)';
        const scale = 1 - (depthFactor * 0.4); // Farther = smaller
        const opacity = 1 - (depthFactor * 0.5); // Farther = more transparent
        
        const px = typeof window !== 'undefined' ? (mouse.x - window.innerWidth / 2) * (0.05 * (1 - depthFactor)) : 0;
        const py = typeof window !== 'undefined' ? (mouse.y - window.innerHeight / 2) * (0.05 * (1 - depthFactor)) : 0;

        return (
          <motion.div
            key={inv.id}
            className="absolute bottom-[-100px] left-1/2 w-48 bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 transform-style-3d"
            style={{ filter: blur }}
            initial={{ y: 0, x: inv.xOffset, rotateX: Math.random() * 20 - 10, rotateY: Math.random() * 20 - 10, rotateZ: Math.random() * 20 - 10, opacity: 0, scale }}
            animate={{
              y: -1200,
              x: inv.xOffset + px + (Math.random() * 50 - 25),
              rotateX: Math.random() * 40 - 20,
              rotateY: Math.random() * 40 - 20,
              rotateZ: Math.random() * 40 - 20,
              opacity: [0, opacity, opacity, 0],
            }}
            transition={{
              duration: inv.duration,
              repeat: Infinity,
              delay: inv.delay,
              ease: "linear",
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-slate-500">{inv.number}</span>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${inv.status === 'PAID' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                {inv.status}
              </span>
            </div>
            <div className="h-px bg-slate-100 w-full mb-2"></div>
            <p className="text-sm font-bold text-slate-800">₹{inv.amount}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// Animated Counter Hook
function AnimatedCounter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let startTimestamp: number;
    let reqId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setValue(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
        reqId = requestAnimationFrame(step);
      } else {
        // Periodic subtle updates to simulate live data
        setTimeout(() => {
          setValue(v => v + Math.floor(Math.random() * 5) + 1);
        }, Math.random() * 5000 + 3000);
      }
    };
    reqId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(reqId);
  }, [from, to, duration]);

  return <>{value.toLocaleString("en-IN")}</>;
}

// Center Dashboard (Layer 3)
function DashboardSimulation({ scrollYProgress }: { scrollYProgress: any }) {
  const mouse = useMousePosition();
  const px = typeof window !== 'undefined' ? (mouse.x - window.innerWidth / 2) * 0.015 : 0;
  const py = typeof window !== 'undefined' ? (mouse.y - window.innerHeight / 2) * 0.015 : 0;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, x: px, y: py }}
      transition={{ 
        duration: 1, ease: "easeOut",
        x: { type: "spring", stiffness: 50, damping: 20 },
        y: { type: "spring", stiffness: 50, damping: 20 }
      }}
      className="relative z-10 w-full max-w-2xl bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
      
      <div className="h-12 bg-white/50 border-b border-white/40 flex items-center px-4 gap-2 relative z-10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-sm"></div>
        </div>
        <div className="mx-auto w-1/3 h-5 bg-white/60 rounded-md shadow-inner"></div>
      </div>
      <div className="p-8 grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/90 rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-[#6366F1] mb-2">
            <div className="p-2 bg-[#6366F1]/10 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
            <span className="font-semibold text-sm">Today's Revenue</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            ₹<AnimatedCounter from={0} to={245000} duration={2.5} />
          </p>
        </div>
        
        <div className="bg-white/90 rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-[#10B981] mb-2">
            <div className="p-2 bg-[#10B981]/10 rounded-xl"><ReceiptText className="h-5 w-5" /></div>
            <span className="font-semibold text-sm">Today's Orders</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            <AnimatedCounter from={0} to={1234} duration={2} />
          </p>
        </div>

        <div className="bg-white/90 rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-[#8B5CF6] mb-2">
            <div className="p-2 bg-[#8B5CF6]/10 rounded-xl"><Package className="h-5 w-5" /></div>
            <span className="font-semibold text-sm">Net Profit</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            ₹<AnimatedCounter from={0} to={82340} duration={3} />
          </p>
        </div>

        <div className="bg-white/90 rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-[#EF4444] mb-2">
            <div className="p-2 bg-[#EF4444]/10 rounded-xl"><AlertTriangle className="h-5 w-5" /></div>
            <span className="font-semibold text-sm">Low Stock Alerts</span>
          </div>
          <p className="text-3xl font-black text-slate-900">
            <AnimatedCounter from={0} to={12} duration={1.5} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Right Printer & Scanner (Layer 4 & 5)
function HardwareSimulation() {
  const mouse = useMousePosition();
  
  // Layer 4: Scanner
  const px4 = typeof window !== 'undefined' ? (mouse.x - window.innerWidth / 2) * 0.025 : 0;
  const py4 = typeof window !== 'undefined' ? (mouse.y - window.innerHeight / 2) * 0.025 : 0;

  // Layer 5: Printer (closest)
  const px5 = typeof window !== 'undefined' ? (mouse.x - window.innerWidth / 2) * 0.035 : 0;
  const py5 = typeof window !== 'undefined' ? (mouse.y - window.innerHeight / 2) * 0.035 : 0;

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[30%] hidden lg:flex flex-col items-center gap-10 pointer-events-none z-20">
      
      {/* Layer 4: Scanner */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: px4, y: py4, opacity: 1 }}
        transition={{ 
          opacity: { delay: 0.5, duration: 1 },
          x: { type: "spring", stiffness: 40, damping: 20 },
          y: { type: "spring", stiffness: 40, damping: 20 }
        }}
        className="w-56 bg-[#030712] rounded-2xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10 backdrop-blur-xl"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,1)] animate-[scan_2s_ease-in-out_infinite_alternate]" />
        
        <div className="flex items-center gap-3 text-white mb-4 relative z-10">
          <ScanLine className="h-5 w-5 text-[#06B6D4] animate-pulse" />
          <span className="font-bold text-sm">Scanner Active</span>
        </div>
        <div className="space-y-3 relative z-10">
          {["Milk", "Rice", "Oil"].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 2, repeat: Infinity, repeatDelay: 6 }}
              className="bg-[#0F172A] rounded-xl p-3 text-xs text-slate-300 font-mono flex justify-between border border-white/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#06B6D4]/10 opacity-0 animate-[flash_2s_ease-out_infinite]" style={{ animationDelay: `${1 + i * 2}s` }}></div>
              <span className="relative z-10">{item}</span>
              <span className="text-[#10B981] relative z-10 font-bold">Scanned</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Layer 5: Printer */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: px5, y: py5, opacity: 1 }}
        transition={{ 
          opacity: { delay: 0.7, duration: 1 },
          x: { type: "spring", stiffness: 30, damping: 20 },
          y: { type: "spring", stiffness: 30, damping: 20 }
        }}
        className="w-56 relative"
      >
        <div className="bg-[#0F172A] rounded-t-2xl p-4 z-20 relative shadow-2xl border border-white/10 flex justify-center">
          <Printer className="h-6 w-6 text-slate-400" />
          {/* Subtle vibration effect */}
          <motion.div 
            animate={{ x: [-1, 1, -1, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1.5 }}
            className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#10B981] rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>
        <div className="absolute top-12 left-4 right-4 h-64 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.2)] overflow-hidden -z-10 origin-top flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <motion.div
            animate={{ y: [0, -150] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="p-4 text-[10px] font-mono text-slate-700 space-y-1.5"
          >
            <p className="text-center font-bold text-xs mb-3 text-slate-900 border-b border-slate-200 pb-2">STORE RECEIPT</p>
            <div className="flex justify-between"><span>MILK</span><span>₹60</span></div>
            <div className="flex justify-between"><span>BREAD</span><span>₹40</span></div>
            <div className="flex justify-between"><span>SUGAR</span><span>₹50</span></div>
            <div className="flex justify-between text-[#8B5CF6] font-semibold mt-1"><span>GST (5%)</span><span>₹7.5</span></div>
            <div className="border-t-2 border-dashed border-slate-300 my-2 pt-2 flex justify-between font-bold text-slate-900 text-xs">
              <span>TOTAL</span><span>₹157.5</span>
            </div>
            
            <div className="h-12 border-b-2 border-slate-200 border-dashed relative">
              {/* Tearing shadow effect */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-slate-200 to-transparent"></div>
            </div>
            
            <p className="text-center font-bold text-xs mb-3 text-slate-900 border-b border-slate-200 pb-2 mt-4">STORE RECEIPT</p>
            <div className="flex justify-between"><span>MILK</span><span>₹60</span></div>
            <div className="flex justify-between"><span>BREAD</span><span>₹40</span></div>
            <div className="flex justify-between"><span>SUGAR</span><span>₹50</span></div>
            <div className="flex justify-between text-[#8B5CF6] font-semibold mt-1"><span>GST (5%)</span><span>₹7.5</span></div>
            <div className="border-t-2 border-dashed border-slate-300 my-2 pt-2 flex justify-between font-bold text-slate-900 text-xs">
              <span>TOTAL</span><span>₹157.5</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  const { scrollYProgress } = useScroll();

  return (
    <section className="relative w-full h-auto min-h-[600px] flex items-center justify-center pt-32 pb-20 overflow-hidden cursor-default">
      <BackgroundGlow />
      <FloatingInvoices />
      <HardwareSimulation />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Text placed on top */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mb-14 mt-10"
        >
          <div className="relative inline-block overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 blur-3xl rounded-full -z-10"></div>
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 40, damping: 20, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6 drop-shadow-sm pb-2"
            >
              The modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#06B6D4]">billing ecosystem.</span>
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium"
          >
            Lightning-fast point of sale and intelligent inventory for retail.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <a href="#demo" className="relative group px-8 py-4 bg-[#030712] text-white rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/50 to-[#8B5CF6]/50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">Try Interactive Demo</span>
            </a>
            <a href="#features" className="px-8 py-4 bg-white text-slate-800 rounded-full font-bold text-sm transition-all border border-slate-200 hover:border-[#6366F1]/30 hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-sm">
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        {/* Dashboard placed below */}
        <div className="w-full flex justify-center">
          <DashboardSimulation scrollYProgress={scrollYProgress} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />
    </section>
  );
}
