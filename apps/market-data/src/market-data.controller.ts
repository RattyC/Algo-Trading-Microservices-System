import { Controller, Post, Body, Get, Param, Delete, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@Controller('market') 
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) { }

  @Post('set-price')
  @HttpCode(HttpStatus.OK)
  async handleSetPrice(@Body() data: { price: number }) {
    await this.marketDataService.forcePrice(data.price); 
    return { 
      status: 'success', 
      message: 'Market price updated by admin',
      newPrice: data.price 
    };
  }


  @Post('volatility')
  @HttpCode(HttpStatus.OK)
  async handleVolatility(@Body() data: { level: 'low' | 'normal' | 'high' | 'crash' }) {
    await this.marketDataService.setVolatility(data.level);
    return { 
      status: 'success', 
      newLevel: data.level,
      timestamp: new Date().toISOString()
    };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async handleReset() {
    this.marketDataService.resetToAuto();
    return { 
      status: 'success', 
      message: 'Market returned to auto-pilot mode' 
    };
  }

  @Post('trade')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async placeTrade(@Body() dto: CreateTradeDto) {
    return await this.marketDataService.executeTrade(dto.userId, dto);
  }

  @Get('trades/:userId')
  async getHistory(@Param('userId') userId: string) {
    const history = await this.marketDataService.getTradeHistory(userId);
    return history;
  }

  @Get('portfolio/:userId')
  async getPortfolio(@Param('userId') userId: string) {
    const portfolio = await this.marketDataService.getPortfolio(userId);
    return portfolio;
  }

  @Delete('trades/purge')
  @HttpCode(HttpStatus.OK)
  async clearLogs() {
    await this.marketDataService.purgeTradeHistory();
    return { 
      status: 'success', 
      message: 'All trade logs have been permanently deleted' 
    };
  }
}