"use client";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Hello! I am CyberBot. How can I help secure your data today?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
        e?.preventDefault();
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post('http://127.0.0.1:8000/bot/message', { message: userMsg.text });

            setTimeout(() => {
                const botMsg: Message = { id: (Date.now() + 1).toString(), text: res.data.reply, sender: 'bot' };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, 600); // Simulate typing delay

        } catch (err) {
            setMessages(prev => [...prev, { id: 'err', text: 'I am currently offline. Please try again later.', sender: 'bot' }]);
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/30 w-[350px] h-[500px] rounded-2xl shadow-2xl shadow-cyan-900/40 flex flex-col mb-4 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="/bot_avatar.png" className="w-12 h-12 rounded-full object-cover filter drop-shadow-md" alt="AI Agent" />
                            <div>
                                <h3 className="text-white font-bold text-sm">CyberBot AI</h3>
                                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Predefined Questions (Only show if few messages) */}
                        {messages.length < 3 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {["Check this URL", "Password Tips", "What is Phishing?", "My account was hacked"].map(q => (
                                    <button
                                        key={q}
                                        onClick={() => handleSend(undefined, q)}
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about threats..."
                            className="flex-1 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-cyan-500 outline-none transition-colors"
                        />
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/40'}`}
            >
                {isOpen ? (
                    <span className="text-white text-xl font-bold">✕</span>
                ) : (
                    <img src="/bot_avatar.png" className="w-full h-full rounded-full object-cover p-1" alt="Chat" />
                )}
            </button>
        </div>
    );
}
