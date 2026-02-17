"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import Cookie from 'js-cookie';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // ยิงไปที่ API Gateway (Port 3000)
            const response = await axios.post('http://localhost:3000/auth/login', {
                email,
                password
            });

            const { access_token, role } = response.data;

            //  บันทึกข้อมูลลง LocalStorage
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user_role', role);

        
            if (role === 'admin') {
                router.push('/dashboard');
            } else {
                router.push('/trading');
            }

        } catch (err: any) {
            const msg = err.response?.data?.message || 'พิกัดการเข้าถึงไม่ถูกต้อง (Invalid Credentials)';
            setError(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
                    <div className="inline-flex p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-4">
                        <ShieldCheck className="w-12 h-12 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">QUANTUM GATEWAY</h1>
                    <p className="text-slate-500 text-xs mt-2 uppercase tracking-[0.3em]">Authorized Access Only</p>
                </div>

                {/* Login Form */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Terminal ID (Email)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="name@university.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Access Key (Password)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    INITIATE SYSTEM <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-medium">
                        Project Alpha v1.0  <br />
                        MAEJO UNIVERSITY COMPUTER SCIENCE
                    </p>
                </div>
            </div>
        </div>
    );
}