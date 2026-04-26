import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaguesService } from './leagues.service';
import { GameType } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('leagues')
export class LeaguesController {
  constructor(private leagues: LeaguesService) {}

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { name: string; gameType: GameType; startDate: string; endDate: string },
  ) {
    return this.leagues.createLeague(req.user.id, body.name, body.gameType, new Date(body.startDate), new Date(body.endDate));
  }

  @Post(':id/members/:userId')
  invite(@Param('id') leagueId: string, @Param('userId') userId: string) {
    return this.leagues.inviteMember(leagueId, userId);
  }

  @Post(':id/schedule')
  generateSchedule(@Param('id') leagueId: string) {
    return this.leagues.generateSchedule(leagueId);
  }

  @Get(':id/standings')
  getStandings(@Param('id') leagueId: string) {
    return this.leagues.getStandings(leagueId);
  }

  @Patch('matches/:matchId/result')
  recordResult(@Param('matchId') id: string, @Body() body: { winnerId: string }) {
    return this.leagues.recordLeagueMatchResult(id, body.winnerId);
  }
}
