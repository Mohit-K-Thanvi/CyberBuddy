"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/src/components/Navbar';
import ResultCard from '@/src/components/ResultCard';
import confetti from 'canvas-confetti';

interface HistoryItem {
    id: number;
    url: string;
    prediction: string;
    confidence: number;
    source: string;
    timestamp: string;
}

export default function UrlScannerPage() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

    const fetchHistory = async () => {
        try {
            const res = await API.get('/scan/history');
            // Filter only Web/URL scans
            setHistory(res.data.filter((h: HistoryItem) => h.source === 'web' || h.source === 'url' || h.source === 'extension'));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await API.post('/scan/input', { url, source: 'url' });
            setResult(res.data);
            if (res.data.prediction === 'legitimate') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#22d3ee', '#8b5cf6'] });
            }
            fetchHistory(); // Refresh
        } catch (err) {
            alert('Scan Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30">
            <Navbar />

            <main className="container mx-auto px-4 pb-20 max-w-5xl animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-4">URL <span className="text-cyan-400">Deep Scan</span></h2>
                    <p className="text-slate-400">Analyze URLs for phishing patterns using our Hybrid AI + VirusTotal Engine.</p>
                </div>

                <div className="glass-card p-10 rounded-2xl mb-12 border border-cyan-500/20 shadow-lg shadow-cyan-900/10">
                    <form onSubmit={handleScan} className="relative group max-w-2xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative flex bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-1 focus-within:border-cyan-500 transition-colors">
                            <input
                                type="url" required
                                placeholder="https://suspicious-link.com"
                                className="flex-1 bg-transparent px-6 py-4 text-lg text-white placeholder-slate-600 outline-none"
                                value={url} onChange={(e) => setUrl(e.target.value)}
                            />
                            <button type="submit" disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-lg transition-all disabled:opacity-50 text-lg">
                                {loading ? 'SCANNING' : 'ANALYZE'}
                            </button>
                        </div>
                    </form>

                    <div id="result-anchor">
                        <ResultCard result={result} />

                        {result && result.prediction && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={async () => {
                                        const res = await fetch('http://127.0.0.1:8000/report/generate', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                scan_type: 'url',
                                                target: url,
                                                result: result.prediction,
                                                confidence: result.confidence * 100,
                                                explanation: result.explanation || 'No explanation available.'
                                            })
                                        });
                                        const blob = await res.blob();
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.download = `CyberBuddy_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
                                        link.click();
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                                >
                                    📄 Download Security Report (PDF)
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* HISTORY SECTION */}
                <div className="mt-16">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                        Recent Scan History
                    </h3>

                    <div className="grid gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors group border-l-4 border-transparent hover:border-cyan-500">
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
                                <div className="text-right pl-4">
                                    <div className="text-lg font-bold text-slate-400">{(item.confidence * 100).toFixed(0)}%</div>
                                    <div className="text-[10px] text-slate-600 uppercase">Confidence</div>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-center py-10 text-slate-500">No recent URL scans found.</div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
