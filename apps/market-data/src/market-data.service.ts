import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketGateway } from './market.gateway';

@Injectable()
export class MarketDataService {
  private currentPrice: number = 50000;
  private isManualOverride: boolean = false;
  private currentVolatility: number = 0.0015; // ค่าความผันผวนเริ่มต้น

  constructor(private readonly gateway: MarketGateway) {}

  // 💡 ฟังก์ชันใหม่: กลับสู่โหมดรันราคาอัตโนมัติ
  resetToAuto() {
    this.isManualOverride = false;
    console.log('🔄 Market returned to Auto-Pilot');
  }

  // 💡 ฟังก์ชันใหม่: ปรับระดับความผันผวน (Bull/Bear/Crash)
  setVolatility(level: 'low' | 'normal' | 'high' | 'crash') {
    const levels = { low: 0.0005, normal: 0.0015, high: 0.005, crash: 0.02 };
    this.currentVolatility = levels[level];
  }

  @Cron('*/2 * * * * *')
  generatePrice() {
    if (!this.isManualOverride) {
      // ใช้สูตร GBM ที่เราทำกันไว้
      const standardChange = this.currentPrice * (0.00002 + this.currentVolatility * this.gaussianRandom());
      this.currentPrice += standardChange;
    }
    
    this.currentPrice = parseFloat(this.currentPrice.toFixed(2));
    this.gateway.broadcastPrice(this.currentPrice);
  }

  private gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  forcePrice(price: number) {
    this.currentPrice = price;
    this.isManualOverride = true;
    this.gateway.broadcastPrice(this.currentPrice);
  }
  
}