import { Controller, Post, Patch, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiParam, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MatchesService } from './matches.service';
import { GameType } from '@prisma/client';
import { AddRackDto, CreateMatchDto } from './dto/matches.dto';

@ApiTags('matches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchesController {
  constructor(private matches: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new match (vs registered player or guest)' })
  @ApiBody({ type: CreateMatchDto })
  @ApiCreatedResponse({ description: 'Match created and set to IN_PROGRESS' })
  create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateMatchDto,
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
  @ApiOperation({ summary: 'Get completed match history for the current user' })
  @ApiOkResponse({ description: 'Array of completed matches' })
  history(@Request() req: { user: { id: string } }) {
    return this.matches.getMatchHistory(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single match by ID' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiOkResponse({ description: 'Match with players and racks' })
  getMatch(@Param('id') id: string) {
    return this.matches.getMatch(id);
  }

  @Post(':id/racks')
  @ApiOperation({ summary: 'Record a rack winner during a live match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiBody({ type: AddRackDto })
  @ApiCreatedResponse({ description: 'Rack recorded' })
  addRack(@Param('id') matchId: string, @Body() body: AddRackDto) {
    return this.matches.addRack(matchId, body.winnerId, body.rackNum);
  }

  @Patch(':id/racks/undo')
  @ApiOperation({ summary: 'Undo the last rack recorded in a match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiOkResponse({ description: 'Deleted rack returned' })
  undoRack(@Param('id') matchId: string) {
    return this.matches.undoLastRack(matchId);
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalize match, compute winner and update ELO' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  @ApiOkResponse({ description: 'Finalized match' })
  finalize(@Param('id') matchId: string) {
    return this.matches.finalizeMatch(matchId);
  }

  @Patch(':id/dispute')
  @ApiOperation({ summary: 'Flag a match as disputed' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  dispute(@Param('id') matchId: string, @Request() req: { user: { id: string } }) {
    return this.matches.disputeMatch(matchId, req.user.id);
  }
}
