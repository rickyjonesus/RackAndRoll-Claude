import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString } from 'class-validator';
import { GameType } from '@prisma/client';

export class CreateLeagueDto {
  @ApiProperty({ example: 'Friday Night 8-Ball' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: GameType, example: GameType.EIGHT_BALL })
  @IsEnum(GameType)
  gameType!: GameType;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-07-31' })
  @IsDateString()
  endDate!: string;
}

export class RecordLeagueResultDto {
  @ApiProperty({ description: 'User ID of the winner' })
  @IsString()
  winnerId!: string;
}
