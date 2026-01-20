"use client";
import React from 'react';
import Navbar from '@/src/components/Navbar';
import PageHeader from '@/src/components/PageHeader';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-4 max-w-5xl animate-fade-in pb-20">
                <PageHeader
                    title="Our Mission"
                    subtitle="Securing the digital world through transparency, advanced AI, and community collaboration."
                    icon="🌐"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 whitespace-pre-line leading-loose text-slate-300">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Who We Are</h3>
                        <p className="mb-6">
                            CyberBuddy X was founded with a single goal: to make enterprise-grade phishing detection accessible to everyone. We believe that security shouldn't be a luxury.
                        </p>
                        <p>
                            Our team consists of security researchers, AI engineers, and ethical hackers dedicated to staying one step ahead of digital threats.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">The Engine</h3>
                        <p className="mb-6">
                            At the core of CyberBuddy is "Sentinal" - our proprietary AI model trained on over 10 million phishing datasets. It simulates human behavior to detect visual spoofing that traditional regex filters miss.
                        </p>
                        <div className="flex gap-4">
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center flex-1">
                                <div className="text-3xl font-bold text-cyan-400">99.8%</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Accuracy</div>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center flex-1">
                                <div className="text-3xl font-bold text-violet-400">50ms</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Latency</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
