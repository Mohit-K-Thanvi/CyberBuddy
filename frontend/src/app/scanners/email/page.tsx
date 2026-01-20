"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/src/components/Navbar';
import ResultCard from '@/src/components/ResultCard';
import confetti from 'canvas-confetti';

interface HistoryItem {
    id: number;
    url: string; // Used for "Email: Sender | Subject"
    prediction: string;
    confidence: number;
    source: string;
    timestamp: string;
}

export default function EmailScannerPage() {
    const [sender, setSender] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

    const fetchHistory = async () => {
        try {
            const res = await API.get('/scan/history');
            setHistory(res.data.filter((h: HistoryItem) => h.source === 'email'));
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
            const res = await API.post('/scan/email/', { sender, subject, body });
            setResult({ ...res.data, source: 'Email' }); // Add source for ResultCard
            if (res.data.prediction === 'legitimate') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#d946ef'] });
            }
            fetchHistory();
        } catch (err) {
            alert('Scan Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30">
            <Navbar />

            <main className="container mx-auto px-4 pb-20 max-w-5xl animate-fade-in">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold mb-4">Email <span className="text-violet-400">Forensics</span></h2>
                    <p className="text-slate-400">Analyze email headers, body, and links for spoofing and phishing attempts.</p>
                </div>

                <div className="glass-card p-8 md:p-12 rounded-2xl mb-12 border border-violet-500/20 shadow-lg shadow-violet-900/10">
                    <form onSubmit={handleScan} className="max-w-3xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sender Address</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                                    placeholder="e.g. support@paypal-security.com"
                                    value={sender} onChange={(e) => setSender(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject Line</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                                    placeholder="e.g. Action Required: Account Suspended"
                                    value={subject} onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Body Content</label>
                            <textarea
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors font-mono text-sm h-40"
                                placeholder="Paste the full email content here..."
                                value={body} onChange={(e) => setBody(e.target.value)}
                            ></textarea>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white shadow-lg shadow-violet-900/20 hover:scale-[1.01] transition-transform text-lg">
                            {loading ? 'ANALYZING THREATS...' : 'RUN FORENSIC ANALYSIS'}
                        </button>
                    </form>

                    <ResultCard result={result} />
                </div>

                {/* HISTORY SECTION */}
                <div className="mt-16">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-violet-500 rounded-full"></span>
                        Recent Email Scans
                    </h3>

                    <div className="grid gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="glass-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors group border-l-4 border-transparent hover:border-violet-500">
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
                            <div className="text-center py-10 text-slate-500">No recent Email scans found.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
