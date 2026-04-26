import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameType } from '@prisma/client';

export class CreateLeagueDto {
  @ApiProperty({ example: 'Friday Night 8-Ball' })
  name!: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  gameType!: GameType;

  @ApiProperty({ example: '2026-05-01' })
  startDate!: string;

  @ApiProperty({ example: '2026-07-31' })
  endDate!: string;
}

export class RecordLeagueResultDto {
  @ApiProperty({ description: 'User ID of the winner' })
  winnerId!: string;
}
