"use client";
import React from 'react';
import Navbar from '@/src/components/Navbar';
import PageHeader from '@/src/components/PageHeader';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-4 max-w-4xl animate-fade-in pb-20">
                <PageHeader
                    title="Privacy Protocol"
                    subtitle="We take data sovereignty seriously. We are not in the business of selling your data."
                    icon="🔒"
                />

                <div className="space-y-8 text-slate-400 leading-relaxed">
                    <section className="glass-card p-8 rounded-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">1. Data Collection</h2>
                        <p>We only collect data necessary for threat analysis. This includes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>URLs submitted for scanning</li>
                            <li>Email headers and body content (for analysis only, not stored permanently)</li>
                            <li>User account information (Email, Hash)</li>
                        </ul>
                    </section>

                    <section className="glass-card p-8 rounded-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">2. Zero-Knowledge Analysis</h2>
                        <p>
                            Password checks involve hashing your input locally before transmission (k-anonymity model). We never see your actual passwords.
                        </p>
                    </section>

                    <section className="glass-card p-8 rounded-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">3. Third-Party Sharing</h2>
                        <p>
                            We do not sell data to advertisers. Anonymized threat data is shared with global security exchanges (like VirusTotal) to improve herd immunity against phishing.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
