"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/src/components/Navbar';
import axios from 'axios';
import { Geist_Mono } from 'next/font/google';

const mono = Geist_Mono({ subsets: ['latin'] });

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/news/')
            .then(res => {
                setNews(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500/30">
            <Navbar />

            <main className="container mx-auto px-4 max-w-6xl py-20">
                <header className="mb-16 text-center">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-full uppercase">
                        Global Intelligence Feed
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                        CYBER<span className="text-rose-500">NEWS</span>
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        Real-time threat telemetry from the world's leading security exchanges.
                    </p>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item, idx) => (
                            <a
                                key={idx}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/50 transition-all hover:-translate-y-2 hover:shadow-[0_0_50px_-15px_rgba(244,63,94,0.3)] flex flex-col"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400 ${mono.className}`}>
                                            {item.source}
                                        </span>
                                        <span className="text-xs text-slate-500">{item.pubDate}</span>
                                    </div>

                                    <h2 className="text-2xl font-bold leading-tight group-hover:text-rose-400 transition-colors mb-4">
                                        {item.title}
                                    </h2>
                                </div>

                                <div className="p-6 border-t border-slate-800 bg-slate-900/80 mt-auto flex justify-between items-center group-hover:bg-rose-500/5 transition-colors">
                                    <span className="text-sm font-bold text-slate-500 group-hover:text-white transition-colors">Read Briefing</span>
                                    <span className="transform group-hover:translate-x-2 transition-transform text-rose-500">→</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
