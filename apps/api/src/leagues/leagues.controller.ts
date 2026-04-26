import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LeaguesService } from './leagues.service';
import { CreateLeagueDto, RecordLeagueResultDto } from './dto/leagues.dto';

@ApiTags('leagues')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leagues')
export class LeaguesController {
  constructor(private leagues: LeaguesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new league' })
  @ApiBody({ type: CreateLeagueDto })
  @ApiCreatedResponse({ description: 'League created' })
  create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateLeagueDto,
  ) {
    return this.leagues.createLeague(req.user.id, body.name, body.gameType, new Date(body.startDate), new Date(body.endDate));
  }

  @Post(':id/members/:userId')
  @ApiOperation({ summary: 'Invite a player to a league' })
  @ApiParam({ name: 'id', description: 'League ID' })
  @ApiParam({ name: 'userId', description: 'User ID to invite' })
  @ApiCreatedResponse({ description: 'Member added' })
  invite(@Param('id') leagueId: string, @Param('userId') userId: string) {
    return this.leagues.inviteMember(leagueId, userId);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Generate a round-robin schedule for a league' })
  @ApiParam({ name: 'id', description: 'League ID' })
  @ApiCreatedResponse({ description: 'Schedule generated' })
  generateSchedule(@Param('id') leagueId: string) {
    return this.leagues.generateSchedule(leagueId);
  }

  @Get(':id/standings')
  @ApiOperation({ summary: 'Get current standings for a league' })
  @ApiParam({ name: 'id', description: 'League ID' })
  @ApiOkResponse({ description: 'Ordered standings array' })
  getStandings(@Param('id') leagueId: string) {
    return this.leagues.getStandings(leagueId);
  }

  @Patch('matches/:matchId/result')
  @ApiOperation({ summary: 'Record the result of a league match' })
  @ApiParam({ name: 'matchId', description: 'League match ID' })
  @ApiBody({ type: RecordLeagueResultDto })
  @ApiOkResponse({ description: 'Result recorded and standings updated' })
  recordResult(@Param('matchId') id: string, @Body() body: RecordLeagueResultDto) {
    return this.leagues.recordLeagueMatchResult(id, body.winnerId);
  }
}
