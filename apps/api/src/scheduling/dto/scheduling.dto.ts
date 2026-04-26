import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cadence, GameType } from '@prisma/client';

export class CreateChallengeDto {
  @ApiProperty({ description: 'User ID of the opponent' })
  challengedId!: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  gameType!: GameType;

  @ApiProperty({ example: '2026-05-10T19:00:00Z', description: 'ISO 8601 datetime' })
  proposedAt!: string;

  @ApiPropertyOptional({ description: 'Venue ID' })
  venueId?: string;
}

export class RespondChallengeDto {
  @ApiProperty({ example: true })
  accept!: boolean;
}

export class RescheduleDto {
  @ApiProperty({ example: '2026-05-15T19:00:00Z', description: 'ISO 8601 datetime' })
  proposedAt!: string;
}

export class CreateSeriesDto {
  @ApiProperty({ description: 'User ID of the recurring opponent' })
  challengedId!: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  gameType!: GameType;

  @ApiProperty({ example: '2026-05-01T19:00:00Z' })
  startDate!: string;

  @ApiProperty({ enum: Cadence, example: Cadence.WEEKLY })
  cadence!: Cadence;

  @ApiPropertyOptional({ description: 'Venue ID' })
  venueId?: string;
}
