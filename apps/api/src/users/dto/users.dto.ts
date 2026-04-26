import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { GameType } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: "Rack's Billiards" })
  homeVenue?: string;

  @ApiPropertyOptional({ enum: GameType, isArray: true })
  preferredGames?: GameType[];
}

export class RespondContactDto {
  @ApiProperty()
  accept!: boolean;
}
