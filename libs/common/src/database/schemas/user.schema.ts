// libs/common/src/database/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
class Holding {
    @Prop() symbol: string;
    @Prop() amount: number;
    @Prop() avgPrice: number;
}
const HoldingSchema = SchemaFactory.createForClass(Holding);

@Schema({ versionKey: false, timestamps: true })
export class User {
    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ default: 0 })
    balance: number;

    @Prop({ required: true })
    password: string;

    @Prop()
    name?: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ type: [HoldingSchema], default: [] })
    holdings: Holding[];
}

export const UserSchema = SchemaFactory.createForClass(User);