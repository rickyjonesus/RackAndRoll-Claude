import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchesService } from './matches.service';
import { GameType } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private matches: MatchesService) {}

  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { opponentId?: string; guestName?: string; gameType: GameType; raceToRacks?: number; venueId?: string },
  ) {
    if (!body.opponentId && !body.guestName) {
      throw new BadRequestException('Provide either opponentId or guestName');
    }
    return this.matches.createMatch(req.user.id, body.gameType, {
      opponentId: body.opponentId,
      guestName: body.guestName,
      raceToRacks: body.raceToRacks,
      venueId: body.venueId,
    });
  }

  @Get('history')
  history(@Request() req: { user: { id: string } }) {
    return this.matches.getMatchHistory(req.user.id);
  }

  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.matches.getMatch(id);
  }

  @Post(':id/racks')
  addRack(@Param('id') matchId: string, @Body() body: { winnerId: string; rackNum: number }) {
    return this.matches.addRack(matchId, body.winnerId, body.rackNum);
  }

  @Patch(':id/racks/undo')
  undoRack(@Param('id') matchId: string) {
    return this.matches.undoLastRack(matchId);
  }

  @Patch(':id/finalize')
  finalize(@Param('id') matchId: string) {
    return this.matches.finalizeMatch(matchId);
  }

  @Patch(':id/dispute')
  dispute(@Param('id') matchId: string, @Request() req: { user: { id: string } }) {
    return this.matches.disputeMatch(matchId, req.user.id);
  }
}
