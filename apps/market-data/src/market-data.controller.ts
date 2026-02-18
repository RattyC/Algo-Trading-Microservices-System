// apps/market-data/src/market-data.controller.ts

import { Controller, Post, Body, Get, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { CreateTradeDto } from './dto/create-trade.dto';


@Controller('') 
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) { }

  // บงการราคา (Manual Override)
  @Post('set-price')
  async handleSetPrice(@Body() data: { price: number }) {
    // เรียกใช้ฟังก์ชันที่ส่งงานลง DB
    await this.marketDataService.forcePrice(data.price); 
    return { status: 'success', price: data.price };
  }

  @Post('volatility')
  async handleVolatility(@Body() data: { level: 'low' | 'normal' | 'high' | 'crash' }) {
    // เรียกใช้ฟังก์ชันที่ส่งงานลง DB
    await this.marketDataService.setVolatility(data.level);
    return { status: 'success', newLevel: data.level };
  }

  // 🔄 [UPDATE] กลับสู่โหมดอัตโนมัติ
  @Post('reset')
  async handleReset() {
    this.marketDataService.resetToAuto();
    return { status: 'success', message: 'Market returned to auto-pilot' };
  }

  // บันทึกการเทรด (ลงทั้ง Trades และ Users Collection)
  @Post('trade')
  @UsePipes(new ValidationPipe())
  async placeTrade(@Body() dto: CreateTradeDto) {
    // ใช้ executeTrade เพื่อให้ยอดเงินและเหรียญขยับจริงใน MongoDB
    return await this.marketDataService.executeTrade(dto.userId, dto);
  }

  // ดึงประวัติการเทรดรายบุคคล
  @Get('trades/:userId')
  async getHistory(@Param('userId') userId: string) {
    return await this.marketDataService.getTradeHistory(userId);
  }

  // ดึงยอดเงินและเหรียญในพอร์ต (ใหม่!)
  @Get('portfolio/:userId')
  async getPortfolio(@Param('userId') userId: string) {
    return await this.marketDataService.getPortfolio(userId);
  }

  // ล้างประวัติการเทรด (Admin Only)
  @Delete('trades/purge')
  async clearLogs() {
    await this.marketDataService.purgeTradeHistory();
    return { status: 'success', message: 'All trade logs purged' };
  }
}