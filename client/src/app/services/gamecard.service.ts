import { Injectable } from '@angular/core';
import { GameInformation } from '@common/game-information';
import { Subject } from 'rxjs';

import { Socket } from 'socket.io-client';
import { CommunicationService } from './communication.service';

import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class GamecardService {
    gameName = new Subject<string>();
    cardDeleted = new Subject<string>();

    allGames: GameInformation[] = [];
    gameURLs: string[] = [];
    socket: Socket;

    constructor(socketClient: SocketClientService, private comService: CommunicationService) {
        this.socket = socketClient.socket;
        this.socket.on('deleteCard', (data) => {
            this.cardDeleted.next(data);
        });
    }

    resetAllPodiums(): void {
        this.comService.resetAllPodiums();
    }

    deleteAllGames(): void {
        this.comService.deleteAllGames();
    }
}
