// apps/market-data/src/market-data.controller.ts

import { Controller, Post, Body, Get, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { CreateTradeDto } from './dto/create-trade.dto';
@Controller('')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) { }


  @Post('set-price')
  async handleSetPrice(@Body() data: { price: number }) {
    this.marketDataService.forcePrice(data.price);
    return { status: 'success' };
  }


  @Post('reset')
  async handleReset() {
    this.marketDataService.resetToAuto();
    return { status: 'success', message: 'Market returned to auto-pilot' };
  }


  @Post('volatility')
  async handleVolatility(@Body() data: { level: 'low' | 'normal' | 'high' | 'crash' }) {
    this.marketDataService.setVolatility(data.level);
    return { status: 'success', newLevel: data.level };
  }

  @Post('trade')
  @UsePipes(new ValidationPipe()) // ดักจับ Error ตาม DTO
  async placeTrade(@Body() dto: CreateTradeDto) {
    return await this.marketDataService.createTrade(dto);
  }

  //  ดึงประวัติการเทรดของผู้ใช้
  @Get('trades/:userId')
  async getHistory(@Param('userId') userId: string) {
    return await this.marketDataService.getTradeHistory(userId);
  }

  // ปรับค่าตลาด (บงการตลาด)
  @Post('volatility')
  async setVol(@Body() data: { level: 'low' | 'normal' | 'high' | 'crash' }) {
    return await this.marketDataService.setVolatility(data.level);
  }

  @Delete('trades/purge')
  async clearLogs() {
    await this.marketDataService.purgeTradeHistory();
    return { status: 'success', message: 'All trade logs purged' };
  }
}
