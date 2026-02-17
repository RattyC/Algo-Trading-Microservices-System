// src/auth/strategies/access-token.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
    sub: string;
    email: string;
    role: string;
};

@Injectable()
// 'jwt' ตรงนี้คือชื่อ default strategy ถ้าเปลี่ยน ต้องแก้ใน Guard ด้วย
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
    super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get<string>('JWT_ACCESS_SECRET')!, 
});
    }

    validate(payload: any) {
        // 3. ลอง console.log ดูว่า Code วิ่งมาถึงตรงนี้ไหม
        console.log('Payload inside Strategy:', payload);

        {
    return { sub: payload.sub, email: payload.email, role: payload.role };}
    }}