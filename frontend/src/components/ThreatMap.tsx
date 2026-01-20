"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Globe, Server } from 'lucide-react';

// Simulated Live Data
const ACTIONS = ["Scanning Packet", "Handshake Verified", "SSL Check", "Heuristic Scan", "Deep Packet Inspection"];
const LOCATIONS = ["US-East", "EU-West", "Asia-Pacific", "SA-North", "Localhost"];
const STATUSES = ["CLEAN", "CLEAN", "CLEAN", "CLEAN", "SUSPICIOUS"];

interface LogEntry {
    id: number;
    time: string;
    action: string;
    ip: string;
    location: string;
    status: string;
}

const ThreatMap = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().substring(0, 2)}`;

            const newLog: LogEntry = {
                id: Date.now(),
                time,
                action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
                ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                status: STATUSES[Math.floor(Math.random() * STATUSES.length)]
            };

            setLogs(prev => [newLog, ...prev].slice(0, 8)); // Keep last 8 entries
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col font-mono text-xs md:text-sm relative group">

            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-emerald-400 font-bold tracking-wider">LIVE TRAFFIC MONITOR</span>
                </div>
                <div className="flex gap-4 text-slate-500">
                    <div className="flex items-center gap-1"><Server size={14} /> <span>127.0.0.1</span></div>
                    <div className="flex items-center gap-1"><Globe size={14} /> <span>ONLINE</span></div>
                </div>
            </div>

            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Logs Stream */}
            <div className="flex-grow p-4 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10"></div>

                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="mb-3 flex items-center gap-3 border-l-2 pl-3 py-1"
                            style={{
                                borderColor: log.status === 'SUSPICIOUS' ? '#f43f5e' : '#10b981',
                                background: log.status === 'SUSPICIOUS' ? 'linear-gradient(90deg, rgba(244,63,94,0.1), transparent)' : 'transparent'
                            }}
                        >
                            <span className="text-slate-500 w-20">{log.time}</span>
                            <span className="text-cyan-400 w-32 hidden md:inline-block">{log.ip}</span>
                            <span className="text-slate-300 w-32 hidden md:inline-block">[{log.location}]</span>
                            <span className="text-white flex-grow flex items-center gap-2">
                                {log.action}
                            </span>
                            <span className={`font-bold px-2 py-0.5 rounded ${log.status === 'SUSPICIOUS' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {log.status}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Status Bar */}
            <div className="bg-slate-900 border-t border-slate-800 p-2 text-center text-slate-500 text-[10px] uppercase tracking-widest">
                System Integrity: 100% | Threat Level: Low | active_nodes: 1
            </div>
        </div>
    )
}

export default ThreatMap;
