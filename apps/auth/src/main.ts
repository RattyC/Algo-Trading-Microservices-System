import { NestFactory } from '@nestjs/core';
import { AuthLibModule } from './auth.module'; 
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; 

async function bootstrap() {
    const app = await NestFactory.create(AuthLibModule); 

    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3001; 

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(port);
    console.log(`🔐 Auth Service is running on: http://localhost:${port}`);
}
bootstrap();