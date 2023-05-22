import { Injectable } from '@angular/core';
import { MultiplayerEvents } from '@app/common/multiplayer.events';
import { Coordinate } from '@common/coordinate';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class MultiplayerService {
    foundDifference = new Subject<Coordinate[]>();
    usernameAdversary = new Subject<string>();
    surender = new Subject<string>();
    loser = new Subject<string>();
    useHint = new Subject<unknown>();

    socket: Socket;

    constructor(socketClient: SocketClientService) {
        this.socket = socketClient.socket;

        this.socket.on(MultiplayerEvents.FoundDifference, ({ data }) => {
            this.foundDifference.next(data);
        });

        this.socket.on(MultiplayerEvents.RemoveHint, () => {
            this.removeHint();
        });

        this.socket.on(MultiplayerEvents.Surender, ({ surenderRoom }) => {
            this.surender.next(surenderRoom);
        });

        this.socket.on('victory', ({ loserRoom }) => {
            this.loser.next(loserRoom);
        });
    }

    removeHint() {
        this.useHint.next({});
    }

    sendRemoveData(roomName: string, data: Coordinate[]) {
        this.socket.emit(MultiplayerEvents.FoundDifference, { roomName, data });
    }

    sendSurender(roomName: string) {
        this.socket.emit(MultiplayerEvents.Surender, { roomName });
    }

    sendRemoveHint(roomName: string) {
        this.socket.emit(MultiplayerEvents.RemoveHint, roomName);
    }
    sendVictoryDeclaration(roomName: string) {
        this.socket.emit('victory', { roomName });
    }
    leaveRoom(roomName: string) {
        this.socket.emit('unsubscribe', roomName);
    }
}
