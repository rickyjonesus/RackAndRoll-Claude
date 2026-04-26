import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: 'matches' })
export class MatchesGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinMatch')
  handleJoinMatch(@ConnectedSocket() client: Socket, @MessageBody() matchId: string) {
    client.join(`match:${matchId}`);
  }

  emitRackAdded(matchId: string, data: unknown) {
    this.server.to(`match:${matchId}`).emit('rackAdded', data);
  }

  emitMatchFinalized(matchId: string, data: unknown) {
    this.server.to(`match:${matchId}`).emit('matchFinalized', data);
  }
}
