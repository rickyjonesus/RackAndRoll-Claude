import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { GameType } from '@prisma/client';

export class CreateMatchDto {
  @ApiPropertyOptional({ description: 'ID of a registered opponent. Provide this OR guestName.' })
  @IsOptional()
  @IsString()
  opponentId?: string;

  @ApiPropertyOptional({ description: 'Display name for an unregistered opponent. Provide this OR opponentId.' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiPropertyOptional({ example: 7, description: 'Racks needed to win' })
  @IsOptional()
  @IsInt()
  @Min(1)
  raceToRacks?: number;

  @ApiPropertyOptional({ description: 'Venue ID' })
  @IsOptional()
  @IsString()
  venueId?: string;
}

export class AddRackDto {
  @ApiProperty({ description: 'ID of the rack winner (home player ID or "__guest__" for guest)' })
  @IsString()
  winnerId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  rackNum!: number;
}

export class RecordLeagueResultDto {
  @ApiProperty()
  @IsString()
  winnerId!: string;
}
