import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose'; 

export type TradeDocument = HydratedDocument<Trade>;
@Schema({ timestamps: true })
export class Trade { 
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, enum: ['BUY', 'SELL'] })
    type: string;

    @Prop({ required: true })
    symbol: string; 

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    amount: number;
}

export const TradeSchema = SchemaFactory.createForClass(Trade);