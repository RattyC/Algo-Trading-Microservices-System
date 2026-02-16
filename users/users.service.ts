import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name); 

    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    async findByEmailWithSecrets(email: string) {
        return this.userModel.findOne({ email }).select('+passwordHash +refreshTokenHash').exec();
    }

    async findByIdWithRefresh(userId: string) {
        return this.userModel.findById(userId).select('+refreshTokenHash').exec();
    }

    // ปรับปรุง: เพิ่ม await และ logging เพื่อเช็คปัญหาข้อมูลไม่ลง DB
    async create(data: { email: string; passwordHash: string; role?: UserRole }) {
        this.logger.log(`🏗️ กำลังสร้าง User ใหม่: ${data.email}`);
        
        const newUser = await this.userModel.create({
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role ?? 'user',
        });

        if (newUser) {
            this.logger.log(`✅ บันทึก User ลง MongoDB สำเร็จ: ${newUser._id}`);
        }
        return newUser;
    }

    async setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
        return this.userModel.updateOne({ _id: userId }, { refreshTokenHash }).exec();
    }

    async setRole(userId: string, role: UserRole) {
        return this.userModel.updateOne({ _id: userId }, { role }).exec();
    }


    // สำหรับดึงข้อมูล User ทั้งหมด (ใช้ใน Admin Dashboard)
    async findAll() {
        return this.userModel.find().exec();
    }

    // สำหรับค้นหาด้วย ID แบบปกติ
    async findById(userId: string) {
        return this.userModel.findById(userId).exec();
    }

    // สำหรับลบผู้ใช้ (กรณี Admin ต้องการจัดการ User)
    async remove(userId: string) {
        this.logger.warn(`🗑️ กำลังลบ User ID: ${userId}`);
        return this.userModel.findByIdAndDelete(userId).exec();
    }

    // สำหรับอัปเดตข้อมูลทั่วไป (เช่น เปลี่ยน Email หรือข้อมูลโปรไฟล์)
    async update(userId: string, updateData: Partial<User>) {
        return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    }
}