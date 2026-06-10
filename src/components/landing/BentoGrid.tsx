"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { TrendingUp, Database, FileText, Users, PieChart } from "lucide-react";
import React, { MouseEvent } from "react";

function HoverCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(99, 102, 241, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </motion.div>
  );
}

export function BentoGrid() {
  return (
    <section className="py-12 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 tracking-tight">
            Everything you need. <br />
            <span className="text-[#6366F1]">Nothing you don't.</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl font-medium">
            A complete suite of tools designed to work together seamlessly, giving you total control over every aspect of your retail business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
          
          {/* Sales Card - Large */}
          <HoverCard className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6366F1]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-[#6366F1] font-bold text-sm uppercase tracking-wider mb-2">
                  <TrendingUp className="h-4 w-4" /> Real-time Sales
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Monitor revenue as it happens.</h3>
              </div>
            </div>
            
            <div className="relative z-10 h-32 flex items-end gap-2">
              {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative overflow-hidden group-hover:bg-indigo-50 transition-colors">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-[#6366F1] to-[#8B5CF6] rounded-t-lg"
                  ></motion.div>
                </div>
              ))}
            </div>
          </HoverCard>

          {/* Inventory Card */}
          <HoverCard className="bg-[#030712] rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-2xl transition-all text-white">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#06B6D4]/20 to-transparent"></div>
            
            <div className="flex items-center gap-2 text-[#06B6D4] font-bold text-sm uppercase tracking-wider mb-4 relative z-10">
              <Database className="h-4 w-4" /> Smart Inventory
            </div>
            <h3 className="text-xl font-bold mb-6 relative z-10">Never run out of stock again.</h3>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="text-slate-400">Premium Coffee</span>
                <span className="text-[#10B981] font-mono">In Stock (124)</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                <span className="text-slate-400">Almond Milk</span>
                <span className="text-[#EF4444] font-mono">Low (3)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Green Tea</span>
                <span className="text-[#F59E0B] font-mono">Reorder (12)</span>
              </div>
            </div>
          </HoverCard>

          {/* Customer Khata Card */}
          <HoverCard className="md:col-span-2 lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
             <div className="absolute top-0 left-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm uppercase tracking-wider mb-4 relative z-10">
              <Users className="h-4 w-4" /> Digital Khata
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 relative z-10">Credit tracking made simple.</h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-700">Rahul Sharma</span>
                <span className="text-[#EF4444] font-bold">₹1,250</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '60%' }} className="h-full bg-[#EF4444]"></motion.div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Credit Limit: ₹2,000</p>
            </div>
          </HoverCard>

          {/* GST Card */}
          <HoverCard className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl translate-x-1/4 translate-y-1/4"></div>
            
            <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-sm uppercase tracking-wider mb-4 relative z-10">
              <FileText className="h-4 w-4" /> 1-Click GST
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 relative z-10">Tax filing, automated.</h3>
            
            <div className="flex flex-col gap-2 relative z-10">
              <div className="bg-slate-50 px-4 py-3 rounded-xl flex justify-between items-center font-mono text-sm border border-slate-100">
                <span className="text-slate-500">GSTR-1</span>
                <span className="text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded">Ready</span>
              </div>
              <div className="bg-slate-50 px-4 py-3 rounded-xl flex justify-between items-center font-mono text-sm border border-slate-100">
                <span className="text-slate-500">GSTR-3B</span>
                <span className="text-[#6366F1] font-bold bg-[#6366F1]/10 px-2 py-0.5 rounded">Generating</span>
              </div>
            </div>
          </HoverCard>

          {/* Reports Card - Wide */}
          <HoverCard className="md:col-span-3 lg:col-span-3 bg-[#0F172A] rounded-3xl p-8 border border-white/10 shadow-lg hover:shadow-2xl transition-all text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/20 to-transparent opacity-50"></div>
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 text-[#8B5CF6] font-bold text-sm uppercase tracking-wider mb-4">
                <PieChart className="h-4 w-4" /> Deep Analytics
              </div>
              <h3 className="text-3xl font-bold mb-4">Understand your business.</h3>
              <p className="text-slate-400">Discover top-selling items, busiest hours, and profit margins across your entire product range with beautiful visual reports.</p>
            </div>
            
            <div className="relative z-10 w-48 h-48 flex-shrink-0 relative">
              {/* CSS Pie Chart Mockup */}
              <motion.div 
                initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
                whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="w-full h-full rounded-full border-[16px] border-[#1E293B] relative"
                style={{
                  background: 'conic-gradient(#6366F1 0% 45%, #06B6D4 45% 75%, #10B981 75% 100%)',
                  borderRadius: '50%'
                }}
              >
                <div className="absolute inset-4 bg-[#0F172A] rounded-full flex items-center justify-center">
                  <span className="font-bold text-xl">Profit</span>
                </div>
              </motion.div>
            </div>
          </HoverCard>

        </div>
      </div>
    </section>
  );
}
