"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Lock, Mail, Activity, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import '../styles/theme.css';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, user } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (searchParams.get('message') === 'AccountCreated') {
            setSuccessMsg('Account created successfully. Please authorize your session.');
        }
    }, [searchParams]);


    useEffect(() => {
        if (user) {
            router.replace(user.role === 'admin' ? '/dashboard' : '/trading');
        }
    }, [user, router]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/auth/signin', {
                email,
                password,
            });

            const { access_token, user: userData } = response.data;

            if (access_token) {
                let userId = userData?._id || userData?.id;
                if (!userId) {
                    try {
                        const payloadBase64 = access_token.split('.')[1];
                        const decodedJson = atob(payloadBase64);
                        const payload = JSON.parse(decodedJson);
                        

                        userId = payload.sub; 
                        console.log(" Unlocked ID from Token:", userId);
                    } catch (decodeErr) {
                        console.error("Failed to decode token", decodeErr);
                    }
                }

                console.log(" Final User ID:", userId);
                if (userId && userId !== 'undefined') {
                    Cookies.set('access_token', access_token, { expires: 1 });
                    Cookies.set('user_id', userId, { expires: 1 });
                    Cookies.set('user_role', userData?.role || 'user', { expires: 1 });

                    const completeUserData = { ...userData, id: userId };
                    login(completeUserData, access_token);
                    router.push(completeUserData.role === 'admin' ? '/dashboard' : '/trading');
                } else {
                    setError("System Error: ไม่สามารถระบุตัวตน (ID) ได้จากระบบ");
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authorization failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="angel-bg min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100/50 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-50/50 blur-[120px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="glass-card p-10 shadow-2xl shadow-blue-100/20">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-slate-900 p-3.5 rounded-2xl shadow-xl shadow-slate-200 mb-5">
                            <Activity className="text-white w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Quantum Access</h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-2 text-center">
                            Authorized Algo-Trading Terminal
                        </p>
                    </div>

                    {successMsg && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-bold animate-in fade-in zoom-in-95">
                            <CheckCircle2 className="w-4 h-4" /> {successMsg}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in shake">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="email" required value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="angel-input w-full pl-12"
                                    placeholder="Enter institutional email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="password" required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="angel-input w-full pl-12"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="angel-btn-primary w-full mt-4 h-14 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="text-xs uppercase tracking-widest">Establish Link</span>
                            )}
                        </button>
                    </form>

                    {/* Footer & Navigation */}
                    <div className="mt-10 pt-8 border-t border-slate-50 text-center space-y-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            New Operative? {' '}
                            <Link href="/signup" className="text-blue-500 hover:text-blue-600 underline underline-offset-4">
                                Request Access
                            </Link>
                        </p>
                        <div className="h-1 w-12 bg-slate-100 mx-auto rounded-full" />
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-tighter">
                            Secure Core v2.0 - Biometric Encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}