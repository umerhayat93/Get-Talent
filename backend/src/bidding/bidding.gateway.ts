import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/bidding' })
export class BiddingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private rooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.rooms.forEach((clients, room) => {
      clients.delete(client.id);
      this.server.to(room).emit('participantCount', clients.size);
    });
  }

  @SubscribeMessage('joinSession')
  joinSession(@MessageBody() data: { sessionId: string }, @ConnectedSocket() client: Socket) {
    const room = `session:${data.sessionId}`;
    client.join(room);
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room).add(client.id);
    this.server.to(room).emit('participantCount', this.rooms.get(room).size);
    client.emit('joined', { sessionId: data.sessionId });
  }

  @SubscribeMessage('leaveSession')
  leaveSession(@MessageBody() data: { sessionId: string }, @ConnectedSocket() client: Socket) {
    const room = `session:${data.sessionId}`;
    client.leave(room);
    this.rooms.get(room)?.delete(client.id);
    this.server.to(room).emit('participantCount', this.rooms.get(room)?.size || 0);
  }

  emitNewBid(sessionId: string, bid: any) {
    this.server.to(`session:${sessionId}`).emit('newBid', bid);
  }

  emitSessionEnded(sessionId: string, result: any) {
    this.server.to(`session:${sessionId}`).emit('sessionEnded', result);
  }

  emitTimerUpdate(sessionId: string, secondsLeft: number) {
    this.server.to(`session:${sessionId}`).emit('timerUpdate', { secondsLeft });
  }

  emitSessionStarted(sessionId: string, session: any) {
    this.server.emit('sessionStarted', session);
  }
}
