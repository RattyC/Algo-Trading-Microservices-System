import { NestFactory } from '@nestjs/core';
import { MarketDataModule } from './market-data.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Market-Data-Service');
  const app = await NestFactory.create(MarketDataModule);
  const PORT = process.env.PORT || 3003; 

  await app.listen(PORT);
  
  logger.log(`📈 Market Data Service is running on: http://localhost:${PORT}`);
}
bootstrap();