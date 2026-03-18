import { IsNotEmpty, IsNumber, Min, IsString, Length } from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;
}
