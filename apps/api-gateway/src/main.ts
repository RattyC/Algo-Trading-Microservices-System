//api-gateway/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('API-Gateway');
  const app = await NestFactory.create(ApiGatewayModule);

  // CORS Configuration (เชื่อมต่อกับ Next.js Port 3002)
  app.enableCors({
    origin: 'http://localhost:3002',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //  Auth Service Proxy (Port 3001)
  app.use(
  createProxyMiddleware({
    // 💡 เปลี่ยนจาก filter เป็น pathFilter
    pathFilter: '/auth', 
    target: 'http://localhost:3001',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`🔐 [Auth Proxy] Forwarding: ${req.method} ${req.url} -> :3001${proxyReq.path}`);
      },
    },
  }),
);

  //  Market Service Proxy (Port 3003)
  app.use(
  '/market',
  createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`📡 Forwarding to Market Service: http://localhost:3003${proxyReq.path}`);
      },
    },
  }),
);

  const PORT = 3000;
  await app.listen(PORT);

  logger.log(`🚀 [API-Gateway] is screaming live on: http://localhost:${PORT}`);
  logger.log(`📡 Routing: /auth -> :3001 | /market -> :3003`);
}
bootstrap();