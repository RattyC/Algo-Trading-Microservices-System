"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [isLoading, setIsLoading] = useState(false); 
    const router = useRouter();


    const handleSignup = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.post('http://localhost:3000/auth/signup', { email, password, role });
            alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
            router.push('/login');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
            console.error("Signup Error:", err);
            alert(errorMessage); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <form onSubmit={handleSignup} className="bg-slate-900 p-10 rounded-4xl border border-slate-800 w-full max-w-md space-y-6">
                <h1 className="text-2xl font-black text-white text-center uppercase tracking-widest">Create Alpha Account</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none"
                >
                    <option value="user">Trader (User)</option>
                    <option value="admin">Market Maker (Admin)</option>
                </select>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-black p-4 rounded-xl transition-all ${isLoading ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                    {isLoading ? 'PROCESSING...' : 'SIGN UP'}
                </button>
            </form>
        </div>
    );
}