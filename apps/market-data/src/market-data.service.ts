// apps/market-data/src/market-data.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { MarketGateway } from './market.gateway';
import { Trade } from './schemas/trade.schema';
import { MarketConfig } from './schemas/market-config.schema';
import { CreateTradeDto } from './dto/create-trade.dto';

@Injectable()
export class MarketDataService implements OnModuleInit {
  private currentPrice: number = 50000;
  private isManualOverride: boolean = false;
  private currentVolatility: number = 0.0015;

  constructor(
    private readonly gateway: MarketGateway,
    @InjectModel(Trade.name) private tradeModel: Model<Trade>,
    @InjectModel(MarketConfig.name) private configModel: Model<MarketConfig>,
  ) { }

  // มื่อโมดูลเริ่มทำงาน ให้โหลดค่าล่าสุดจาก MongoDB
  async onModuleInit() {
    const config = await this.configModel.findOne().exec();
    if (config) {
      this.currentPrice = config.lastPrice;
      // Map กลับจากตัวเลขเป็นระดับความผันผวน (ถ้าจำเป็น)
      console.log(`📡 Loaded Market State: $${this.currentPrice}`);
    } else {
      // ถ้ายังไม่มีข้อมูล ให้สร้างชุดแรกไว้ใน DB
      await this.configModel.create({ lastPrice: 50000, volatility: 'normal' });
    }
  }

  async setVolatility(level: 'low' | 'normal' | 'high' | 'crash') {
    const levels = { low: 0.0005, normal: 0.0015, high: 0.005, crash: 0.02 };
    this.currentVolatility = levels[level];

    // บันทึกการเปลี่ยนแปลงลง MongoDB 
    await this.configModel.updateOne({}, { volatility: level });
    console.log(`⚠️ Market Volatility set to: ${level}`);
  }

  @Cron('*/2 * * * * *')
  async generatePrice() {
    if (!this.isManualOverride) {
      const standardChange = this.currentPrice * (0.00002 + this.currentVolatility * this.gaussianRandom());
      this.currentPrice += standardChange;
    }

    this.currentPrice = parseFloat(this.currentPrice.toFixed(2));
    this.gateway.broadcastPrice(this.currentPrice);

    // บันทึกราคาล่าสุดลง DB เป็นระยะ (
    await this.configModel.updateOne({}, { lastPrice: this.currentPrice });
  }

  // Create Trade
  async createTrade(dto: CreateTradeDto) {
    const newTrade = new this.tradeModel(dto);
    const result = await newTrade.save();
    console.log(`💰 Trade Recorded: ${dto.type} ${dto.amount} BTC`);
    return result;
  }

  // Read Trade History
  async getTradeHistory(userId: string) {
    return await this.tradeModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  // Delete Trade History (ปุ่มสำหรับ Admin ล้าง Log)
  async purgeTradeHistory() {
    return await this.tradeModel.deleteMany({}).exec();
  }

  resetToAuto() {
    this.isManualOverride = false;
  }

  forcePrice(price: number) {
    this.currentPrice = price;
    this.isManualOverride = true;
    this.gateway.broadcastPrice(this.currentPrice);
  }

  private gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}