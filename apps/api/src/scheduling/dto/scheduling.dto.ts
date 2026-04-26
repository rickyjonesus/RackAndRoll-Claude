import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Cadence, GameType } from '@prisma/client';

export class CreateChallengeDto {
  @ApiProperty({ description: 'User ID of the opponent' })
  @IsString()
  challengedId!: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiProperty({ example: '2026-05-10T19:00:00Z', description: 'ISO 8601 datetime' })
  @IsDateString()
  proposedAt!: string;

  @ApiPropertyOptional({ description: 'Venue ID' })
  @IsOptional()
  @IsString()
  venueId?: string;
}

export class RespondChallengeDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  accept!: boolean;
}

export class RescheduleDto {
  @ApiProperty({ example: '2026-05-15T19:00:00Z', description: 'ISO 8601 datetime' })
  @IsDateString()
  proposedAt!: string;
}

export class CreateSeriesDto {
  @ApiProperty({ description: 'User ID of the recurring opponent' })
  @IsString()
  challengedId!: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiProperty({ example: '2026-05-01T19:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ enum: Cadence, example: Cadence.WEEKLY })
  @IsEnum(Cadence)
  cadence!: Cadence;

  @ApiPropertyOptional({ description: 'Venue ID' })
  @IsOptional()
  @IsString()
  venueId?: string;
}
