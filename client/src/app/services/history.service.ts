import { Injectable } from '@angular/core';
import { GameInfoHistory } from '@app/interfaces/game-info-history';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    socket: Socket;

    constructor(socketClient: SocketClientService) {
        this.socket = socketClient.socket;
    }

    async getHistory(): Promise<GameInfoHistory[]> {
        return new Promise((resolve) => {
            this.socket.emit('getHistory');

            this.socket.on('getHistory', (gameHistories: GameInfoHistory[]) => {
                resolve(gameHistories);
            });
        });
    }

    addGameToHistory(duration: string, gameMode: string, players: string[], winner?: string | undefined, surrender?: string | undefined): void {
        const now = new Date();

        const date = now.toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        const gameInfo = {
            duration,
            date,
            gameMode,
            players,
            winner,
            surrender,
        };

        this.socket.emit('addGameToHistory', gameInfo);
    }

    clearHistory(): void {
        this.socket.emit('deleteAllHistory');
    }

    async isEmpty(): Promise<boolean> {
        const history = await this.getHistory();
        return history.length === 0;
    }
}
