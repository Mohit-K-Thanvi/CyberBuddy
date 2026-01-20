import React, { useEffect, useState } from 'react';
import API from '@/src/app/lib/api';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

const CyberNewsWidget = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/news/')
            .then(res => {
                setNews(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("News fetch error:", err);
                setLoading(false);
            });
    }, []);

    // DAILY SECURITY TIP (Interactive)
    const tips = [
        "Enable 2FA on all financial accounts instantly.",
        "Never approve a push notification you didn't trigger.",
        "Hover over links before clicking to see the real URL.",
        "Use a password manager. Stop reusing 'password123'.",
        "Public Wi-Fi is unsafe. Use a VPN.",
        "Check haveibeenpwned.com to see if your data leaked."
    ];
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % tips.length);
        }, 5000); // Change tip every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="h-full flex flex-col gap-6">
            {/* TOP: TIP OF THE DAY */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-500/30 p-8 rounded-3xl relative overflow-hidden group min-h-[180px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-cyan-500 rotate-12 pointer-events-none">?</div>

                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-6 relative z-10">Daily Security Briefing</h3>

                <div className="flex-grow flex items-center relative z-10">
                    <p key={tipIndex} className="text-xl md:text-2xl font-light text-white italic animate-fade-in leading-relaxed">
                        "{tips[tipIndex]}"
                    </p>
                </div>

                <div className="flex gap-2 mt-6 relative z-10">
                    {tips.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === tipIndex ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
                    ))}
                </div>
            </div>

            {/* BOTTOM: LIVE NEWS FEED */}
            <div className="flex-grow bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm overflow-y-auto flex flex-col custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                        Global Threat Intelligence
                    </h3>
                    <span className="text-xs text-slate-500 uppercase font-mono">Real-time Feed</span>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-slate-500 text-sm animate-pulse">Establishing secure link to news grid...</div>
                    ) : news.length > 0 ? (
                        news.map((item, idx) => (
                            <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                                className="block p-4 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 group">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-slate-200 font-medium group-hover:text-cyan-400 transition-colors line-clamp-1">
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-4 border border-slate-700 px-2 py-0.5 rounded">
                                        {item.source}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">{item.pubDate}</div>
                            </a>
                        ))
                    ) : (
                        <div className="text-slate-500">No signals detected.</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CyberNewsWidget;
