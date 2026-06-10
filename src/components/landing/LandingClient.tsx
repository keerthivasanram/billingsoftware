"use client";

import { useState } from "react";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LivePosDemo } from "@/components/landing/LivePosDemo";
import { ProductEcosystem } from "@/components/landing/ProductEcosystem";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { ScrollStory } from "@/components/landing/ScrollStory";
import { ScreenshotShowcase } from "@/components/landing/ScreenshotShowcase";
import { Integrations, TrustSection } from "@/components/landing/IntegrationsAndTrust";
import { DownloadSection, Footer } from "@/components/landing/DownloadAndFooter";
import { Preloader } from "@/components/landing/Preloader";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

export function LandingClient() {
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <SmoothScroll>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen bg-slate-50 font-sans selection:bg-[#6366F1]/20 selection:text-[#6366F1] overflow-x-hidden relative"
          >
            {/* Scroll Progress Indicator */}
            <motion.div
              className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] origin-left z-[60]"
              style={{ scaleX }}
            />
            
            <Navbar />
            
            <main>
              <HeroSection />
              <LivePosDemo />
              <ProductEcosystem />
              <ScrollStory />
              <BentoGrid />
              <ScreenshotShowcase />
              <Integrations />
              <TrustSection />
              <DownloadSection />
            </main>

            <Footer />
          </motion.div>
        </SmoothScroll>
      )}
    </>
  );
}
