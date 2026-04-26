import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GameType } from '@prisma/client';

export class CreateMatchDto {
  @ApiPropertyOptional({ description: 'ID of a registered opponent. Provide this OR guestName.' })
  opponentId?: string;

  @ApiPropertyOptional({ description: 'Display name for an unregistered opponent. Provide this OR opponentId.' })
  guestName?: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  gameType!: GameType;

  @ApiPropertyOptional({ example: 7, description: 'Racks needed to win' })
  raceToRacks?: number;

  @ApiPropertyOptional({ description: 'Venue ID' })
  venueId?: string;
}

export class AddRackDto {
  @ApiProperty({ description: 'ID of the rack winner (home player ID or "__guest__" for guest)' })
  winnerId!: string;

  @ApiProperty({ example: 1 })
  rackNum!: number;
}

export class RecordLeagueResultDto {
  @ApiProperty()
  winnerId!: string;
}
