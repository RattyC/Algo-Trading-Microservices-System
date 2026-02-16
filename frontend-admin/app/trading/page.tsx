"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, ISeriesApi } from 'lightweight-charts';
import { io } from 'socket.io-client';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, LayoutDashboard } from 'lucide-react';

export default function UserTradingTerminal() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [price, setPrice] = useState<number>(0);

    // Simulated User Portfolio
    const [balance, setBalance] = useState(100000); // เริ่มต้น $100,000
    const [holdings, setHoldings] = useState(0);    // จำนวน BTC ที่ถือ
    const [trades, setTrades] = useState<any[]>([]);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!isMounted || !chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: { background: { type: ColorType.Solid, color: '#020617' }, textColor: '#94a3b8' },
            grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', downColor: '#ef4444',
        });

        const socket = io('http://localhost:3003');
        socket.on('price_update', (data) => {
            setPrice(data.price);
            candleSeries.update({
                time: Math.floor(data.time / 1000) as any,
                open: data.price, high: data.price, low: data.price, close: data.price
            });
        });

        return () => { socket.disconnect(); chart.remove(); };
    }, [isMounted]);

    const handleTrade = (type: 'BUY' | 'SELL') => {
        const amount = 0.1; // เทรดทีละ 0.1 BTC
        const cost = price * amount;

        if (type === 'BUY' && balance >= cost) {
            setBalance(prev => prev - cost);
            setHoldings(prev => prev + amount);
            setTrades(prev => [{ type, amount, price, time: new Date().toLocaleTimeString() }, ...prev]);
        } else if (type === 'SELL' && holdings >= amount) {
            setBalance(prev => prev + cost);
            setHoldings(prev => prev - amount);
            setTrades(prev => [{ type, amount, price, time: new Date().toLocaleTimeString() }, ...prev]);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 p-4 lg:p-8">
            {/* User Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <LayoutDashboard className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">ALPHA TERMINAL</h1>
                        <p className="text-xs text-slate-500 font-mono">USER_ID: TON_RESEARCHER_01</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl min-w-[200px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 flex items-center gap-2">
                            <Wallet className="w-3 h-3" /> Available Balance
                        </p>
                        <p className="text-2xl font-mono font-bold text-emerald-400">${balance.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl min-w-[150px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Position (BTC)</p>
                        <p className="text-2xl font-mono font-bold text-blue-400">{holdings.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Market Chart */}
                <div className="lg:col-span-8 bg-slate-900/30 rounded-3xl border border-slate-800/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-400">BTC/USDT Live Chart</span>
                        <span className="text-xl font-mono font-bold text-white">${price.toLocaleString()}</span>
                    </div>
                    <div ref={chartContainerRef} className="w-full" />
                </div>

                {/* Trade Controls & History */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Execution Panel</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleTrade('BUY')}
                                className="flex flex-col items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-6 rounded-2xl transition-all active:scale-95"
                            >
                                <ArrowUpCircle className="w-8 h-8" />
                                <span className="font-bold">BUY</span>
                            </button>
                            <button
                                onClick={() => handleTrade('SELL')}
                                className="flex flex-col items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white p-6 rounded-2xl transition-all active:scale-95"
                            >
                                <ArrowDownCircle className="w-8 h-8" />
                                <span className="font-bold">SELL</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-500 mt-4 italic">Estimated Order Value: ${(price * 0.1).toLocaleString()} USDT</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 h-[280px] overflow-hidden flex flex-col">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <History className="w-4 h-4" /> Trade History
                        </h3>
                        <div className="space-y-3 overflow-y-auto pr-2">
                            {trades.length === 0 && <p className="text-xs text-slate-600 text-center mt-10 italic">No trades executed yet.</p>}
                            {trades.map((t, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{t.type}</span>
                                    <span className="text-xs font-mono text-white">${t.price.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-600">{t.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}