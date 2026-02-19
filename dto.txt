import { IsString, IsNumber, IsEnum, Min, IsNotEmpty } from 'class-validator';

export class CreateTradeDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsEnum(['BUY', 'SELL'], { message: 'Type must be BUY or SELL' })
    type: 'BUY' | 'SELL';

    @IsString()
    symbol: string;

    @IsNumber()
    @Min(0.00001, { message: 'Amount must be greater than 0' })
    amount: number;

    @IsNumber()
    @Min(1)
    price: number;
}