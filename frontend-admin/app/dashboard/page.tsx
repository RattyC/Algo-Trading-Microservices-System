"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, ISeriesApi } from 'lightweight-charts';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import {
  Activity, Zap, TrendingUp, RefreshCcw, ShieldAlert, Wifi,
  WifiOff, BarChart3, Settings2, Terminal, AlertTriangle, Play, Pause
} from 'lucide-react';

export default function AlgoTradingDashboard() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [price, setPrice] = useState<number>(0);
  const [inputPrice, setInputPrice] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [marketMode, setMarketMode] = useState<'Auto' | 'Manual'>('Auto');
  const [volatility, setVolatility] = useState('normal');
  const [logs, setLogs] = useState<Array<{ time: string, msg: string, type: string }>>([]);

  const addLog = (msg: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 6));
  };

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 480,
      layout: { background: { type: ColorType.Solid, color: '#020617' }, textColor: '#64748b' },
      grid: { vertLines: { color: '#0f172a' }, horzLines: { color: '#0f172a' } },
      timeScale: { timeVisible: true, secondsVisible: true, borderColor: '#1e293b' },
      rightPriceScale: { borderColor: '#1e293b' },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#10b981', wickDownColor: '#ef4444',
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6', lineWidth: 2, title: 'Trendline (SMA 10)'
    });

    const socket: Socket = io('http://localhost:3003');
    const priceHistory: number[] = [];

    socket.on('connect', () => { setIsConnected(true); addLog('Connected to Market Stream', 'success'); });
    socket.on('disconnect', () => { setIsConnected(false); addLog('Disconnected from Stream', 'error'); });

    socket.on('price_update', (data) => {
      setPrice(data.price);
      const timestamp = Math.floor(data.time / 1000) as any;
      candleSeries.update({ time: timestamp, open: data.price, high: data.price, low: data.price, close: data.price });

      priceHistory.push(data.price);
      if (priceHistory.length > 10) priceHistory.shift();
      const avg = priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length;
      smaSeries.update({ time: timestamp, value: avg });
    });

    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
      chart.remove();
    };
  }, [isMounted]);

  const runCommand = async (endpoint: string, payload: any = {}) => {
    try {
      await axios.post(`http://localhost:3000/market/${endpoint}`, payload);
      addLog(`Command [${endpoint}] executed successfully`, 'success');
      if (endpoint === 'set-price') setMarketMode('Manual');
      if (endpoint === 'reset') setMarketMode('Auto');
    } catch (err) {
      addLog(`Failed to execute [${endpoint}]`, 'error');
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      {/* Top Navigation / Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg"><Activity className="text-blue-500 w-6 h-6" /></div>
            <h1 className="text-2xl font-black text-white tracking-tight">ALGO-CORE <span className="text-blue-500 text-sm font-mono ml-2">v2.0.4-BETA</span></h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-slate-500">
            <span className="flex items-center gap-1">{isConnected ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-rose-500" />} {isConnected ? 'Link Stable' : 'Link Lost'}</span>
            <span className="flex items-center gap-1"><Settings2 className="w-3 h-3" /> Mode: <span className={marketMode === 'Auto' ? 'text-emerald-500' : 'text-amber-500'}>{marketMode}</span></span>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-8 shadow-2xl">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Market Benchmark (BTC)</p>
            <p className="text-4xl font-mono font-black text-white leading-none">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`h-12 w-1 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Visuals & Logs */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800/50 overflow-hidden shadow-inner backdrop-blur-sm">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" /><span className="text-xs font-bold text-slate-400 uppercase">Live Execution Graph</span></div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500/20 border border-rose-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/20 border border-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
              </div>
            </div>
            <div ref={chartContainerRef} className="w-full" />
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-900 p-5 font-mono shadow-2xl">
            <div className="flex items-center gap-2 mb-4 text-slate-500"><Terminal className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest">System Kernel Logs</span></div>
            <div className="space-y-1.5 min-h-[120px]">
              {logs.map((log, i) => (
                <div key={i} className="text-[11px] flex gap-4 animate-in fade-in slide-in-from-left-2">
                  <span className="text-slate-600">[{log.time}]</span>
                  <span className={log.type === 'error' ? 'text-rose-500' : log.type === 'success' ? 'text-emerald-500' : 'text-blue-400'}>
                    {log.type === 'success' ? '>>>' : '---'} {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="xl:col-span-4 space-y-6">
          {/* Price Injection */}
          <div className="group bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all shadow-xl">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Zap className="w-4 h-4 fill-blue-500/20" /> Liquidity Injection</h3>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">$</span>
                <input
                  type="number" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)}
                  placeholder="Target Price Override..."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-10 pr-4 text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => runCommand('set-price', { price: Number(inputPrice) })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                EXECUTE OVERRIDE
              </button>
              <button
                onClick={() => runCommand('reset')}
                className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCcw className="w-3 h-3" /> REVERT TO SYSTEM AUTO
              </button>
            </div>
          </div>

          {/* Market Dynamics */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Market Volatility</h3>
            <div className="grid grid-cols-2 gap-3">
              {['low', 'normal', 'high', 'crash'].map((lvl) => (
                <button
                  key={lvl} onClick={() => { setVolatility(lvl); runCommand('volatility', { level: lvl }); }}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${volatility === lvl ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
              <button
                onClick={() => runCommand('volatility', { level: 'crash' })}
                className="w-full flex items-center justify-center gap-2 text-rose-500 text-[10px] font-black uppercase"
              >
                <AlertTriangle className="w-3 h-3" /> Trigger Black Swan Event
              </button>
            </div>
          </div>

          {/* Researcher Identity Card */}
          <div className="bg-blue-600/5 p-5 rounded-2xl border border-blue-500/10 flex items-start gap-4">
            <div className="bg-blue-600/20 p-2 rounded-lg"><TrendingUp className="w-4 h-4 text-blue-400" /></div>
            <div>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Quant Research Node</p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Project Alpha: Stochastic Price Engine.
                Specializing in Quantum AI Risk Mitigation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}