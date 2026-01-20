"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/src/components/Navbar";
import API from "@/src/app/lib/api";
import { Shield, AlertTriangle, CheckCircle, ChevronRight, Trophy, RotateCcw } from "lucide-react";

interface Question {
    id: number;
    type: string;
    sender?: string;
    subject?: string;
    body?: string;
    url?: string;
    context?: string;
}

interface QuizResult {
    question_id: number;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
}

interface QuizScore {
    correct: number;
    total: number;
    score_percent: number;
    grade: string;
    message: string;
    results: QuizResult[];
}

export default function TrainingPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ question_id: number; user_answer: string }[]>([]);
    const [score, setScore] = useState<QuizScore | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        setLoading(true);
        setScore(null);
        setAnswers([]);
        setCurrentIndex(0);
        try {
            const res = await API.get("/training/quiz");
            setQuestions(res.data.questions);
        } catch (e) {
            console.error("Quiz fetch error", e);
        }
        setLoading(false);
    };

    const handleAnswer = (answer: string) => {
        const currentQ = questions[currentIndex];
        setAnswers([...answers, { question_id: currentQ.id, user_answer: answer }]);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            submitQuiz([...answers, { question_id: currentQ.id, user_answer: answer }]);
        }
    };

    const submitQuiz = async (finalAnswers: { question_id: number; user_answer: string }[]) => {
        setLoading(true);
        try {
            const res = await API.post("/training/quiz/submit", { answers: finalAnswers });
            setScore(res.data);
        } catch (e) {
            console.error("Quiz submit error", e);
        }
        setLoading(false);
    };

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                            Phishing Training Arena
                        </span>
                    </h1>
                    <p className="text-slate-400">Can you spot the scam? Test your skills against real-world phishing attacks.</p>
                </div>

                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-slate-400">Loading challenge...</p>
                    </div>
                )}

                {!loading && !score && currentQuestion && (
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-slate-900/80 border border-slate-700 rounded-3xl p-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-slate-500">Question {currentIndex + 1} of {questions.length}</span>
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-cyan-400 uppercase">
                                {currentQuestion.type}
                            </span>
                        </div>

                        {currentQuestion.type === "email" && (
                            <div className="bg-slate-950 rounded-xl p-6 mb-8 border border-slate-800">
                                <div className="text-slate-500 text-sm mb-1">From: <span className="text-white">{currentQuestion.sender}</span></div>
                                <div className="text-slate-500 text-sm mb-4">Subject: <span className="text-white font-bold">{currentQuestion.subject}</span></div>
                                <p className="text-slate-300 leading-relaxed">{currentQuestion.body}</p>
                            </div>
                        )}

                        {currentQuestion.type === "url" && (
                            <div className="bg-slate-950 rounded-xl p-6 mb-8 border border-slate-800">
                                <div className="text-slate-500 text-sm mb-2">Context: {currentQuestion.context}</div>
                                <div className="text-xl font-mono text-cyan-400 break-all">{currentQuestion.url}</div>
                            </div>
                        )}

                        <p className="text-xl font-bold text-center mb-8">Is this PHISHING or LEGITIMATE?</p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAnswer("phishing")}
                                className="py-4 px-6 bg-rose-500/20 border-2 border-rose-500 text-rose-400 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <AlertTriangle className="w-5 h-5" /> PHISHING
                            </button>
                            <button
                                onClick={() => handleAnswer("legitimate")}
                                className="py-4 px-6 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" /> LEGITIMATE
                            </button>
                        </div>
                    </motion.div>
                )}

                {!loading && score && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className={`text-9xl font-black mb-4 ${score.grade === "A" ? "text-emerald-400" : score.grade === "F" ? "text-rose-500" : "text-amber-400"}`}>
                            {score.grade}
                        </div>
                        <p className="text-2xl font-bold mb-2">{score.message}</p>
                        <p className="text-slate-400 mb-8">You got {score.correct} out of {score.total} correct ({score.score_percent}%)</p>

                        <button onClick={fetchQuiz} className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400 transition-all">
                            <RotateCcw className="w-5 h-5" /> Try Again
                        </button>

                        <div className="mt-12 text-left space-y-4">
                            <h3 className="text-lg font-bold text-white mb-4">Review Your Answers:</h3>
                            {score.results.map((r, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${r.is_correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {r.is_correct ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                                        <span className="font-bold text-white">Question {r.question_id}</span>
                                        <span className={`ml-auto text-sm ${r.is_correct ? "text-emerald-400" : "text-rose-400"}`}>
                                            {r.is_correct ? "Correct" : `Wrong (was ${r.correct_answer})`}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{r.explanation}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
