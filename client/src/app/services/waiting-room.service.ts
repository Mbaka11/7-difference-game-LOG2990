import { Injectable } from '@angular/core';
import { WaitingRoomEvents } from '@app/constants/waiting-room.events';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomService {
    socket: Socket;
    gameRooms: string[] = [];

    constructor(socketClient: SocketClientService) {
        this.socket = socketClient.socket;
        this.getGameRooms();
    }

    onIsGameCreator(roomName: string, callback: (answer: boolean) => void): void {
        this.socket.emit(WaitingRoomEvents.IsGameCreator, roomName);
        this.socket.on(WaitingRoomEvents.IsGameCreator, callback);
    }

    onIsRoomFull(roomName: string, callback: (answer: boolean) => void): void {
        this.socket.emit(WaitingRoomEvents.IsRoomFull, roomName);
        this.socket.on(WaitingRoomEvents.IsRoomFull, callback);
    }

    onOpponentJoinedGame(callback: ({ gameRoomName, opponentUsername }: { gameRoomName: string; opponentUsername: string }) => void) {
        this.socket.on(WaitingRoomEvents.OpponentJoinedGame, callback);
    }

    onOpponentLeftGame(callback: () => void) {
        this.socket.on(WaitingRoomEvents.OpponentLeftGame, callback);
    }

    onResponseOfCreator(callback: ({ creatorAnswer, gameRoomName }: { creatorAnswer: boolean; gameRoomName: string }) => void) {
        this.socket.on(WaitingRoomEvents.ResponseOfCreator, callback);
    }

    onCreatorLeftGame(callback: () => void) {
        this.socket.on(WaitingRoomEvents.CreatorLeftGame, callback);
    }

    onGetCreatorUsername(callback: (creatorUsername: string) => void) {
        this.socket.on(WaitingRoomEvents.GetCreatorUsername, callback);
    }

    onGiveCreatorUsername(callback: () => void) {
        this.socket.on(WaitingRoomEvents.GiveCreatorUsername, callback);
    }

    onDeleteRoom(callback: () => void) {
        this.socket.on(WaitingRoomEvents.DeleteGame, callback);
    }

    getGameRooms(): void {
        this.socket.emit(WaitingRoomEvents.GetGameRooms);
        this.socket.on(WaitingRoomEvents.GetGameRooms, this.callbackGetGameRooms);
    }

    joinGameRoom(roomName: string): void {
        this.socket.emit(WaitingRoomEvents.JoinGameRoom, roomName);
    }

    isRoomCreated(roomName: string): boolean {
        return this.gameRooms.includes(roomName);
    }

    responseOfCreator(creatorAnswer: boolean, roomName: string): void {
        this.socket.emit(WaitingRoomEvents.ResponseOfCreator, { creatorAnswer, roomName });
    }

    creatorLeftGame(roomName: string) {
        this.socket.emit(WaitingRoomEvents.CreatorLeftGame, roomName);
    }

    opponentLeftGame(roomName: string) {
        this.socket.emit(WaitingRoomEvents.OpponentLeftGame, roomName);
    }

    opponentJoinedGame(roomName: string, username: string) {
        this.socket.emit(WaitingRoomEvents.OpponentJoinedGame, { roomName, username });
    }

    leaveGameRoom(roomName: string) {
        this.socket.emit(WaitingRoomEvents.LeaveGameRoom, roomName);
    }

    leaveQueueRoom(roomName: string) {
        this.socket.emit(WaitingRoomEvents.LeaveQueueRoom, roomName);
    }

    giveCreatorUsername(roomName: string, creatorUsername: string) {
        this.socket.emit(WaitingRoomEvents.CreatorUsername, { roomName, creatorUsername });
    }

    callbackGetGameRooms = (gameRooms: string[]): void => {
        this.gameRooms = gameRooms;
    };

    removeWaitingRoomListeners(): void {
        for (const event of Object.values(WaitingRoomEvents)) {
            if (event !== WaitingRoomEvents.GetGameRooms) this.socket.removeListener(event);
        }
    }
}
