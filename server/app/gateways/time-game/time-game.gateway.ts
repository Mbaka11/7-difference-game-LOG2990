import { Game, TimeGame, TimeGameSetting } from '@app/Common/time-game-interface';
import { FileService } from '@app/services/file/file.service';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, maxHttpBufferSize: 10485760 })
@Injectable()
export class TimeGameGateway {
    @WebSocketServer() server: Server;

    constructor(private readonly logger: Logger, public fileService: FileService) {}

    @SubscribeMessage('saveTimeGameSetting')
    setSetting(socket: Socket, settings: TimeGameSetting) {
        this.fileService.saveTimeGameSetting('./assets/settings.json', settings);
    }

    @SubscribeMessage('getTimeGameSetting')
    async getSetting(socket: Socket, roomName: string) {
        if (socket.rooms.has(roomName)) {
            const timeGameInfo: TimeGame = await this.fileService.getTimeGame('./assets/settings.json');
            const settings: TimeGameSetting = timeGameInfo.settings;
            const games: Game[] = timeGameInfo.timeGames;
            this.server.to(roomName).emit('getTimeGameSetting', { data: settings });
            for (const game of games) {
                this.server.to(roomName).emit('getTimeGame', { data: game });
            }
        }
    }
}
