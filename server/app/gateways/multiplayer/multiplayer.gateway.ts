import { Coordinate } from '@app/Common/coordinate';
import { TimerFactoryService } from '@app/services/timer-factory/timer-factory.service';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MultiplayerEvents } from './multiplayer.events';

@WebSocketGateway({ cors: true })
@Injectable()
export class MultiplayerGateway {
    @WebSocketServer() server: Server;

    constructor(private readonly logger: Logger, private readonly timerFactoryService: TimerFactoryService) {}

    @SubscribeMessage(MultiplayerEvents.FoundDifference)
    removeDifference(socket: Socket, { roomName, data }: { roomName: string; data: Coordinate[] }) {
        if (socket.rooms.has(roomName)) {
            const broadcastOperator = socket.broadcast.to(roomName);
            broadcastOperator.emit(MultiplayerEvents.FoundDifference, { data });
        }
    }

    @SubscribeMessage(MultiplayerEvents.Surender)
    surender(socket: Socket, { roomName }: { roomName: string }) {
        if (socket.rooms.has(roomName)) {
            const broadcastOperator = socket.broadcast.to(roomName);
            broadcastOperator.emit(MultiplayerEvents.Surender, { roomName });
        }
    }

    @SubscribeMessage('victory')
    victoryDeclaration(socket: Socket, { roomName }: { roomName: string }) {
        if (socket.rooms.has(roomName)) {
            const broadcastOperator = socket.broadcast.to(roomName);
            broadcastOperator.emit('victory', { roomName });
        }
    }

    @SubscribeMessage(MultiplayerEvents.RemoveHint)
    removeHint(socket: Socket, roomName: string) {
        if (socket.rooms.has(roomName)) {
            this.server.to(roomName).emit(MultiplayerEvents.RemoveHint, {});
        }
    }

    @SubscribeMessage('unsubscribe')
    removeSocket(socket: Socket, roomName: string) {
        if (socket.rooms.has(roomName)) {
            socket.leave(roomName);
            this.timerFactoryService.deleteTimer(roomName, this.server.of('/').adapter.rooms.get(roomName));
        }
    }
}
