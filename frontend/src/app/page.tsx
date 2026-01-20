"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import SecurityChart from "@/src/components/SecurityChart";
import ScanStatsChart from "@/src/components/ScanStatsChart";
import CyberNewsWidget from "@/src/components/CyberNewsWidget";
import ThreatMap from "@/src/components/ThreatMap";
import { Shield, Lock, Eye, Zap, Cpu, Activity, Globe } from "lucide-react";
import SpotlightBackground from "@/src/components/SpotlightBackground";

export default function LandingPage() {
  const [textIndex, setTextIndex] = useState(0);
  const words = ["IDENTITY", "FINANCES", "DATA", "FUTURE"];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative"
      suppressHydrationWarning={true}
    >
      <SpotlightBackground />

      {/* BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[80px]"></div>
        {/* GRID */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>

      <Navbar />

      <main className="relative z-10 px-4 pt-32 pb-20 max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <section className="text-center mb-32 relative">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-cyan-400">CYBERBUDDY X GEN-2 IS LIVE</span>
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
            SECURE YOUR <br />
            <AnimatePresence mode="wait">
              <motion.span
                key={words[textIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 block h-[1.1em]"
              >
                {words[textIndex]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            The world's first <strong className="text-white">AI-Native Security Suite</strong>. Detects phishing in 0.4s using Computer Vision and Llama-3 Intelligence.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
            <Link href="/scanners/url" className="relative group px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-slate-200 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300">
              <span>SCAN NOW</span>
            </Link>
            <Link href="/news" className="px-8 py-4 bg-slate-900 border border-slate-700 text-slate-300 font-bold text-lg rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center gap-2">
              <Globe className="w-5 h-5" />
              GLOBAL INTEL
            </Link>
          </div>

        </section>

        {/* DASHBOARD GRID */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
          {/* STATS CARD - LARGE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8"
          >
            <SecurityChart />
          </motion.div>

          {/* NEW SCAN STATS CHART */}
          <div className="md:col-span-4">
            <ScanStatsChart />
          </div>
        </section>

        {/* QUICK ACTIONS ROW */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <Link href="/scanners/email" className="group bg-gradient-to-br from-violet-600/20 to-slate-900 border border-violet-500/20 rounded-3xl p-6 hover:border-violet-500/80 transition-all cursor-pointer relative overflow-hidden flex items-center gap-6">
            <div className="p-4 bg-violet-500/10 rounded-2xl"><Zap className="w-8 h-8 text-violet-500" /></div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Email Guard</h3>
              <p className="text-sm text-slate-400">Analyze email headers & urgency.</p>
            </div>
            <Activity className="w-12 h-12 text-violet-500/10 absolute right-4 bottom-4" />
          </Link>
          <Link href="/scanners/visual" className="group bg-gradient-to-br from-emerald-600/20 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 hover:border-emerald-500/80 transition-all cursor-pointer relative overflow-hidden flex items-center gap-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl"><Eye className="w-8 h-8 text-emerald-500" /></div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Visual ID</h3>
              <p className="text-sm text-slate-400">Detect logo spoofing with AI Vision.</p>
            </div>
            <Cpu className="w-12 h-12 text-emerald-500/10 absolute right-4 bottom-4" />
          </Link>
        </section>

        {/* THREAT MAP & NEWS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
          <div className="md:col-span-12 lg:col-span-6 bg-slate-900/50 border border-slate-800 rounded-3xl p-1 overflow-hidden h-[600px]">
            <ThreatMap />
          </div>
          <div className="md:col-span-12 lg:col-span-6">
            <CyberNewsWidget />
          </div>
        </div>

        {/* FEATURES ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Cpu, title: "Llama-3 Engine", desc: "Thinking model that explains threats." },
            { icon: Shield, title: "Zero Trust", desc: "Verifies every packet, every time." },
            { icon: Lock, title: "Local Privacy", desc: "Passwords generated on-device." },
          ].map((f, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800/60 transition-colors">
              <div className="p-3 bg-slate-800 rounded-lg text-cyan-400 h-fit">
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">{f.title}</h4>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
