"use client";
import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle: string;
    icon?: string;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
    return (
        <div className="relative py-20 text-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            {icon && <div className="text-6xl mb-6 animate-float">{icon}</div>}
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                {title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" : ""}>
                        {word}
                    </span>
                ))}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
            </p>
        </div>
    );
}
