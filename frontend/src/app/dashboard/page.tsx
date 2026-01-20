"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import PasswordStrength from '../../components/PasswordStrength';
import confetti from 'canvas-confetti';

interface HistoryItem {
    id: number;
    url: string;
    prediction: string;
    confidence: number;
    timestamp: string;
}

interface Stats {
    total: number;
    malicious: number;
    safe: number;
    risk_percentage: number;
}

import ThreatMap from '../../components/ThreatMap';

// Stats & Interfaces defined above...

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'url' | 'email' | 'visual'>('url');
    const [stats, setStats] = useState<Stats | null>(null);
    const [url, setUrl] = useState('');
    const [urlResult, setUrlResult] = useState<any>(null);
    const [emailSender, setEmailSender] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailResult, setEmailResult] = useState<any>(null);
    const [visualFile, setVisualFile] = useState<File | null>(null);
    const [visualDomain, setVisualDomain] = useState('');
    const [visualResult, setVisualResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Initial Data Fetching
    const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const statsRes = await API.get('/scan/stats');
                setStats(statsRes.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    // Handlers
    const triggerSafeConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22d3ee', '#8b5cf6', '#34d399']
        });
    };

    const handleUrlScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUrlResult(null);
        try {
            const res = await API.post('/scan/input', { url });
            setUrlResult(res.data);
            if (res.data.prediction === 'legitimate') triggerSafeConfetti();
            setUrl('');
        } catch (err) {
            alert('URL Scan failed. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setEmailResult(null);
        try {
            const res = await API.post('/scan/email/', {
                sender: emailSender,
                subject: emailSubject,
                body: emailBody
            });
            setEmailResult(res.data);
            if (res.data.prediction === 'legitimate') triggerSafeConfetti();
        } catch (err) {
            alert('Email Scan failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVisualScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visualFile || !visualDomain) return;

        setLoading(true);
        setVisualResult(null);
        const formData = new FormData();
        formData.append('file', visualFile);
        formData.append('domain', visualDomain);

        try {
            const res = await API.post('/scan/visual/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVisualResult(res.data);
            if (res.data.prediction === 'legitimate') triggerSafeConfetti();
        } catch (err) {
            alert('Visual Scan failed.');
        } finally {
            setLoading(false);
        }
    };

    const ResultCard = ({ result }: { result: any }) => {
        if (!result) return null;
        const isSafe = result.prediction === 'legitimate';
        const isSus = result.prediction === 'suspicious';
        const accentColor = isSafe ? 'text-emerald-400' : isSus ? 'text-yellow-400' : 'text-rose-500';
        const borderColor = isSafe ? 'border-emerald-500/50' : isSus ? 'border-yellow-500/50' : 'border-rose-500/50';
        const glowClass = isSafe ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'shadow-[0_0_20px_rgba(244,63,94,0.2)]';

        return (
            <div className={`mt-6 p-6 rounded-xl border ${borderColor} bg-slate-900/50 backdrop-blur-md ${glowClass} animate-fade-in`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className={`text-2xl font-bold capitalize mb-2 ${accentColor} tracking-tight`}>{result.prediction}</h3>
                        <p className="text-slate-400 font-medium text-sm">Confidence: <span className="text-white font-bold">{(result.confidence * 100).toFixed(1)}%</span></p>
                        {result.message && <p className="mt-2 text-slate-300 text-sm">{result.message}</p>}
                    </div>
                    <span className="text-5xl">{isSafe ? '🛡️' : isSus ? '⚠️' : '🚨'}</span>
                </div>
            </div>
        );
    };

    const chartData = stats ? [
        { name: 'Safe', value: stats.safe },
        { name: 'Malicious', value: stats.malicious }
    ] : [];
    const COLORS = ['#22d3ee', '#f43f5e'];

    const activityData = [
        { name: 'Mon', scans: 12 },
        { name: 'Tue', scans: 19 },
        { name: 'Wed', scans: 15 },
        { name: 'Thu', scans: 25 },
        { name: 'Fri', scans: 32 },
        { name: 'Sat', scans: 20 },
        { name: 'Sun', scans: 10 },
    ];

    if (!mounted) return null;

    return (
        <div className="min-h-screen font-sans bg-transparent">
            {/* Header removed to use Global Navbar from Layout */}

            <main className="container mx-auto px-4 py-8 max-w-7xl">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* LEFT COLUMN: HERO STATS & THREAT MAP */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h2 className="text-3xl font-bold text-white mb-2">System Status: <span className="text-emerald-400 drop-shadow-md">Operational</span></h2>
                            <p className="text-slate-400 max-w-lg mb-6">AI Neural Engine active. Real-time threat telemetry provided by VirusTotal & Cloud Vision.</p>

                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <span className="block text-xs uppercase text-slate-500 font-bold">Threats Neutralized</span>
                                    <span className="text-2xl font-mono text-rose-400">{stats?.malicious || 0}</span>
                                </div>
                                <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <span className="block text-xs uppercase text-slate-500 font-bold">Scans Performed</span>
                                    <span className="text-2xl font-mono text-cyan-400">{stats?.total || 0}</span>
                                </div>
                            </div>
                        </div>

                        <ThreatMap />

                        {/* NEW WEEKLY ACTIVITY CHART */}
                        <div className="glass-card p-6 rounded-3xl relative">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Weekly Scan Activity</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityData}>
                                        <defs>
                                            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="scans" stroke="#06b6d4" fillOpacity={1} fill="url(#colorScans)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: GRAPHS & PASSWORDS */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center relative min-h-[300px]">
                            <h3 className="absolute top-6 left-6 text-sm font-bold text-slate-400 uppercase">Global Risk Index</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center -mt-8">
                                <span className="text-3xl font-bold text-white">{stats?.risk_percentage}%</span>
                                <span className="block text-xs text-slate-500 uppercase mt-1">Malicious Traffic</span>
                            </div>
                        </div>

                        <PasswordStrength />
                    </div>
                </div>

                {/* MAIN SCANNER INTERFACE ... (Kept as is below) */}

                <section className="glass-card rounded-3xl p-1 shadow-2xl shadow-cyan-900/20 border border-white/5">
                    <div className="flex border-b border-white/5 bg-slate-900/50 rounded-t-3xl overflow-hidden">
                        {['url', 'email', 'visual'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-4 text-sm font-bold tracking-wide uppercase transition-all ${activeTab === tab
                                    ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 md:p-12 min-h-[400px]">
                        {activeTab === 'url' && (
                            <div className="animate-fade-in max-w-2xl mx-auto text-center">
                                <div className="mb-8">
                                    <h3 className="text-3xl font-bold text-white mb-2">URL Deep Scan</h3>
                                    <p className="text-slate-400">Paste any suspicious link. Our AI + VirusTotal engine will analyze it.</p>
                                </div>
                                <form onSubmit={handleUrlScan} className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative flex bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-1 focus-within:border-cyan-500 transition-colors">
                                        <input
                                            type="url" required
                                            placeholder="https://suspicous-link.com"
                                            className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-600 outline-none"
                                            value={url} onChange={(e) => setUrl(e.target.value)}
                                        />
                                        <button type="submit" disabled={loading}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-lg transition-all disabled:opacity-50">
                                            SCAN
                                        </button>
                                    </div>
                                </form>
                                <ResultCard result={urlResult} />
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div className="animate-fade-in max-w-3xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <input
                                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                        placeholder="Sender Address"
                                        value={emailSender} onChange={(e) => setEmailSender(e.target.value)}
                                    />
                                    <input
                                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                        placeholder="Subject Line"
                                        value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                                    />
                                </div>
                                <textarea
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors font-mono text-sm mb-6 h-40"
                                    placeholder="Paste email body..."
                                    value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
                                ></textarea>
                                <button onClick={handleEmailScan} className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-purple-900/20 hover:scale-[1.01] transition-transform">
                                    RUN FORENSIC ANALYSIS
                                </button>
                                <ResultCard result={emailResult} />
                            </div>
                        )}

                        {activeTab === 'visual' && (
                            <div className="animate-fade-in max-w-2xl mx-auto flex flex-col items-center">
                                <div
                                    className="w-full h-64 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer relative"
                                >
                                    <input
                                        type="file" accept="image/*"
                                        onChange={(e) => setVisualFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="text-6xl mb-4">📸</div>
                                    <p className="text-slate-300 font-medium">{visualFile ? visualFile.name : "Drop Screenshot Here"}</p>
                                    <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG</p>
                                </div>

                                <input
                                    className="w-full mt-6 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                                    placeholder="Target Domain (e.g. login-secure.com)"
                                    value={visualDomain} onChange={(e) => setVisualDomain(e.target.value)}
                                />

                                <button onClick={handleVisualScan} className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-900/20 hover:scale-[1.01] transition-transform">
                                    VERIFY IDENTITY
                                </button>
                                <ResultCard result={visualResult} />
                            </div>
                        )}
                    </div>
                </section>

                <div className="mt-12 text-center text-slate-500 text-sm">
                    CyberBuddy Enterprise x Google Gemini • Secure Connection
                </div>
            </main>
        </div>
    );
}
