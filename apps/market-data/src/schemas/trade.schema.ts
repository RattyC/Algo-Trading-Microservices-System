import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trade extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, enum: ['BUY', 'SELL'] })
    type: string;

    @Prop({ required: true })
    symbol: string; // เช่น BTC/USDT

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    amount: number;
}
export const TradeSchema = SchemaFactory.createForClass(Trade);