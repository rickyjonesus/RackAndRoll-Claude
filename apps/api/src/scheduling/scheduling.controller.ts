import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SchedulingService } from './scheduling.service';
import { GameType, Cadence } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('scheduling')
export class SchedulingController {
  constructor(private scheduling: SchedulingService) {}

  @Post('challenges')
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { challengedId: string; gameType: GameType; proposedAt: string; venueId?: string },
  ) {
    return this.scheduling.createChallenge(req.user.id, body.challengedId, body.gameType, new Date(body.proposedAt), body.venueId);
  }

  @Patch('challenges/:id/respond')
  respond(@Param('id') id: string, @Request() req: { user: { id: string } }, @Body() body: { accept: boolean }) {
    return this.scheduling.respondToChallenge(id, req.user.id, body.accept);
  }

  @Patch('challenges/:id/reschedule')
  reschedule(@Param('id') id: string, @Request() req: { user: { id: string } }, @Body() body: { proposedAt: string }) {
    return this.scheduling.reschedule(id, req.user.id, new Date(body.proposedAt));
  }

  @Patch('challenges/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.scheduling.cancel(id);
  }

  @Get('upcoming')
  getUpcoming(@Request() req: { user: { id: string } }) {
    return this.scheduling.getUpcoming(req.user.id);
  }

  @Post('series')
  createSeries(
    @Request() req: { user: { id: string } },
    @Body() body: { challengedId: string; gameType: GameType; startDate: string; cadence: Cadence; venueId?: string },
  ) {
    return this.scheduling.createRecurringSeries(req.user.id, body.challengedId, body.gameType, new Date(body.startDate), body.cadence, body.venueId);
  }

  @Patch('series/:id/end')
  endSeries(@Param('id') id: string) {
    return this.scheduling.endSeries(id);
  }
}
