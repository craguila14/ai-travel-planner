import { IsString, IsDateString, IsOptional, IsIn, MinLength } from 'class-validator'

export class CreateTripDto {
  @IsString()
  @MinLength(3)
  name!: string

  @IsString()
  @MinLength(3)
  destination!: string

  @IsDateString()
  startDate!: string

  @IsDateString()
  endDate!: string

  @IsOptional()
  @IsIn(['USD', 'EUR', 'CLP', 'MXN', 'ARS', 'COP'])
  currency?: string

  @IsString()
  @MinLength(2)
  organizerName!: string
}