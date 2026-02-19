// frontend-admin/app/hooks/usePortfolio.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const usePortfolio = (currentPrice: number) => {
    const [portfolio, setPortfolio] = useState({ balance: 0, holdings: [] as any[] });
    const [trades, setTrades] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        const userId = Cookies.get('user_id');
        const token = Cookies.get('access_token');
        console.log('🔍 Checking Cookies:', { userId, token: token ? 'Exists' : 'Missing' });
        if (!userId || !token) return;

        try {
            const [portRes, tradeRes, profileRes] = await Promise.all([
                axios.get(`http://localhost:3000/market/portfolio/${userId}`),
                axios.get(`http://localhost:3000/market/trades/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:3000/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            console.log('📡 API Response - Portfolio:', portRes.data);
            console.log('📡 API Response - Profile (Balance):', profileRes.data.balance);
            const finalBalance = profileRes.data.balance ?? portRes.data.balance ?? 0;

            setPortfolio({
                ...portRes.data,
                balance: Number(portRes.data.balance || profileRes.data?.balance || 0),
                holdings: portRes.data.holdings || []
            });

            if (tradeRes.data) {
                setTrades(tradeRes.data.map((t: any) => ({
                    id: t._id,
                    type: t.type,
                    qty: t.amount,
                    price: t.price,
                    time: new Date(t.createdAt).toLocaleTimeString()
                })));
            }
        } catch (err) {
            console.error("❌ Data fetch failed:", err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTrade = async (type: 'BUY' | 'SELL', qty: number) => {
        const userId = Cookies.get('user_id');
        const token = Cookies.get('access_token');
        
        try {
            await axios.post('http://localhost:3000/market/trade', {
                userId, type, symbol: 'BTC/USDT', amount: qty, price: currentPrice
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            await fetchData(); 
            return { success: true };
        } catch (err: any) {
            return { success: false, msg: err.response?.data?.message };
        }
    };

    const btcHolding = portfolio.holdings?.find(h => h.symbol === 'BTC/USDT') || { amount: 0 };
    const totalEquity = (Number(portfolio.balance) || 0) + (btcHolding.amount * currentPrice);

    return { portfolio, trades, handleTrade, totalEquity, btcHolding };
};