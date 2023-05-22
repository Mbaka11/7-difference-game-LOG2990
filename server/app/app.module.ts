import { AlgoController } from '@app/controllers/algo/algo.controller';
import { PodiumController } from '@app/controllers/podium/podium.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { HistoryGateway } from '@app/gateways/history/history.gateway';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { FileService } from '@app/services/file/file.service';
import { PodiumService } from '@app/services/podium/podium.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppRouterController } from './controllers/app-router/app-router.controller';
import { GameCardController } from './controllers/game-card/game-card.controller';
import { MultiplayerGateway } from './gateways/multiplayer/multiplayer.gateway';
import { PodiumGateway } from './gateways/podium/podium.gateway';
import { TimeGameGateway } from './gateways/time-game/time-game.gateway';
import { TimerFactoryGateway } from './gateways/timer-factory/timer-factory.gateway';
import { TimerGateway } from './gateways/timer/timer.gateway';
import { AlgoService } from './services/algo/detection-algo.service';
import { GamesRepository } from './services/database/games.repository';
import { GamesService } from './services/database/games.service';
import { GamesModule } from './services/database/schemas/games.module';
import { GAME_HISTORY_INFO_MODEL, GAME_MODEL, PODIUM_MODEL } from './services/database/schemas/games.schema';
import { TimerFactoryService } from './services/timer-factory/timer-factory.service';
import { WaitingRoomService } from './services/waiting-room/waiting-room.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot('mongodb+srv://Admin:admin@cluster0.q69blbz.mongodb.net/?retryWrites=true&w=majority'),
        MongooseModule.forFeature([
            { name: 'Game', schema: GAME_MODEL },
            { name: 'PodiumInfo', schema: PODIUM_MODEL },
            { name: 'GameHistoryInfo', schema: GAME_HISTORY_INFO_MODEL },
        ]),
    ],
    controllers: [AppRouterController, AlgoController, GameCardController, PodiumController],
    providers: [
        ChatGateway,
        HistoryGateway,
        WaitingRoomGateway,
        TimerGateway,
        Logger,
        AlgoService,
        TimerFactoryService,
        FileService,
        WaitingRoomService,
        MultiplayerGateway,
        TimeGameGateway,
        TimerFactoryGateway,
        GamesService,
        GamesRepository,
        GamesModule,
        PodiumService,
        PodiumGateway,
    ],
})
export class AppModule {}
