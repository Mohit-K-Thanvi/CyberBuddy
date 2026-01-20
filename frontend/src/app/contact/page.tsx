"use client";
import React, { useState } from 'react';
import Navbar from '@/src/components/Navbar';
import PageHeader from '@/src/components/PageHeader';

export default function ContactPage() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-4 max-w-4xl animate-fade-in pb-20">
                <PageHeader
                    title="Contact Support"
                    subtitle="Our team is on standby 24/7 to assist with security incidents and inquiries."
                    icon="🎧"
                />

                <div className="glass-card p-10 rounded-3xl border border-slate-800">
                    {sent ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6">✅</div>
                            <h2 className="text-3xl font-bold text-white mb-4">Message Received</h2>
                            <p className="text-slate-400">Ticket #CB-{Math.floor(Math.random() * 99999)} has been created. We will respond shortly.</p>
                            <button onClick={() => setSent(false)} className="mt-8 text-cyan-400 font-bold hover:underline">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">First Name</label>
                                    <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Name</label>
                                    <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <input type="email" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                                <textarea required rows={5} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none"></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/20 hover:scale-[1.01] transition-transform">
                                SEND TRANSMISSION
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
