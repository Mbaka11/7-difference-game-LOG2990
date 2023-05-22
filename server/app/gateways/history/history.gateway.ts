import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { HistoryEvents } from './history.events';

import { GamesRepository } from '@app/services/database/games.repository';
import { GameInfoHistory } from '@common/game-information';

@WebSocketGateway({ cors: true })
@Injectable()
export class HistoryGateway {
    @WebSocketServer() private server: Server;
    constructor(private gamesRepository: GamesRepository) {}

    @SubscribeMessage('getHistory')
    async getHistory() {
        const allGameHistories = await this.gamesRepository.findGameHistory();

        this.server.emit(HistoryEvents.GetHistory, allGameHistories);
    }

    @SubscribeMessage(HistoryEvents.AddGameToHistory)
    addGameToHistory(socket: Socket, gameInfo: GameInfoHistory) {
        const gameHistoryInfo = {
            duration: gameInfo.duration,
            date: gameInfo.date,
            gameMode: gameInfo.gameMode,
            players: gameInfo.players,
            winner: gameInfo.winner,
            surrender: gameInfo.surrender,
        };

        this.gamesRepository.createGameHistory(gameHistoryInfo);
    }

    @SubscribeMessage(HistoryEvents.DeleteAllHistory)
    deleteHistory() {
        this.gamesRepository.deleteAllHistory();
    }
}
