// src/auth/auth.service.ts
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException, NotFoundException, Inject } from '@nestjs/common';
import { UsersService } from '@app/users';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { User } from './schemas/user.schema';   
import { UserDocument } from '@app/common/database/schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';



@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    private async signTokens(user: { id: string; email: string; role: string }) {
        const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

        const accessExp = Number.parseInt(this.config.get<string>('JWT_ACCESS_EXPIRATION') ?? '900', 10);
        const refreshExp = Number.parseInt(this.config.get<string>('JWT_REFRESH_EXPIRATION') ?? '604800', 10);

        const payload = { sub: user.id, email: user.email, role: user.role };

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExp }),
            this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExp }),
        ]);

        return { access_token, refresh_token };
    }

    async getFullProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    const userObject = user.toObject();
    const { passwordHash, refreshTokenHash, ...result } = userObject;
    return result; 
}
    private async storeRefreshHash(userId: string, refreshToken: string) {
        const hash = await argon2.hash(refreshToken);
        await this.usersService.setRefreshTokenHash(userId, hash);
    }

    async signUp(dto: AuthDto) {
        const email = this.normalizeEmail(dto.email);
        const userExists = await this.usersService.findByEmail(email);
        if (userExists) throw new BadRequestException('Email นี้ถูกใช้งานแล้ว');

        const passwordHash = await argon2.hash(dto.password);

        // ✅ Cast เป็น any หรือ User เพื่อให้เข้าถึงฟิลด์ที่เพิ่งสร้างใน Schema ได้
        const newUser = await this.usersService.create({
            email,
            passwordHash,
            role: 'user'
        }) as any;

        const tokens = await this.signTokens({ id: String(newUser._id), email: newUser.email, role: newUser.role });
        await this.storeRefreshHash(String(newUser._id), tokens.refresh_token);

        return {
            ...tokens,
            user: {
                email: newUser.email,
                role: newUser.role,
                balance: newUser.balance,
                holdings: newUser.holdings
            }
        };
    }

    async signIn(dto: AuthDto) {
        const email = this.normalizeEmail(dto.email);

        // ✅ ใช้ "as any" เพื่อ bypass type check ของ Mongoose Document ชั่วคราว
        const user = await this.usersService.findByEmailWithSecrets(email) as any;

        if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

        const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
        if (!passwordMatches) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

        const tokens = await this.signTokens({ id: String(user._id), email: user.email, role: user.role });

        await this.storeRefreshHash(String(user._id), tokens.refresh_token);

        return {
            ...tokens,
            user: {
                email: user.email,
                role: user.role,
                balance: user.balance,
                holdings: user.holdings
            }
        };
    }

    async refreshTokens(userId: string, email: string, role: string, refreshToken: string) {
        if (!refreshToken) throw new ForbiddenException('Access denied');

        const user = await this.usersService.findByIdWithRefresh(userId);
        if (!user?.refreshTokenHash) throw new ForbiddenException('Access denied');

        const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
        if (!matches) throw new ForbiddenException('Access denied');

        const tokens = await this.signTokens({ id: userId, email, role });

        // Rotation: refresh token ใหม่ต้องถูกเก็บ hash ใหม่ทับตัวเก่า
        await this.storeRefreshHash(userId, tokens.refresh_token);

        return tokens;
    }

    async logout(userId: string) {
        await this.usersService.setRefreshTokenHash(userId, null);
        return { success: true };
    }

}
