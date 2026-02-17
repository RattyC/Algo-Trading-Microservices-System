// src/api-gateway/api-gateway.controller.ts
import { Body, Controller, Post, UseGuards, Inject , Get} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AccessTokenGuard, RolesGuard, Roles } from 'apps/auth/src';

@Controller('market')
export class MarketController {
  constructor(@Inject('MARKET_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
  @Post('set-price')
  @UseGuards(AccessTokenGuard, RolesGuard) //  ล็อกประตู 1: ต้อง Login
  @Roles('admin')                      //  ล็อกประตู 2: ต้องเป็น Admin
  setPrice(@Body() body: { price: number }) {
    this.client.emit('cmd_set_price', { price: body.price });
    return { message: 'Price update command sent!' };
  }
}
