"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
    user: any;
    login: (userData: any, token: string) => void;
    logout: () => void;
    updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoaded(true);
    }, []);

    const login = (userData: any, token: string) => {
        const userId = userData.id || userData._id;
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        Cookies.set('access_token', token, { expires: 1 });
        Cookies.set('user_role', userData.role, { expires: 1 });
        Cookies.set('user_id', userId, { expires: 1 }); 
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        Cookies.remove('access_token');
        Cookies.remove('user_role');
        Cookies.remove('user_id');
        window.location.href = '/login';
    };

    const updateBalance = (newBalance: number) => {
        setUser((prev: any) => {
            if (!prev) return null;
            const updated = { ...prev, balance: newBalance };
            localStorage.setItem('user_data', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateBalance }}>
            {isLoaded ? children : <div className="angel-bg min-h-screen" />}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};