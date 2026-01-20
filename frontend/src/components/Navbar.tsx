"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth(); // Auth Hook

    const isActive = (path: string) => pathname === path;

    return (
        <header className="glass-card sticky top-4 mx-4 md:mx-auto max-w-7xl z-50 rounded-2xl px-6 py-4 flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-20 h-20 flex items-center justify-center transition-transform group-hover:scale-110">
                    <img
                        src="/Logo1.png"
                        alt="CyberBuddy Logo"
                        className="w-full h-full object-contain filter drop-shadow-lg drop-shadow-cyan-500/50"
                    />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center">
                    CyberBuddy <span className="ml-1 text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 drop-shadow-sm">X</span>
                </h1>
            </Link>

            <nav className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-white/5">
                {[
                    { name: 'Nexus', path: '/' },
                    { name: 'Intel Map', path: '/intel' },
                    { name: 'Web Guard', path: '/scanners/url' },
                    { name: 'Email Guard', path: '/scanners/email' },
                    { name: 'Visual ID', path: '/scanners/visual' },
                    { name: 'Training', path: '/training' },
                    { name: 'News', path: '/news' },
                ].map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive(item.path)
                            ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="hidden md:block text-xs text-slate-400 font-mono">{user.email}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-colors"
                        >
                            LOGOUT
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href="/register" className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20">
                            JOIN
                        </Link>
                    </div>
                )}
                {/* Mobile Menu Placeholder */}
                <div className="md:hidden w-8 h-8 rounded bg-slate-800 flex items-center justify-center">☰</div>
            </div>
        </header>
    );
}
