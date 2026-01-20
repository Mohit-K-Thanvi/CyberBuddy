"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://127.0.0.1:8000/auth/register', { email, password });
            // Auto Login Logic
            try {
                const loginRes = await axios.post('http://127.0.0.1:8000/auth/login', { email, password });
                const user = { id: res.data.id, email };
                login(loginRes.data.token, user);
            } catch {
                setError('Registration successful, please login.');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans selection:bg-violet-500/30">
            <div className="absolute top-0 w-full"><Navbar /></div>

            <div className="w-full max-w-md p-8 glass-card rounded-2xl border border-violet-500/20 shadow-2xl shadow-violet-900/20 animate-fade-in mt-20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Initialize Agent</h2>
                    <p className="text-slate-400">Create your secure CyberBuddy account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Identity</label>
                        <input
                            type="email" required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Access Key</label>
                        <input
                            type="password" required
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 outline-none transition-colors"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white shadow-lg shadow-violet-900/20 hover:scale-[1.01] transition-transform">
                        ESTABLISH CONNECTION
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already Active? <Link href="/login" className="text-violet-400 hover:text-violet-300 font-bold">Authenticate</Link>
                </div>
            </div>
        </div>
    );
}
