import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Inject } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WaitingRoomEvents } from './waiting-room.gateway.events';

@WebSocketGateway()
export class WaitingRoomGateway {
    @WebSocketServer() private server: Server;

    constructor(@Inject(WaitingRoomService) private waitingRoomService: WaitingRoomService) {}

    @SubscribeMessage(WaitingRoomEvents.IsGameCreator)
    isGameCreator(socket: Socket, roomName: string): void {
        socket.emit(WaitingRoomEvents.IsGameCreator, this.waitingRoomService.isGameCreator(this.server, roomName));
    }

    @SubscribeMessage(WaitingRoomEvents.IsRoomFull)
    isRoomFull(socket: Socket, roomName: string): void {
        const room = this.server.of('/').adapter.rooms.get(roomName);
        socket.emit(WaitingRoomEvents.IsRoomFull, this.waitingRoomService.isRoomFull(room));
    }

    @SubscribeMessage(WaitingRoomEvents.JoinGameRoom)
    joinGameRoom(socket: Socket, roomName: string): void {
        socket.join(roomName);

        this.waitingRoomService.broadcastAllGameRooms(this.server);
    }

    @SubscribeMessage(WaitingRoomEvents.LeaveGameRoom)
    leaveGameRoom(socket: Socket, roomName: string): void {
        socket.leave(roomName);

        this.waitingRoomService.updateQueueRoom(this.server, roomName);

        this.waitingRoomService.broadcastAllGameRooms(this.server);
    }

    @SubscribeMessage(WaitingRoomEvents.LeaveQueueRoom)
    leaveQueueRoom(socket: Socket, roomName: string): void {
        socket.leave(roomName);

        this.waitingRoomService.broadcastAllGameRooms(this.server);
    }

    @SubscribeMessage(WaitingRoomEvents.CreatorLeftGame)
    creatorLeftGame(socket: Socket, roomName: string): void {
        socket.leave(roomName);

        socket.to(roomName).emit(WaitingRoomEvents.CreatorLeftGame);

        this.waitingRoomService.updateQueueRoom(this.server, roomName);

        this.waitingRoomService.broadcastAllGameRooms(this.server);
    }

    @SubscribeMessage(WaitingRoomEvents.OpponentLeftGame)
    opponentLeftGame(socket: Socket, roomName: string): void {
        socket.leave(roomName);

        this.waitingRoomService.broadcastAllGameRooms(this.server);

        this.waitingRoomService.updateQueueRoom(this.server, roomName);

        socket.to(roomName).emit(WaitingRoomEvents.OpponentLeftGame);
    }

    @SubscribeMessage(WaitingRoomEvents.GetGameRooms)
    getGameRooms(socket: Socket): void {
        const allRooms = this.server.of('/').adapter.rooms;
        socket.emit(WaitingRoomEvents.GetGameRooms, this.waitingRoomService.getAllGameRooms(allRooms));
    }

    @SubscribeMessage(WaitingRoomEvents.OpponentJoinedGame)
    opponentJoinedGame(socket: Socket, { roomName, username }: { roomName: string; username: string }): void {
        const gameRoomName = this.waitingRoomService.getRoomNameTime(socket.id, Number(''));
        const opponentUsername = username as string;
        socket.to(roomName).emit(WaitingRoomEvents.OpponentJoinedGame, { gameRoomName, opponentUsername });
        socket.to(roomName).emit(WaitingRoomEvents.GiveCreatorUsername);
    }

    @SubscribeMessage(WaitingRoomEvents.ResponseOfCreator)
    responseOfCreator(socket: Socket, { creatorAnswer, roomName }: { creatorAnswer: boolean; roomName: string }): void {
        if (creatorAnswer) {
            const gameId = this.waitingRoomService.getGameIdFromRoomName(roomName);

            const gameRoomName = this.waitingRoomService.getRoomName(socket.id, Number(gameId));

            this.server.to(roomName).emit(WaitingRoomEvents.ResponseOfCreator, { creatorAnswer, gameRoomName });

            socket.leave(roomName);

            this.waitingRoomService.updateQueueRoom(this.server, roomName);
        } else socket.to(roomName).emit(WaitingRoomEvents.ResponseOfCreator, { creatorAnswer, roomName: '' });

        this.waitingRoomService.broadcastAllGameRooms(this.server);
    }

    @SubscribeMessage(WaitingRoomEvents.CreatorUsername)
    creatorUsername(socket: Socket, { roomName, creatorUsername }: { roomName: string; creatorUsername: string }): void {
        socket.to(roomName).emit(WaitingRoomEvents.GetCreatorUsername, creatorUsername);
    }

    disconnectAll(gameId: number) {
        const allGameRooms: string[] = this.waitingRoomService.getAllGameRooms(this.server.of('/').adapter.rooms);
        allGameRooms.forEach((room) => {
            if (
                Number(this.waitingRoomService.getGameIdFromRoomName(room)) === gameId &&
                this.waitingRoomService.getGameTypeFromRoomName(room) !== 'multiplayer'
            ) {
                this.server.to(room).emit(WaitingRoomEvents.DeleteGame);
                this.server.in(room).socketsLeave(room);
            }
        });
        this.server.emit('deleteCard');
    }

    handleDisconnect() {
        this.waitingRoomService.broadcastAllGameRooms(this.server);
    }
}
