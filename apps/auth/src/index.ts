// auth/src/index.ts

export * from './auth.module';
export * from './auth.service';

// 1. ตรวจสอบชื่อไฟล์ Guard (ในรูปคุณชื่อ access-token.guard.ts)
export * from './guards/access-token.guard'; 
export * from './guards/roles.guard';

// 2. Decorators
export * from './decorators/roles.decorator';

// 3. Strategies (ในรูปคุณมีหลายตัว Export ตัวหลักออกมา)
export * from './strategies/jwt.strategy';
export * from './strategies/access-token.strategy';