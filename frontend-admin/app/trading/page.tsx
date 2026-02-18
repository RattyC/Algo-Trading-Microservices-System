"use client";
import React, { useState } from 'react';
import { Wallet, History, Activity, ArrowUpRight, ArrowDownRight, LayoutDashboard } from 'lucide-react';
import { useMarket } from '../hooks/useMarket';
import { usePortfolio } from '../hooks/usePortfolio';
import MarketChart from '../components/MarketChart';
import OrderBook from '../components/OrderBook';
import LogoutButton from '../components/LogoutButton';
import { useRouter } from 'next/navigation';
import '../styles/theme.css';

// ✅ Interface สำหรับความเป๊ะของ Type
interface TradeRecord {
    id: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    time: string;
}

export default function ProfessionalTradingTerminal() {
    const router = useRouter();
    const { price, socketConnected } = useMarket();
    const { portfolio, trades, handleTrade, totalEquity, btcHolding } = usePortfolio(price);
    const [orderQty, setOrderQty] = useState("0.1");

    return (
        <div className="angel-bg pb-12 min-h-screen">
            {/* 🧭 Navigation Bar */}
            <nav className="border-b border-white bg-white/40 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center">
                <div className="max-w-400 mx-auto w-full px-8 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Activity className="text-slate-900 w-5 h-5" />
                            <span className="font-black text-slate-900 text-lg tracking-tighter uppercase">Alpha.Terminal</span>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-[9px] font-black text-slate-400 uppercase border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-900 hover:text-white transition-all flex items-center gap-1"
                        >
                            <LayoutDashboard className="w-3 h-3" /> System Admin
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase flex items-center gap-2 ${socketConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {socketConnected ? 'Neural Link Active' : 'Link Offline'}
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            {/* 📊 Main Trading Floor */}
            <main className="max-w-400 mx-auto p-8 grid grid-cols-12 gap-6">

                {/* 💳 LEFT: Portfolio & Execution */}
                <div className="col-span-12 xl:col-span-3 space-y-6">
                    <div className="glass-card p-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Equity</p>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h2>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Available Cash</span>
                            <span className="text-xs font-mono font-bold text-slate-900">${portfolio.balance.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="glass-card p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Execution</h3>
                            <span className="text-[9px] font-bold text-slate-400">Hold: {btcHolding.amount.toFixed(4)} BTC</span>
                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={orderQty}
                                    onChange={e => setOrderQty(e.target.value)}
                                    className="angel-input w-full text-lg font-mono"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">BTC</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleTrade('BUY', Number(orderQty))} className="angel-btn-primary bg-emerald-500 hover:bg-emerald-600 border-none">BUY</button>
                                <button onClick={() => handleTrade('SELL', Number(orderQty))} className="angel-btn-primary bg-rose-500 hover:bg-rose-600 border-none">SELL</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 📈 CENTER: Chart Analytics */}
                <div className="col-span-12 xl:col-span-6">
                    <div className="glass-card h-full flex flex-col overflow-hidden min-h-150">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-end bg-white/30">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bitcoin / Tether</span>
                                <h1 className="text-4xl font-black text-slate-900 leading-none mt-1">${price.toLocaleString()}</h1>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                                    <ArrowUpRight className="w-3 h-3" /> +0.82%
                                </span>
                                <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">24h Vol: 1.2M USDT</p>
                            </div>
                        </div>
                        <div className="grow p-2">
                            <MarketChart theme="light" />
                        </div>
                    </div>
                </div>

                {/* 📜 RIGHT: Order Book & History */}
                <div className="col-span-12 xl:col-span-3 space-y-6">
                    <div className="h-95">
                        <OrderBook currentPrice={price} />
                    </div>

                    <div className="glass-card p-6 flex flex-col h-70 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-4 h-4 text-slate-400" />
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Activity</h3>
                        </div>
                        <div className="space-y-2 overflow-y-auto grow pr-1 custom-scrollbar">
                            {trades.map((t: TradeRecord) => (
                                <div key={t.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 border border-white hover:border-slate-100 transition-all">
                                    <div>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${t.type === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{t.type}</span>
                                        <p className="text-[10px] font-bold text-slate-900 mt-1">{t.qty} BTC</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono font-bold text-slate-400">${t.price.toLocaleString()}</p>
                                        <p className="text-[8px] text-slate-300 font-bold uppercase">{t.time}</p>
                                    </div>
                                </div>
                            ))}
                            {trades.length === 0 && (
                                <p className="text-center text-slate-300 text-[9px] py-10 uppercase font-black">Syncing...</p>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}