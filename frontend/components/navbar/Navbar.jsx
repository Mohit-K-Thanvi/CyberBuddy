"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    // Re-check auth status when route changes
    useEffect(() => {
        const token = localStorage.getItem("cyberbuddy_token");
        setLoggedIn(!!token);
    }, [pathname]);

    const logout = () => {
        localStorage.removeItem("cyberbuddy_token");
        setLoggedIn(false);
        router.push("/auth/login");
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-lg border-b border-cyan-500 z-50 shadow-[0_0_20px_#00eaff]">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* LOGO */}
                <h1
                    className="text-3xl font-extrabold text-cyan-300 cursor-pointer drop-shadow-[0_0_12px_#00eaff]"
                    onClick={() => router.push("/")}
                >
                    CyberBuddy<span className="text-white">.AI</span>
                </h1>

                {/* DESKTOP MENU */}
                <div className="hidden md:flex items-center gap-8 text-lg">
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/dashboard" className="nav-link">Dashboard</Link>
                    <Link href="/tools" className="nav-link">Tools</Link>

                    {!loggedIn ? (
                        <>
                            <button className="neon-btn-small" onClick={() => router.push("/auth/login")}>Login</button>
                            <button className="neon-btn-small" onClick={() => router.push("/auth/register")}>Register</button>
                        </>
                    ) : (
                        <button className="neon-btn-small-red" onClick={logout}>Logout</button>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <button
                    className="md:hidden text-cyan-300 text-3xl"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    ☰
                </button>
            </div>

            {/* MOBILE MENU */}
            {isOpen && (
                <div className="md:hidden bg-black/60 backdrop-blur-lg border-t border-cyan-500 p-4 space-y-4">
                    <Link href="/" className="mobile-link">Home</Link>
                    <Link href="/dashboard" className="mobile-link">Dashboard</Link>
                    <Link href="/tools" className="mobile-link">Tools</Link>

                    {!loggedIn ? (
                        <>
                            <button className="neon-btn w-full" onClick={() => router.push("/auth/login")}>Login</button>
                            <button className="neon-btn w-full" onClick={() => router.push("/auth/register")}>Register</button>
                        </>
                    ) : (
                        <button className="neon-btn-red w-full" onClick={logout}>Logout</button>
                    )}
                </div>
            )}
        </nav>
    );
}
