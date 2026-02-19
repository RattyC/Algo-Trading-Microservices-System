"use client";
import React, { useState } from 'react';
import { Activity, Zap, ShieldAlert, BarChart3, Settings2, Terminal, AlertTriangle, RefreshCcw, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { useMarket } from '../hooks/useMarket';
import MarketChart from '../components/MarketChart';
import LogoutButton from '../components/LogoutButton';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../styles/theme.css';

export default function AdminDashboardPro() {
  const { price, socketConnected } = useMarket();
  const [inputPrice, setInputPrice] = useState('');
  const [volatility, setVolatility] = useState('normal');
  const [marketMode, setMarketMode] = useState<'Auto' | 'Manual'>('Auto');
  const [logs, setLogs] = useState<any[]>([]);

  // ระบบบันทึก Log ภายใน Admin Terminal
  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id: Date.now(), time, msg, type }, ...prev].slice(0, 5));
  };

  // 2. อัปเกรด runCommand ให้รองรับ Method POST และ DELETE
  const runCommand = async (endpoint: string, payload: any = {}, method: 'POST' | 'DELETE' = 'POST') => {
    try {
      const token = Cookies.get('access_token');
      const url = `http://localhost:3000/market/${endpoint}`;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (method === 'DELETE') {
        await axios.delete(url, config);
      } else {
        await axios.post(url, payload, config);
      }

      if (endpoint === 'set-price') setMarketMode('Manual');
      if (endpoint === 'reset') setMarketMode('Auto');
      addLog(`Command [${endpoint}] deployed successfully`, 'success');
    } catch (err) {
      addLog(`System Error: Execution [${endpoint}] Failed`, 'error');
    }
  };


  const handlePurgeLogs = () => {
    const isConfirmed = window.confirm("⚠️ คำเตือน: คุณกำลังจะลบประวัติการเทรด 'ทั้งหมด' ออกจากฐานข้อมูลถาวร ยืนยันหรือไม่?");
    if (isConfirmed) {
      runCommand('trades/purge', {}, 'DELETE');
    }
  };

  return (
    <div className="angel-bg pb-12 min-h-screen">
      {/* Header Section */}
      <nav className="border-b border-white bg-white/40 backdrop-blur-md sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2.5 rounded-2xl shadow-lg shadow-slate-200">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Alpha.Core <span className="text-blue-500 font-bold ml-1">Admin</span></h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Market Control Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                {socketConnected ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-rose-500" />}
                Market Index
              </span>
              <span className="text-2xl font-mono font-black text-slate-900 leading-none">
                ${(price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-12 gap-8">
        {/* Left Column: Visual Analytics */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/30">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Quantitative Graph</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${marketMode === 'Auto' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {marketMode} Mode Enabled
              </div>
            </div>
            <div className="p-4 bg-white/20">
              <MarketChart theme="light" />
            </div>
          </div>

          {/* System Kernel Log */}
          <div className="bg-slate-900 rounded-4xl p-6 font-mono text-white shadow-2xl relative overflow-hidden">
            <Terminal className="absolute top-4 right-4 text-white/5 w-24 h-24" />
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase">Kernel Activity Log</span>
            </div>
            <div className="space-y-2 min-h-30">
              {logs.map(log => (
                <div key={log.id} className="text-[11px] flex gap-4 opacity-90">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-blue-300'}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Manipulation Tools */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" /> Price Override
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input
                  type="number" value={inputPrice} onChange={e => setInputPrice(e.target.value)}
                  className="angel-input w-full pl-8" placeholder="Enter target price..."
                />
              </div>
              <button onClick={() => runCommand('set-price', { price: Number(inputPrice) })} className="angel-btn-primary w-full">DEPLOY OVERRIDE</button>
              <button onClick={() => runCommand('reset')} className="w-full py-3 text-slate-400 text-[10px] font-black uppercase hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                <RefreshCcw className="w-3 h-3" /> Restore Autonomous Control
              </button>
            </div>
          </div>

          <div className="glass-card p-8 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" /> Volatility Matrix
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['low', 'normal', 'high', 'crash'].map(lvl => (
                <button
                  key={lvl} onClick={() => { setVolatility(lvl); runCommand('volatility', { level: lvl }); }}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${volatility === lvl ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 3. กล่อง Risk Protocol ที่อัปเดตเพิ่มปุ่มลบข้อมูล */}
          <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-[2.5rem] space-y-4">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Risk & Data Protocol</h3>
            
            <button
              onClick={() => runCommand('volatility', { level: 'crash' })}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Trigger Black Swan Event
            </button>
            
            <button
              onClick={handlePurgeLogs}
              className="w-full bg-white border border-rose-200 hover:bg-rose-50 text-rose-500 py-4 rounded-2xl font-black text-[10px] uppercase transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Purge All Trade Logs
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}