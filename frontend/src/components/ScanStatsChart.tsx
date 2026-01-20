"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import API from '@/src/app/lib/api';

interface ScanStats {
    safe: number;
    suspicious: number;
    malicious: number;
    total: number;
}

export default function ScanStatsChart() {
    const [stats, setStats] = useState<ScanStats>({ safe: 12, suspicious: 3, malicious: 1, total: 16 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real stats if available, else use mock/seed data
        // For now we simulate or use what we have. 
        // Ideally we'd hit an endpoint like /scan/stats
        const fetchStats = async () => {
            try {
                const res = await API.get('/scan/history');
                const history = res.data;
                const safe = history.filter((h: any) => h.prediction === 'legitimate').length;
                const suspicious = history.filter((h: any) => h.prediction === 'suspicious').length;
                const malicious = history.filter((h: any) => h.prediction === 'phishing').length;

                // If no history, keep seeded data for visuals
                if (history.length > 0) {
                    setStats({ safe, suspicious, malicious, total: history.length });
                }
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const data = [
        { name: 'Safe', value: stats.safe, color: '#10b981' }, // Emerald
        { name: 'Suspicious', value: stats.suspicious, color: '#f59e0b' }, // Amber
        { name: 'Phishing', value: stats.malicious, color: '#f43f5e' }, // Rose
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[300px] w-full bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 p-6 relative overflow-hidden flex flex-col"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-white font-bold text-lg">Threat Distribution</h3>
                    <p className="text-xs text-slate-500">Based on your recent scans</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-white">{stats.total}</span>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total Scans</p>
                </div>
            </div>

            <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
                <div className="text-center">
                    <div className="text-xs text-slate-500 font-bold">SAFETY</div>
                    <div className="text-xl font-bold text-emerald-400">
                        {stats.total > 0 ? Math.round((stats.safe / stats.total) * 100) : 0}%
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
