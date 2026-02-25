"use client";
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

interface OrderEntry {
    price: number;
    amount: number;
    total: number;
}

export default function OrderBook({ currentPrice }: { currentPrice: number }) {
    const [bids, setBids] = useState<OrderEntry[]>([]); 
    const [asks, setAsks] = useState<OrderEntry[]>([]); 

    useEffect(() => {
        const socket = io('http://localhost:3003');

        socket.on('priceUpdate', (data) => {
            const generateOrders = (basePrice: number, isAsk: boolean) => {
                let cumulativeTotal = 0;
                return Array.from({ length: 8 }).map((_, i) => {
                    const price = isAsk ? basePrice + (i * 0.5) : basePrice - (i * 0.5);
                    const amount = Math.random() * 2;
                    cumulativeTotal += amount;
                    return { price, amount, total: cumulativeTotal };
                });
            };

            setAsks(generateOrders(data.price + 0.5, true).reverse());
            setBids(generateOrders(data.price - 0.5, false));
        });

        return () => { socket.disconnect(); };
    }, []);

    // คำนวณ % สำหรับแถบ Depth (ความยาวสูงสุดที่ 2.0 BTC)
    const getDepthWidth = (amount: number) => Math.min((amount / 2) * 100, 100);

    return (
        <div className="glass-card p-6 h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Order Book</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase">BTC / USDT</span>
            </div>

            <div className="grid grid-cols-3 text-[9px] font-black text-slate-400 uppercase mb-2 px-2">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
            </div>

            <div className="space-y-px mb-2">
                {asks.map((ask, i) => (
                    <div key={`ask-${i}`} className="grid grid-cols-3 text-[10px] font-mono font-bold py-1 px-2 relative group hover:bg-slate-50 transition-colors">
                        <div className="absolute inset-0 bg-rose-50/40 origin-right transition-all" style={{ width: `${getDepthWidth(ask.amount)}%`, left: 'auto', right: 0 }} />
                        <span className="text-rose-500 relative z-10">{ask.price.toFixed(2)}</span>
                        <span className="text-right text-slate-600 relative z-10">{ask.amount.toFixed(4)}</span>
                        <span className="text-right text-slate-400 relative z-10">{ask.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="py-3 border-y border-slate-50 my-2 text-center">
                <p className="text-lg font-black text-slate-900 leading-none">${currentPrice.toLocaleString()}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Spread: 0.50 (0.01%)</p>
            </div>

            <div className="space-y-px">
                {bids.map((bid, i) => (
                    <div key={`bid-${i}`} className="grid grid-cols-3 text-[10px] font-mono font-bold py-1 px-2 relative group hover:bg-slate-50 transition-colors">
                        <div className="absolute inset-0 bg-emerald-50/40 origin-right transition-all" style={{ width: `${getDepthWidth(bid.amount)}%`, left: 'auto', right: 0 }} />
                        <span className="text-emerald-500 relative z-10">{bid.price.toFixed(2)}</span>
                        <span className="text-right text-slate-600 relative z-10">{bid.amount.toFixed(4)}</span>
                        <span className="text-right text-slate-400 relative z-10">{bid.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}