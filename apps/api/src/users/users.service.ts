import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  search(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, displayName: true, avatarUrl: true, rating: true },
      take: 20,
    });
  }

  updateProfile(id: string, data: { avatarUrl?: string; homeVenue?: string; preferredGames?: string[] }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  sendContactRequest(requesterId: string, recipientId: string) {
    return this.prisma.contactRequest.create({
      data: { requesterId, recipientId },
    });
  }

  respondToContactRequest(id: string, accept: boolean) {
    return this.prisma.contactRequest.update({
      where: { id },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
    });
  }

  getContacts(userId: string) {
    return this.prisma.contactRequest.findMany({
      where: {
        OR: [{ requesterId: userId }, { recipientId: userId }],
        status: 'ACCEPTED',
      },
      include: {
        requester: { select: { id: true, displayName: true, avatarUrl: true, rating: true } },
        recipient: { select: { id: true, displayName: true, avatarUrl: true, rating: true } },
      },
    });
  }
}
