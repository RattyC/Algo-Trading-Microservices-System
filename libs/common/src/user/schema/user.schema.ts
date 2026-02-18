import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    passwordHash!: string;

    @Prop({ default: 100000 })
    balance!: number;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Prop({
        type: [{
            symbol: String,
            amount: { type: Number, default: 0 },
            avgPrice: { type: Number, default: 0 }
        }],
        default: []
    })
    holdings!: Array<{ symbol: string; amount: number; avgPrice: number }>;

    @Prop()
    refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);