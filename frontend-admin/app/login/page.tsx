// frontend-admin/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Lock, Mail, ShieldCheck, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = Cookies.get('access_token');
        const role = Cookies.get('user_role');
        if (token) {
            router.push(role === 'admin' ? '/dashboard' : '/trading');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // เชื่อมต่อ API Gateway (Port 3000)
            const response = await axios.post('http://localhost:3000/auth/signin', { 
                email, password 
            });
            console.log("Full Response:", response.data);
            const { access_token, role } = response.data;

            //  บันทึกสิทธิ์ลงใน Cookies 
            Cookies.set('user_role', role, { expires: 1, path: '/' });
            Cookies.set('access_token', access_token, { expires: 1, path: '/' });

            //  แยกเส้นทางตาม Role
            if (role === 'admin'|| role === 'ADMIN') {
                router.push('/dashboard');
            } else {
                router.push('/trading');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'การยืนยันตัวตนล้มเหลว โปรดตรวจสอบข้อมูลอีกครั้ง');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 mb-4">
                        <ShieldCheck className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">ALGO-CORE <span className="text-blue-500">AUTH</span></h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Quantum Simulation Gateway</p>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 p-8 rounded-[2rem] shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Identity Node (Email)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="name@university.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Security Key (Password)</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/5 p-4 rounded-xl border border-rose-500/20 animate-shake">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                            </div>
                        )}

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>START SESSION <ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Secured by Quantum-Ready Middleware | v1.0.4
                </p>
            </div>
        </div>
    );
}