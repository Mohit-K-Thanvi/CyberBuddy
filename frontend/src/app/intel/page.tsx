"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/src/components/Navbar';
import ThreatMap from '@/src/components/ThreatMap';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Stats {
    total: number;
    malicious: number;
    safe: number;
    risk_percentage: number;
}

import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function IntelPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [mounted, setMounted] = useState(false);
    const { user, token } = useAuth();
    const router = useRouter();

    const handleDownloadReport = async () => {
        if (!user || !token) {
            alert("🔒 Access Denied: Please Login to generate core intelligence reports.");
            router.push('/login');
            return;
        }

        try {
            const response = await axios.get('http://127.0.0.1:8000/report/download', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cyberbuddy_intel_report.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert("Failed to download report.");
        }
    };

    useEffect(() => {
        setMounted(true);
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/scan/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Stats fetch error", err);
            }
        };
        fetchStats();
    }, []);

    const pieData = stats ? [
        { name: 'Safe', value: stats.safe },
        { name: 'Malicious', value: stats.malicious }
    ] : [];

    // Mock data for "Trends" since backend doesn't support time-series stats yet
    const trendData = [
        { name: 'Mon', scans: 45, threats: 2 },
        { name: 'Tue', scans: 52, threats: 5 },
        { name: 'Wed', scans: 38, threats: 1 },
        { name: 'Thu', scans: 65, threats: 8 },
        { name: 'Fri', scans: 48, threats: 3 },
        { name: 'Sat', scans: 25, threats: 0 },
        { name: 'Sun', scans: 30, threats: 1 },
    ];

    const COLORS = ['#22d3ee', '#f43f5e'];

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] text-white font-sans selection:bg-cyan-500/30">
            <Navbar />

            <main className="container mx-auto px-4 pb-20 max-w-7xl animate-fade-in">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Global <span className="text-cyan-400">Intelligence</span> Map</h2>
                        <p className="text-slate-400 max-w-2xl">Real-time telemetry from CyberBuddy sensor network. Visualizing threats across URL, Email, and Visual vectors.</p>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="px-6 py-3 bg-slate-800 hover:bg-cyan-900 border border-slate-700 hover:border-cyan-500 rounded-xl text-white font-bold transition-all flex items-center gap-2 group shadow-lg"
                    >
                        <span className="text-xl group-hover:text-cyan-400">📄</span>
                        GENERATE REPORT
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* STAT CARDS */}
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-cyan-500">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Scans Analyzed</h3>
                        <div className="text-4xl font-mono font-bold text-white">{stats?.total || 0}</div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-rose-500">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Threats Intercepted</h3>
                        <div className="text-4xl font-mono font-bold text-rose-400">{stats?.malicious || 0}</div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-violet-500">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Current Threat Level</h3>
                        <div className="text-4xl font-mono font-bold text-violet-400">
                            {stats?.risk_percentage && stats.risk_percentage > 20 ? 'ELEVATED' : 'NOMINAL'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <ThreatMap />

                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-6">Weekly Attack Volume</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                                            cursor={{ fill: '#ffffff10' }}
                                        />
                                        <Bar dataKey="scans" name="Total Scans" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="threats" name="Threats Detected" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] relative">
                            <h3 className="absolute top-6 left-6 text-sm font-bold text-slate-400 uppercase">Traffic Distribution</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center -mt-4">
                                <span className="text-3xl font-bold text-white">{stats?.risk_percentage || 0}%</span>
                                <span className="block text-xs text-slate-500 uppercase mt-1">Malicious Ratio</span>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Recent Alerts</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-between">
                                    <span className="text-xs text-rose-400 font-mono">PHISHING_DETECTED</span>
                                    <span className="text-xs text-slate-500">2m ago</span>
                                </div>
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
                                    <span className="text-xs text-yellow-400 font-mono">SUSPICIOUS_SENDER</span>
                                    <span className="text-xs text-slate-500">14m ago</span>
                                </div>
                                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-between">
                                    <span className="text-xs text-cyan-400 font-mono">SCAN_COMPLETED</span>
                                    <span className="text-xs text-slate-500">18m ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
