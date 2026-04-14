import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardType, CardNetwork } from '@prisma/client';

export class CreateCardDto {
  @ApiProperty({ example: 'Tarjeta de Crédito Visa' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  cardName: string;

  @ApiProperty({ enum: CardType })
  @IsEnum(CardType)
  cardType: CardType;

  @ApiProperty({ enum: CardNetwork })
  @IsEnum(CardNetwork)
  network: CardNetwork;

  @ApiProperty({ example: '4521' })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  lastFour: string;

  @ApiPropertyOptional({ example: 'abc-123-account-id' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ example: 5000.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  creditLimit?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  billingDay?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  paymentDueDay?: number;

  @ApiPropertyOptional({ example: 18.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  interestRate?: number;

  @ApiPropertyOptional({ example: '#1E293B' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiPropertyOptional({ example: 2027 })
  @IsOptional()
  @IsNumber()
  expiryYear?: number;
}

export class UpdateCardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CardType)
  cardType?: CardType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastFour?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
