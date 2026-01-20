"use client";
import React from 'react';
import Navbar from '@/src/components/Navbar';
import PageHeader from '@/src/components/PageHeader';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-4 max-w-5xl animate-fade-in pb-20">
                <PageHeader
                    title="Developer Documentation"
                    subtitle="Integrate CyberBuddy's threat intelligence directly into your applications."
                    icon="📚"
                />

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-fit">
                        <h4 className="font-bold text-white mb-4">CONTENTS</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="text-cyan-400 font-bold border-l-2 border-cyan-400 pl-3">Introduction</li>
                            <li className="hover:text-white pl-3 cursor-pointer">Authentication</li>
                            <li className="hover:text-white pl-3 cursor-pointer">API Endpoints</li>
                            <li className="hover:text-white pl-3 cursor-pointer">Rate Limits</li>
                            <li className="hover:text-white pl-3 cursor-pointer">SDKs</li>
                        </ul>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-8">
                        <section className="glass-card p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
                            <p className="text-slate-400 mb-4">
                                The CyberBuddy API allows you to programmatically scan URLs, emails, and images. All endpoints are protected by JWT authentication.
                            </p>
                            <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
                                <span className="text-violet-400">POST</span> https://api.cyberbuddy.io/v1/scan/url
                            </div>
                        </section>

                        <section className="glass-card p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                            <p className="text-slate-400 mb-4">
                                Include your API key in the `Authorization` header.
                            </p>
                            <pre className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto">
                                {`curl -X POST https://api.cyberbuddy.io/v1/scan/url \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"url": "http://suspicious-site.com"}'`}
                            </pre>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
