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
            if (token) {
                await axios.post('http://localhost:3000/auth/logout', {}, {
                    headers: { 
                        // ต้องส่ง Bearer Token ไปด้วยเพื่อให้ Guard ใน NestJS ยอมผ่าน
                        Authorization: `Bearer ${token}` 
                    }
                });
            }
        } catch (err) {
            // หาก Backend ล่มหรือ Token หมดอายุแล้ว เรายังคงต้องล้างฝั่ง Client
            console.warn("Session already expired on server or network error.");
        } finally {
            Cookies.remove('access_token', { path: '/' });
            Cookies.remove('user_role', { path: '/' });
            
            router.replace('/login');
            router.refresh(); // บังคับให้ Middleware/Proxy เช็คสิทธิ์ใหม่
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isExiting}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl border border-rose-500/20 transition-all duration-300"
        >
            {isExiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
        </button>
    );
}