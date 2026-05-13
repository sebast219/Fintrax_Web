import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class AllocateGoalDto {
  @IsNumber()
  @Min(0.01)
  @Max(999999.99)
  amount: number;

  @IsUUID()
  goalId: string;

  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsString()
  @Max(500)
  note?: string;
}

export class DeallocateGoalDto {
  @IsNumber()
  @Min(0.01)
  @Max(999999.99)
  amount: number;

  @IsUUID()
  goalId: string;

  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsString()
  @Max(500)
  note?: string;
}
