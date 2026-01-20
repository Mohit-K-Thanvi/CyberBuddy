"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
    { name: 'Mon', threats: 4, safe: 24 },
    { name: 'Tue', threats: 7, safe: 38 },
    { name: 'Wed', threats: 2, safe: 45 },
    { name: 'Thu', threats: 12, safe: 30 },
    { name: 'Fri', threats: 8, safe: 50 },
    { name: 'Sat', threats: 15, safe: 35 },
    { name: 'Sun', threats: 5, safe: 60 },
];

export default function SecurityChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[300px] w-full bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 p-6 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                        Network Activity
                    </h3>
                    <p className="text-xs text-slate-500">Real-time packet analysis</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">THREATS</span>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">SAFE</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="safe" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSafe)" />
                    <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
