import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RespondContactDto, UpdateProfileDto } from './dto/users.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({ description: 'Current user' })
  getMe(@Request() req: { user: { id: string } }) {
    return this.users.findById(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  updateMe(@Request() req: { user: { id: string } }, @Body() body: UpdateProfileDto) {
    return this.users.updateProfile(req.user.id, body);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search players by display name or email' })
  @ApiQuery({ name: 'q', description: 'Search query (min 2 chars)' })
  @ApiOkResponse({ description: 'Array of matching players' })
  search(@Query('q') q: string) {
    return this.users.search(q);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Get accepted contacts for the current user' })
  @ApiOkResponse({ description: 'Array of contacts' })
  getContacts(@Request() req: { user: { id: string } }) {
    return this.users.getContacts(req.user.id);
  }

  @Post('contacts/:recipientId')
  @ApiOperation({ summary: 'Send a contact request to another player' })
  @ApiParam({ name: 'recipientId', description: 'Target user ID' })
  sendRequest(@Request() req: { user: { id: string } }, @Param('recipientId') recipientId: string) {
    return this.users.sendContactRequest(req.user.id, recipientId);
  }

  @Patch('contacts/:requestId')
  @ApiOperation({ summary: 'Accept or decline a contact request' })
  @ApiParam({ name: 'requestId', description: 'Contact request ID' })
  @ApiBody({ type: RespondContactDto })
  respondToRequest(@Param('requestId') id: string, @Body() body: RespondContactDto) {
    return this.users.respondToContactRequest(id, body.accept);
  }
}
