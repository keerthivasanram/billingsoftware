"use client";

import { motion } from "framer-motion";
import { Database, TrendingUp, Users, FileText, Smartphone, Monitor } from "lucide-react";

export function ProductEcosystem() {
  const modules = [
    { name: "Inventory", icon: Database, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", border: "border-[#06B6D4]/30", angle: 0 },
    { name: "Analytics", icon: TrendingUp, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/30", angle: 72 },
    { name: "CRM", icon: Users, color: "text-[#10B981]", bg: "bg-[#10B981]/10", border: "border-[#10B981]/30", angle: 144 },
    { name: "Khata", icon: Smartphone, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/30", angle: 216 },
    { name: "GST", icon: FileText, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/30", angle: 288 },
  ];

  return (
    <section className="py-12 bg-[#030712] relative overflow-hidden text-white flex flex-col items-center justify-center min-h-[900px]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366F1]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="text-center mb-24 relative z-10 max-w-2xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
          A Fully Integrated <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#06B6D4]">Data Ecosystem</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium">
          The POS Core sits at the center of your business. Data flows instantly to Inventory, Khata, CRM, and Reports without manual syncs.
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-[500px] flex items-center justify-center">
        
        {/* SVG Connections & Particle Flows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: "drop-shadow(0 0 10px rgba(99,102,241,0.2))" }}>
          {modules.map((m, i) => {
            const rad = (m.angle * Math.PI) / 180;
            const r = 220; // radius
            // Center is roughly 50% 50%, SVG coordinates are relative to the viewBox or absolute if 100%
            // To make this responsive, we use percentage based lines using stroke-dasharray animations
            return (
              <g key={i}>
                <line 
                  x1="50%" y1="50%" 
                  x2={`calc(50% + ${Math.cos(rad) * r}px)`} 
                  y2={`calc(50% + ${Math.sin(rad) * r}px)`} 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="2" 
                />
                <motion.line 
                  x1="50%" y1="50%" 
                  x2={`calc(50% + ${Math.cos(rad) * r}px)`} 
                  y2={`calc(50% + ${Math.sin(rad) * r}px)`} 
                  stroke="rgba(99,102,241,0.6)" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "10 200", strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -210 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: i * 0.4
                  }}
                />
                <motion.line 
                  x1={`calc(50% + ${Math.cos(rad) * r}px)`} 
                  y2={`calc(50% + ${Math.sin(rad) * r}px)`} 
                  x2="50%" y1="50%" 
                  stroke="rgba(6,182,212,0.6)" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "10 200", strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -210 }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: i * 0.3 + 1
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Central Node */}
        <div className="absolute z-20 flex flex-col items-center justify-center">
          {/* Rotating energy rings */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-40px] rounded-full border-2 border-dashed border-[#6366F1]/30 pointer-events-none"
          />
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-60px] rounded-full border border-[#06B6D4]/20 pointer-events-none"
          />
          
          {/* Breathing glow */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-20px] rounded-full bg-[#6366F1]/20 blur-xl pointer-events-none"
          />
          
          <div className="w-28 h-28 bg-[#0F172A] rounded-3xl border border-[#6366F1]/50 shadow-[0_0_50px_rgba(99,102,241,0.4)] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/20 to-transparent"></div>
            <Monitor className="h-10 w-10 text-white mb-2 relative z-10" />
            <span className="font-bold text-sm text-white relative z-10">POS Core</span>
          </div>
        </div>

        {/* Orbiting Nodes */}
        {modules.map((m, i) => {
          const rad = (m.angle * Math.PI) / 180;
          const r = 220;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 50, damping: 10 }}
              className="absolute z-10"
              style={{
                transform: `translate(${Math.cos(rad) * r}px, ${Math.sin(rad) * r}px)`,
              }}
            >
              <div className={`w-20 h-20 ${m.bg} backdrop-blur-lg rounded-2xl border ${m.border} flex flex-col items-center justify-center hover:scale-110 transition-transform cursor-default group relative overflow-hidden`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-${m.color.split('-')[1]}/20 to-transparent`}></div>
                <m.icon className={`h-7 w-7 ${m.color} mb-1.5`} />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{m.name}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
