// apps/market-data/src/market-data.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { MarketDataService } from './market-data.service';

@Controller('') 
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}


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
}