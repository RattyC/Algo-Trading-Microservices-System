"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, ISeriesApi } from 'lightweight-charts';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import {
    Wallet, TrendingUp, TrendingDown, History, ArrowUpRight, ArrowDownRight,
    Activity, CircleDollarSign, LayoutDashboard
} from 'lucide-react';
import LogoutButton from '../components/LogoutButton';
import { useRouter } from 'next/navigation';

export default function ProfessionalTradingTerminal() {
    const router = useRouter();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [isMounted, setIsMounted] = useState(false);
    const [price, setPrice] = useState<number>(0);
    const [balance, setBalance] = useState<number>(100000);
    const [position, setPosition] = useState({ amount: 0, avgPrice: 0 });
    const [trades, setTrades] = useState<any[]>([]);
    const [orderQty, setOrderQty] = useState<string>("0.1"); // เก็บเป็น string ป้องกัน NaN ตอนพิมพ์
    const [userRole, setUserRole] = useState<string | undefined>(undefined);

    useEffect(() => {
        setIsMounted(true);
        setUserRole(Cookies.get('user_role')); // ดึง Role มาเช็คสิทธิ์
    }, []);

    useEffect(() => {
        if (!isMounted || !chartContainerRef.current) return;

        // 📉 ปรับการสร้างกราฟให้แน่นอน
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 450,
            layout: { background: { type: ColorType.Solid, color: '#020617' }, textColor: '#64748b' },
            grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
            timeScale: { borderColor: '#1e293b', timeVisible: true, secondsVisible: true },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
            wickUpColor: '#10b981', wickDownColor: '#ef4444',
        });
        candleSeriesRef.current = candleSeries;

        // 📡 เชื่อมต่อ Socket (มั่นใจว่า Port 3003 รันอยู่)
        const socket: Socket = io('http://localhost:3003');
        socket.on('price_update', (data) => {
            setPrice(data.price);
            if (candleSeriesRef.current) {
                candleSeriesRef.current.update({
                    time: Math.floor(data.time / 1000) as any,
                    open: data.price, high: data.price, low: data.price, close: data.price
                });
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.disconnect();
            chart.remove();
        };
    }, [isMounted]);

    const handleTrade = (type: 'BUY' | 'SELL') => {
        const qty = Number(orderQty);
        if (isNaN(qty) || qty <= 0) return alert("กรุณาระบุจำนวนที่ถูกต้อง");
        const cost = price * qty;

        if (type === 'BUY') {
            if (balance < cost) return alert("ยอดคงเหลือไม่พอ");
            const newAmount = position.amount + qty;
            const newAvgPrice = ((position.amount * position.avgPrice) + cost) / newAmount;
            setBalance(b => b - cost);
            setPosition({ amount: newAmount, avgPrice: newAvgPrice });
        } else {
            if (position.amount < qty) return alert("จำนวนเหรียญไม่พอ");
            setBalance(b => b + cost);
            setPosition(p => ({ ...p, amount: p.amount - qty, avgPrice: p.amount - qty === 0 ? 0 : p.avgPrice }));
        }
        setTrades(prev => [{ type, qty, price, time: new Date().toLocaleTimeString() }, ...prev]);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
            {/* 🚀 Navigation Bar */}
            <nav className="border-b border-slate-800/50 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-[1920px] mx-auto px-12 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Activity className="text-blue-500 w-6 h-6" />
                            <span className="font-black text-white text-xl tracking-tighter uppercase">Alpha Terminal</span>
                        </div>
                        {/* 👑 ปุ่มสำหรับ Admin เพื่อกลับหน้า Dashboard */}
                        {userRole === 'admin' && (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl border border-blue-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <LayoutDashboard className="w-3 h-3" /> Back to Admin
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Stream</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <main className="max-w-[1920px] mx-auto p-12 grid grid-cols-12 gap-8">
                {/* คอลัมน์ซ้าย: พอร์ต */}
                <div className="col-span-12 xl:col-span-3 space-y-8">
                    <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet className="w-4 h-4" /> Portfolio Equity</p>
                        <h2 className="text-4xl font-mono font-black text-white tracking-tight">
                            ${(balance + (position.amount * price)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <p className={`text-xs mt-4 font-bold ${price >= position.avgPrice ? 'text-emerald-500' : 'text-rose-500'}`}>
                            PnL: {((price - position.avgPrice) * position.amount).toFixed(2)} USD
                        </p>
                    </div>

                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Trade Control</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                    <span>Order Size</span>
                                    <span>Hold: {position.amount.toFixed(4)} BTC</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={orderQty}
                                        onChange={(e) => setOrderQty(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-4 text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">BTC</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleTrade('BUY')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-5 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-emerald-600/20">BUY</button>
                                <button onClick={() => handleTrade('SELL')} className="bg-rose-600 hover:bg-rose-500 text-white p-5 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-rose-600/20">SELL</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* คอลัมน์กลาง: กราฟ (สำคัญ: ต้องมีสไตล์ความสูง) */}
                <div className="col-span-12 xl:col-span-6">
                    <div className="bg-slate-950 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl h-full min-h-[550px] flex flex-col">
                        <div className="p-6 border-b border-slate-900 bg-slate-900/20 flex justify-between items-center">
                            <span className="text-lg font-black text-white tracking-widest">BTC / USDT</span>
                            <span className="text-3xl font-mono font-black text-emerald-400 animate-pulse">${price.toLocaleString()}</span>
                        </div>
                        {/* 📈 Container สำหรับกราฟ */}
                        <div ref={chartContainerRef} className="flex-grow w-full bg-[#020617]" style={{ height: '480px' }} />
                    </div>
                </div>

                {/* คอลัมน์ขวา: ประวัติ */}
                <div className="col-span-12 xl:col-span-3">
                    <div className="bg-slate-900/30 rounded-[2rem] border border-slate-800/50 p-6 h-[550px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <History className="w-4 h-4 text-slate-500" />
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                        </div>
                        <div className="space-y-3 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                            {trades.map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/50 border border-slate-800/30 hover:border-slate-700 transition-all">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{t.type}</span>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold text-white">${t.price.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500">{t.qty} BTC</p>
                                    </div>
                                </div>
                            ))}
                            {trades.length === 0 && <p className="text-center text-slate-600 text-[10px] py-10 italic uppercase font-bold tracking-widest">No market activity</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}