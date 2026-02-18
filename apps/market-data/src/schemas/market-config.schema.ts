import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class MarketConfig extends Document {
    @Prop({ default: 'normal' })
    volatility: string; // low, normal, high, crash

    @Prop({ default: 50000 })
    lastPrice: number;
}
export const MarketConfigSchema = SchemaFactory.createForClass(MarketConfig);