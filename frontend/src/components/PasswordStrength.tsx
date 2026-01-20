import { useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

const PasswordStrength = () => {
    const [password, setPassword] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkPassword = async () => {
        if (!password) return;
        setLoading(true);
        try {
            const res = await API.post('/scan/password/', { password });
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl w-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🔐 Password Analyzer
            </h3>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Test a password..."
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-all font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
                />

                <button
                    onClick={checkPassword}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Analyzing...' : 'Check Strength'}
                </button>
            </div>

            {result && (
                <div className="mt-6 animate-fade-in space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Verdict</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.strength === 'Strong' ? 'bg-emerald-500/20 text-emerald-400' :
                            result.strength === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {result.strength}
                        </span>
                    </div>

                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${result.strength === 'Strong' ? 'bg-emerald-500' :
                                result.strength === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${(result.score / 6) * 100}%` }}
                        />
                    </div>

                    {result.feedback.length > 0 && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                                {result.feedback.map((msg: string, i: number) => (
                                    <li key={i}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PasswordStrength;
