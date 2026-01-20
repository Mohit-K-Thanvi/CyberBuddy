import React from 'react';

const ResultCard = ({ result }: { result: any }) => {
    if (!result) return null;
    const isSafe = result.prediction === 'legitimate';
    const isSus = result.prediction === 'suspicious';

    // Dynamic colors for Cyber Theme
    const accentColor = isSafe ? 'text-emerald-400' : isSus ? 'text-yellow-400' : 'text-rose-500';
    const borderColor = isSafe ? 'border-emerald-500/50' : isSus ? 'border-yellow-500/50' : 'border-rose-500/50';
    const glowClass = isSafe ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'shadow-[0_0_20px_rgba(244,63,94,0.2)]';

    return (
        <div className={`mt-8 p-8 rounded-2xl border ${borderColor} bg-slate-900/80 backdrop-blur-md ${glowClass} animate-fade-in`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className={`text-3xl font-bold capitalize mb-2 ${accentColor} tracking-tight`}>
                        {result.prediction}
                    </h3>
                    <p className="text-slate-400 font-medium text-lg">
                        Confidence Score: <span className="text-white font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                    </p>

                    {/* General Message */}
                    {result.message && (
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                            <p className="text-slate-300 text-sm leading-relaxed">{result.message}</p>
                        </div>
                    )}

                    {/* Email Threats List */}
                    {result.threats && result.threats.length > 0 && (
                        <div className="mt-4 bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg">
                            <h4 className="text-rose-400 font-bold text-xs uppercase mb-2">Detailed Threats</h4>
                            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                {result.threats.map((t: string, i: number) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* OCR Text Preview (Visual Scan) */}
                    {result.extracted_text_preview && (
                        <div className="mt-4 bg-slate-950/50 border border-slate-800 p-3 rounded-lg">
                            <h4 className="text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-wider">OCR / Vision Output</h4>
                            <p className="font-mono text-xs text-emerald-400/80 italic break-words">
                                "{result.extracted_text_preview}"
                            </p>
                        </div>
                    )}

                    {/* Technical Enriched Data (URL) */}
                    {(result.ip_address || result.server_location) && (
                        <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono text-slate-300">
                            <div><span className="opacity-50 block mb-1">IP ADDR</span> {result.ip_address}</div>
                            <div><span className="opacity-50 block mb-1">LOCATION</span> {result.server_location}</div>
                            <div><span className="opacity-50 block mb-1">ASN (ISP)</span> {result.asn}</div>
                            <div><span className="opacity-50 block mb-1">DOMAIN AGE</span> {result.domain_age}</div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center ml-6">
                    <span className="text-6xl drop-shadow-xl filter">
                        {isSafe ? '🛡️' : isSus ? '⚠️' : '🚨'}
                    </span>
                    {result.source && <span className="text-xs uppercase font-mono text-slate-500 mt-2">{result.source} Scan</span>}
                </div>
            </div>
        </div>
    );
}

export default ResultCard;
