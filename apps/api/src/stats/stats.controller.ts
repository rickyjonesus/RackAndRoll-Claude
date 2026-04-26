import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';
import { GameType } from '@prisma/client';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get win/loss summary for the current user' })
  @ApiQuery({ name: 'gameType', enum: GameType, required: false })
  @ApiQuery({ name: 'since', required: false, description: 'ISO 8601 date to filter from' })
  @ApiOkResponse({ description: 'Summary stats including win%, streak, and ELO' })
  getSummary(
    @Request() req: { user: { id: string } },
    @Query('gameType') gameType?: GameType,
    @Query('since') since?: string,
  ) {
    return this.stats.getSummary(req.user.id, gameType, since ? new Date(since) : undefined);
  }

  @Get('h2h/:opponentId')
  @ApiOperation({ summary: 'Get head-to-head record against a specific opponent' })
  @ApiParam({ name: 'opponentId', description: 'Opponent user ID' })
  @ApiOkResponse({ description: 'Head-to-head breakdown' })
  getH2H(@Request() req: { user: { id: string } }, @Param('opponentId') opponentId: string) {
    return this.stats.getHeadToHead(req.user.id, opponentId);
  }

  @Get('rating-history')
  @ApiOperation({ summary: 'Get ELO rating history for the current user' })
  @ApiOkResponse({ description: 'Array of rating snapshots over time' })
  getRatingHistory(@Request() req: { user: { id: string } }) {
    return this.stats.getRatingHistory(req.user.id);
  }
}
