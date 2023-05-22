import { GamesRepository } from '@app/services/database/games.repository';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { HistoryGateway } from './history.gateway';

const ROOMS_TEST: Map<string, Set<string>> = new Map();
const ROOM_1 = new Set(['socket1', 'socket2']);
ROOMS_TEST.set('1', ROOM_1);

describe('HistoryGateway', () => {
    let gateway: HistoryGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gamesRepository: SinonStubbedInstance<GamesRepository>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gamesRepository = createStubInstance(GamesRepository);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: GamesRepository,
                    useValue: gamesRepository,
                },
            ],
        }).compile();

        gateway = module.get<HistoryGateway>(HistoryGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('deleteHistory() should delete all games in the database', () => {
        gateway.deleteHistory();
        expect(gamesRepository.deleteAllHistory.calledOnce).toBeTruthy();
    });

    it('getHistory() should return all games in the database', () => {
        gateway.getHistory();
        expect(gamesRepository.findGameHistory.calledOnce).toBeTruthy();
    });

    // TODO changer appel
    it('addGameToHistory() should add a game to the database', () => {
        let gameInfo = {
            duration: '1',
            date: '1',
            gameMode: '1',
            players: ['1'],
        };

        gateway.addGameToHistory(socket, gameInfo);
        expect(gamesRepository.createGameHistory.calledOnce).toBeTruthy();
    });
});
