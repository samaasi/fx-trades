import { IsNotEmpty, IsNumber, Min, IsString, Length } from 'class-validator';

export class ConvertCurrencyDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  fromCurrency: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  toCurrency: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
