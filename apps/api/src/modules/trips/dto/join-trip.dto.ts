import { IsString, MinLength } from 'class-validator'

export class JoinTripDto {
  @IsString()
  @MinLength(2)
  displayName!: string
}