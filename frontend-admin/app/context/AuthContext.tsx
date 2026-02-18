// frontend-admin/app/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

interface AuthContextType {
    user: any;
    login: (userData: any, token: string) => void;
    logout: () => void;
    updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // โหลดข้อมูล User จาก LocalStorage เมื่อเปิดเว็บขึ้นมาใหม่
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const login = (userData: any, token: string) => {
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        Cookies.set('access_token', token, { expires: 1 });
        Cookies.set('user_role', userData.role, { expires: 1 });
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        Cookies.remove('access_token');
        Cookies.remove('user_role');
        window.location.href = '/login';
    };

    const updateBalance = (newBalance: number) => {
        setUser((prev: any) => {
            const updated = { ...prev, balance: newBalance };
            localStorage.setItem('user_data', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateBalance }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};