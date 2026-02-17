//login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Lock, Mail, Activity, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // ตรวจสอบถ้า Login อยู่แล้วให้เด้งออกไปหน้าหลักตามสิทธิ์
    useEffect(() => {
        const token = Cookies.get('access_token');
        const role = Cookies.get('user_role');
        if (token && role) {
            router.replace(role === 'admin' ? '/dashboard' : '/trading');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 📡 ยิงไปที่ API Gateway (Port 3000)
            const response = await axios.post('http://localhost:3000/auth/signin', {
                email,
                password,
            });

            // 🔍 ตรวจสอบโครงสร้างข้อมูล (ดึงออกมาตามที่ NestJS ส่งมา)
            const { access_token, role } = response.data;

            if (access_token && role) {
                // 🍪 บันทึก Cookies พร้อมกำหนด Path ให้ทั่วถึงทั้งโปรเจค
                Cookies.set('access_token', access_token, { expires: 1, path: '/' });
                Cookies.set('user_role', role, { expires: 1, path: '/' });

                // 🧭 นำทางตามบทบาทของผู้ใช้
                if (role === 'admin') {
                    router.push('/dashboard');
                } else {
                    router.push('/trading');
                }
            } else {
                throw new Error('โครงสร้างข้อมูลไม่ถูกต้อง (Role หรือ Token หายไป)');
            }
        } catch (err: any) {
            console.error('Login Error:', err);
            setError(err.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows (Tech Aesthetic) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20 mb-4">
                            <Activity className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Quantum Access</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Algo-Trading Terminal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-700"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Credentials (Password)</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs uppercase tracking-widest">Verifying...</span>
                                </>
                            ) : (
                                <span className="text-xs uppercase tracking-widest">Authorize Session</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                            Secure Terminal Access Provided by <span className="text-blue-500/50 underline">Alpha Core Systems</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}