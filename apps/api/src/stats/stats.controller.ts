import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatsService } from './stats.service';
import { GameType } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('summary')
  getSummary(
    @Request() req: { user: { id: string } },
    @Query('gameType') gameType?: GameType,
    @Query('since') since?: string,
  ) {
    return this.stats.getSummary(req.user.id, gameType, since ? new Date(since) : undefined);
  }

  @Get('h2h/:opponentId')
  getH2H(@Request() req: { user: { id: string } }, @Param('opponentId') opponentId: string) {
    return this.stats.getHeadToHead(req.user.id, opponentId);
  }

  @Get('rating-history')
  getRatingHistory(@Request() req: { user: { id: string } }) {
    return this.stats.getRatingHistory(req.user.id);
  }
}
