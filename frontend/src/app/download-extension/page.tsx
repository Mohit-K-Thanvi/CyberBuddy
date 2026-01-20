"use client";
import React from 'react';
import Navbar from '@/src/components/Navbar';
import PageHeader from '@/src/components/PageHeader';

export default function DownloadExtensionPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-4 max-w-4xl animate-fade-in pb-20">
                <PageHeader
                    title="Install CyberBuddy X"
                    subtitle="Protect your browser with our advanced Chromium extension. Real-time blocking, zero latency."
                    icon="🧩"
                />

                <div className="glass-card p-10 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-900/20 text-center mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Installation Steps (Developer Mode)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                            <div className="mb-4 text-4xl">1️⃣</div>
                            <h3 className="font-bold text-white mb-2">Enable Dev Mode</h3>
                            <p className="text-slate-400 text-sm">Open <code className="bg-slate-800 px-1 rounded">chrome://extensions</code> and toggle "Developer mode" in the top tight.</p>
                        </div>
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                            <div className="mb-4 text-4xl">2️⃣</div>
                            <h3 className="font-bold text-white mb-2">Load Unpacked</h3>
                            <p className="text-slate-400 text-sm">Click "Load unpacked" and select the <code className="bg-slate-800 px-1 rounded">/chrome_extension</code> folder from the project.</p>
                        </div>
                        <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                            <div className="mb-4 text-4xl">3️⃣</div>
                            <h3 className="font-bold text-white mb-2">Pin & Login</h3>
                            <p className="text-slate-400 text-sm">Pin the "CB" icon. Click it and login with your CyberBuddy account to sync threats.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button className="px-8 py-4 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed opacity-50 flex items-center gap-3 mx-auto">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.783 1.107l-1.123 1.083c-.29-.277-.796-.6-1.66-.6-1.427 0-2.592 1.178-2.592 2.493s1.165 2.493 2.592 2.493c1.655 0 2.273-1.187 2.368-1.967h-2.368v-1.362h3.948c.037.214.065.432.065.732 0 2.518-1.685 4.194-4.013 4.194z" /></svg>
                        Available soon on Chrome Web Store
                    </button>
                    <p className="mt-4 text-xs text-slate-500">Current Version: v2.1.0 Beta (Local Load Only)</p>
                </div>
            </main>
        </div>
    );
}
