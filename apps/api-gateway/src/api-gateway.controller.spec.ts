import { Test, TestingModule } from '@nestjs/testing';
import { MarketController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

describe('MarketController', () => { 
  let marketController: MarketController; 

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MarketController],
      providers: [ApiGatewayService],
    }).compile();

    marketController = app.get<MarketController>(MarketController); 
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(marketController.getHello()).toBe('Hello World!');
    });
  });
});