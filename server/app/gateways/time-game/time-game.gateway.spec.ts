/* eslint-disable */
import { Game, TimeGameSetting } from '@app/Common/time-game-interface';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { GamesService } from '@app/services/database/games.service';
import { FileService } from '@app/services/file/file.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { TimeGameGateway } from './time-game.gateway';

describe('TimeGameGateway', () => {
    let gateway: TimeGameGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let fileService: SinonStubbedInstance<FileService>;
    let algoService: SinonStubbedInstance<AlgoService>;
    let gamesService: SinonStubbedInstance<GamesService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        fileService = createStubInstance<FileService>(FileService);
        algoService = createStubInstance<AlgoService>(AlgoService);
        gamesService = createStubInstance<GamesService>(GamesService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimeGameGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: FileService,
                    useValue: fileService,
                },
                {
                    provide: AlgoService,
                    useValue: algoService,
                },
                {
                    provide: GamesService,
                    useValue: gamesService,
                },
            ],
        }).compile();

        gateway = module.get<TimeGameGateway>(TimeGameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('setSeting should call saveTimeGameSetting', () => {
        server.to.reset();
        const roomName = 'testRoom';
        const settings: TimeGameSetting = {
            startTime: 0,
            bonusTime: 0,
            penaltyTime: 0,
        };
        const socketMock = {
            emit: () => {},
            rooms: new Set([roomName]),
            broadcast: {
                to: () => {
                    return {
                        emit: () => {},
                    };
                },
            },
        } as unknown as Socket;
        const saveSpy = jest.spyOn(gateway.fileService, 'saveTimeGameSetting').mockImplementation(async () => {});

        gateway.setSetting(socketMock, settings);

        //expect(server.to.calledWith(roomName)).toBeFalsy();
        expect(saveSpy).toHaveBeenCalledWith('./assets/settings.json', settings);
    });

    it('victoryDeclaration() should send message to other sockets in the room', async () => {
        server.to.reset();
        const settings: TimeGameSetting = { startTime: 0, penaltyTime: 0, bonusTime: 0 };
        const game: Game[] = [
            {
                gameDifferences: [[{ row: 1, col: 2 }]],
                gameOriginal: 'test',
                gameModified: 'test',
                gameInformation: { gameId: 1, gameName: 'testName', gameDifficulty: 'testDiff', numberOfDiff: 5 },
            },
        ];
        const roomName = 'testRoom';
        const socketMock = {
            emit: jest.fn(),
            rooms: new Set([roomName]),
        } as unknown as Socket;
        const emitSpy = jest.spyOn(server, 'to').mockReturnValue({
            emit: jest.fn(),
        } as unknown as BroadcastOperator<unknown, unknown>);
        const getTimeGameSpy = jest.spyOn(gateway.fileService, 'getTimeGame').mockImplementation(async () => {
            return {
                settings: settings,
                timeGames: game,
            };
        });

        await gateway.getSetting(socketMock, roomName);
        expect(getTimeGameSpy).toHaveBeenCalledWith('./assets/settings.json');
        expect(emitSpy).toHaveBeenCalledWith(roomName);
        expect(emitSpy.mock.results[0].value.emit).toHaveBeenCalledWith('getTimeGameSetting', { data: settings });
        expect(emitSpy.mock.results[1].value.emit).toHaveBeenCalledWith('getTimeGame', { data: game[0] });
    });
});
