"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
    const router = useRouter();
    const [isExiting, setIsExiting] = useState(false);

    const handleLogout = async () => {
        setIsExiting(true);
        try {

            const token = Cookies.get('access_token');
            await axios.post('http://localhost:3000/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
        } catch (err) {
            console.error("Backend logout failed, but clearing client-side anyway...");
        } finally {

            Cookies.remove('access_token', { path: '/' });
            Cookies.remove('user_role', { path: '/' });


            router.replace('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isExiting}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl border border-rose-500/20 transition-all duration-300 group"
        >
            {isExiting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Terminate Session</span>
                </>
            )}
        </button>
    );
}