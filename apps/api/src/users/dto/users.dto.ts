import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { GameType } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: "Rack's Billiards" })
  @IsOptional()
  @IsString()
  homeVenue?: string;

  @ApiPropertyOptional({ enum: GameType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(GameType, { each: true })
  preferredGames?: GameType[];
}

export class RespondContactDto {
  @ApiProperty()
  @IsBoolean()
  accept!: boolean;
}
