import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  getMe(@Request() req: { user: { id: string } }) {
    return this.users.findById(req.user.id);
  }

  @Patch('me')
  updateMe(@Request() req: { user: { id: string } }, @Body() body: { avatarUrl?: string; homeVenue?: string }) {
    return this.users.updateProfile(req.user.id, body);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.users.search(q);
  }

  @Get('contacts')
  getContacts(@Request() req: { user: { id: string } }) {
    return this.users.getContacts(req.user.id);
  }

  @Post('contacts/:recipientId')
  sendRequest(@Request() req: { user: { id: string } }, @Param('recipientId') recipientId: string) {
    return this.users.sendContactRequest(req.user.id, recipientId);
  }

  @Patch('contacts/:requestId')
  respondToRequest(@Param('requestId') id: string, @Body() body: { accept: boolean }) {
    return this.users.respondToContactRequest(id, body.accept);
  }
}
