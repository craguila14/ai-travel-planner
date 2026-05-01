import { IsString, IsIn } from 'class-validator'

export class VoteDto {
  @IsString()
  participantId!: string

  @IsIn(['UP', 'DOWN'])
  value!: 'UP' | 'DOWN'
}