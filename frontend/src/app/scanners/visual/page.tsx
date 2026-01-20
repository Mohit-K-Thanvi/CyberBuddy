"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/src/components/Navbar';
import ResultCard from '@/src/components/ResultCard';
import confetti from 'canvas-confetti';

interface HistoryItem {
    id: number;
    url: string; // "Visual: Filename | Domain"
    prediction: string;
    confidence: number;
    source: string;
    timestamp: string;
}

export default function VisualScannerPage() {
    const [file, setFile] = useState<File | null>(null);
    const [domain, setDomain] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

    const fetchHistory = async () => {
        try {
            const res = await API.get('/scan/history');
            setHistory(res.data.filter((h: HistoryItem) => h.source === 'visual'));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !domain) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('domain', domain);

        try {
            const res = await API.post('/scan/visual/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult({ ...res.data, source: 'Visual ID' });
            if (res.data.prediction === 'legitimate') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399'] });
            }
            fetchHistory();
        } catch (err) {
            alert('Scan Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
            <Navbar />

            <main className="container mx-auto px-4 pb-20 max-w-5xl animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-4">Visual <span className="text-emerald-400">Identity Guard</span></h2>
                    <p className="text-slate-400">Compare website screenshots against protected official brands to detect visual phishing.</p>
                </div>

                <div className="glass-card p-10 rounded-2xl mb-12 border border-emerald-500/20 shadow-lg shadow-emerald-900/10 text-center">

                    <div
                        className="w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-slate-900/30 hover:bg-slate-900/50 transition-colors cursor-pointer relative group"
                    >
                        <input
                            type="file" accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                        <p className="text-slate-300 font-bold text-lg">{file ? file.name : "Drop Screenshot Here"}</p>
                        <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG</p>
                    </div>

                    <div className="mt-8 max-w-md mx-auto">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-left">Target Domain context</label>
                        <input
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                            placeholder="e.g. login-secure.com"
                            value={domain} onChange={(e) => setDomain(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleScan}
                        disabled={loading || !file || !domain}
                        className="mt-8 px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-900/20 hover:scale-[1.01] transition-transform text-lg"
                    >
                        {loading ? 'VERIFYING IDENTITY...' : 'VERIFY IDENTITY'}
                    </button>

                    <div className="text-left">
                        <ResultCard result={result} />
                    </div>
                </div>

                {/* HISTORY SECTION */}
                <div className="mt-16">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                        Recent Visual Verifications
                    </h3>

                    <div className="grid gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors group border-l-4 border-transparent hover:border-emerald-500">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-xs font-bold uppercase py-1 px-2 rounded ${item.prediction === 'legitimate' ? 'bg-emerald-500/10 text-emerald-400' :
                                            item.prediction === 'suspicious' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-rose-500/10 text-rose-400'
                                            }`}>
                                            {item.prediction}
                                        </span>
                                        <span className="text-slate-500 text-xs font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-slate-300 truncate font-mono text-sm group-hover:text-white transition-colors">{item.url}</p>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-center py-10 text-slate-500">No recent Visual scans found.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
