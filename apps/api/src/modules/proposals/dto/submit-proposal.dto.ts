import {
  IsString,
  IsNumber,
  IsArray,
  IsIn,
  IsOptional,
  MinLength,
  Min,
  ArrayMinSize,
} from 'class-validator'

export class SubmitProposalDto {
  @IsString()
  participantId!: string

  @IsNumber()
  @Min(0)
  budgetMin!: number

  @IsNumber()
  @Min(0)
  budgetMax!: number

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['cultural', 'gastronómico', 'aventura', 'playa', 'naturaleza', 'nocturno'], { each: true })
  style!: string[]

  @IsIn(['relajado', 'equilibrado', 'intenso'])
  pace!: string

  @IsIn(['mañanero', 'trasnochador', 'flexible'])
  schedule!: string

  @IsString()
  @MinLength(3)
  mustVisit!: string

  @IsString()
  @MinLength(3)
  mustAvoid!: string

  @IsOptional()
  @IsString()
  notes?: string
}