// auth/src/schemas/user.schema.ts
import { Prop, Schema , SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ default: 100000 }) 
    balance: number;

    @Prop({
        type: [{
            symbol: String,
            amount: { type: Number, default: 0 },
            avgPrice: { type: Number, default: 0 }
        }]
    })
    holdings: Array<{ symbol: string; amount: number; avgPrice: number }>;
}
export const UserSchema = SchemaFactory.createForClass(User);


