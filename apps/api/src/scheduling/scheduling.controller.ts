import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SchedulingService } from './scheduling.service';
import { CreateChallengeDto, CreateSeriesDto, RespondChallengeDto, RescheduleDto } from './dto/scheduling.dto';

@ApiTags('scheduling')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('scheduling')
export class SchedulingController {
  constructor(private scheduling: SchedulingService) {}

  @Post('challenges')
  @ApiOperation({ summary: 'Challenge another player to a match' })
  @ApiBody({ type: CreateChallengeDto })
  @ApiCreatedResponse({ description: 'Challenge created with PENDING status' })
  create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateChallengeDto,
  ) {
    return this.scheduling.createChallenge(req.user.id, body.challengedId, body.gameType, new Date(body.proposedAt), body.venueId);
  }

  @Patch('challenges/:id/respond')
  @ApiOperation({ summary: 'Accept or decline a challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiBody({ type: RespondChallengeDto })
  @ApiOkResponse({ description: 'Challenge updated' })
  respond(@Param('id') id: string, @Request() req: { user: { id: string } }, @Body() body: RespondChallengeDto) {
    return this.scheduling.respondToChallenge(id, req.user.id, body.accept);
  }

  @Patch('challenges/:id/reschedule')
  @ApiOperation({ summary: 'Propose a new time for a challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiBody({ type: RescheduleDto })
  @ApiOkResponse({ description: 'Challenge rescheduled' })
  reschedule(@Param('id') id: string, @Request() req: { user: { id: string } }, @Body() body: RescheduleDto) {
    return this.scheduling.reschedule(id, req.user.id, new Date(body.proposedAt));
  }

  @Patch('challenges/:id/cancel')
  @ApiOperation({ summary: 'Cancel a pending challenge' })
  @ApiParam({ name: 'id', description: 'Challenge ID' })
  @ApiOkResponse({ description: 'Challenge cancelled' })
  cancel(@Param('id') id: string) {
    return this.scheduling.cancel(id);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming challenges for the current user' })
  @ApiOkResponse({ description: 'Array of upcoming challenges' })
  getUpcoming(@Request() req: { user: { id: string } }) {
    return this.scheduling.getUpcoming(req.user.id);
  }

  @Post('series')
  @ApiOperation({ summary: 'Create a recurring match series' })
  @ApiBody({ type: CreateSeriesDto })
  @ApiCreatedResponse({ description: 'Recurring series created' })
  createSeries(
    @Request() req: { user: { id: string } },
    @Body() body: CreateSeriesDto,
  ) {
    return this.scheduling.createRecurringSeries(req.user.id, body.challengedId, body.gameType, new Date(body.startDate), body.cadence, body.venueId);
  }

  @Patch('series/:id/end')
  @ApiOperation({ summary: 'End a recurring series' })
  @ApiParam({ name: 'id', description: 'Series ID' })
  @ApiOkResponse({ description: 'Series ended' })
  endSeries(@Param('id') id: string) {
    return this.scheduling.endSeries(id);
  }
}
