"use client";
import React from 'react';
import Navbar from '@/src/components/Navbar';
import PageHeader from '@/src/components/PageHeader';
import Link from 'next/link';

export default function ConstructionPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
            <Navbar />
            <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                <div className="text-8xl mb-6 animate-bounce">🚧</div>
                <h1 className="text-4xl font-black text-white mb-4">Under Construction</h1>
                <p className="text-slate-400 max-w-md mx-auto mb-8">
                    This module is currently being built by our engineering team. Check back soon for updates.
                </p>
                <Link href="/" className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors">
                    Return to Nexus
                </Link>
            </main>
        </div>
    );
}
