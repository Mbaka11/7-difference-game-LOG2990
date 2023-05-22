import { TimerFactoryService } from '@app/services/timer-factory/timer-factory.service';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PRIVATE_ROOM_ID, WORD_MIN_LENGTH } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private timerFactoryService: TimerFactoryService) {}

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, word: string) {
        socket.emit(ChatEvents.WordValidated, word.length > WORD_MIN_LENGTH);
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket, gameId: string) {
        socket.join(gameId);
        this.timerFactoryService.generateTimer(gameId, this.server.of('/').adapter.rooms.get(gameId));
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, { roomName, message, senderType }: { roomName: string; message: string; senderType: string }) {
        if (socket.rooms.has(roomName)) {
            this.server.to(roomName).emit(ChatEvents.RoomMessage, { senderType, message });
        }
    }

    broadcastAllNewPodiumPlayer(username: string, gameName: string, podiumPlace: number): void {
        this.server.emit(ChatEvents.MassMessage, `Félicitations à ${username} d'avoir atteint la place ${podiumPlace} dans le jeu ${gameName} !`);
    }
}
