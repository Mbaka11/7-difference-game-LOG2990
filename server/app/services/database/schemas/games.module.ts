/* eslint-disable import/namespace */
/* eslint-disable no-restricted-imports */
import { AlgoController } from '@app/controllers/algo/algo.controller';
import { PodiumGateway } from '@app/gateways/podium/podium.gateway';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { FileService } from '@app/services/file/file.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesRepository } from '../games.repository';
import { GamesService } from '../games.service';
import { GAME_HISTORY_INFO_MODEL, GAME_MODEL, Game, GameHistoryInfo, PODIUM_MODEL, PodiumInfo } from './games.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Game.name, schema: GAME_MODEL },
            { name: GameHistoryInfo.name, schema: GAME_HISTORY_INFO_MODEL },
            { name: PodiumInfo.name, schema: PODIUM_MODEL },
        ]),
    ],
    controllers: [AlgoController],
    providers: [
        GamesService,
        GamesRepository,
        { provide: 'GameModel', useValue: GAME_MODEL },
        { provide: 'PodiumInfoModel', useValue: PODIUM_MODEL },
        { provide: 'GameHistoryInfoModel', useValue: GAME_HISTORY_INFO_MODEL },
        AlgoService,
        FileService,
        WaitingRoomGateway,
        WaitingRoomService,
        PodiumGateway,
    ],
    exports: [
        { provide: 'GameModel', useValue: GAME_MODEL },
        { provide: 'GameHistoryInfoModel', useValue: GAME_HISTORY_INFO_MODEL },
        { provide: 'PodiumInfoModel', useValue: PODIUM_MODEL },
    ],
})
export class GamesModule {}
