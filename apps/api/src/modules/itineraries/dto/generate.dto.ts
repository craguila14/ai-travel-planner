import { IsString } from 'class-validator'

export class GenerateDto {
  @IsString()
  participantId!: string
}