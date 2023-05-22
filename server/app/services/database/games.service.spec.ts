/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable max-lines */
import { PodiumGateway } from '@app/gateways/podium/podium.gateway';
import { GameInformation } from '@common/game-information';
import { Podium } from '@common/podium';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { FakeInformation } from './fake-info.service';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';
import { GamesModule } from './schemas/games.module';
import { Game, PodiumInfo } from './schemas/games.schema';

const PODIUM_MOCK: Podium = {
    gameId: 23534,
    solo: {
        first: { time: 10, name: 'Player 1' },
        second: { time: 20, name: 'Player 2' },
        third: { time: 30, name: 'Player 3' },
    },
    multiplayer: {
        first: { time: 10, name: 'Player 4' },
        second: { time: 20, name: 'Player 5' },
        third: { time: 30, name: 'Player 6' },
    },
};

describe('GamesService', () => {
    let gamesService: GamesService;
    let gamesRepository: GamesRepository;
    let fakeInformation: FakeInformation;
    let mongoServer: MongoMemoryServer;
    let mongoUri;
    let podiumGateway: PodiumGateway;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(mongoUri), GamesModule],
            providers: [GamesService, GamesRepository, FakeInformation, PodiumGateway],
        }).compile();

        gamesService = module.get<GamesService>(GamesService);
        gamesRepository = module.get<GamesRepository>(GamesRepository);
        fakeInformation = module.get<FakeInformation>(FakeInformation);
        podiumGateway = module.get<PodiumGateway>(PodiumGateway);

        jest.spyOn(gamesService, 'getPodiumByGameId').mockImplementation(async () => Promise.resolve(PODIUM_MOCK));
        jest.spyOn(podiumGateway, 'broadcastPodium').mockImplementation();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('transformGameType', () => {
        it('should transform a game to game information', () => {
            const game: Game = {
                gameId: 1,
                gameName: 'Game Name',
                gameDifficulty: 'Easy',
                numberOfDiff: 1,
            };
            const expectedGameInformation: GameInformation = {
                gameId: 1,
                gameName: 'Game Name',
                gameDifficulty: 'Easy',
                numberOfDiff: 1,
            };
            const transformedGame = gamesService.transformGameType(game);
            expect(transformedGame).toEqual(expectedGameInformation);
        });
    });

    describe('transformPodiumType', () => {
        it('should transform a podium info to podium', () => {
            const podiumInfo: PodiumInfo = {
                gameId: 1,
                soloFirstTime: 1,
                soloSecondTime: 2,
                soloThirdTime: 3,
                soloFirstName: 'Player 1',
                soloSecondName: 'Player 2',
                soloThirdName: 'Player 3',
                multFirstTime: 4,
                multSecondTime: 5,
                multThirdTime: 6,
                multFirstName: 'Player 4',
                multSecondName: 'Player 5',
                multThirdName: 'Player 6',
            };
            const expectedPodium: Podium = {
                gameId: 1,
                solo: {
                    first: { time: 1, name: 'Player 1' },
                    second: { time: 2, name: 'Player 2' },
                    third: { time: 3, name: 'Player 3' },
                },
                multiplayer: {
                    first: { time: 4, name: 'Player 4' },
                    second: { time: 5, name: 'Player 5' },
                    third: { time: 6, name: 'Player 6' },
                },
            };
            const transformedPodium = gamesService.transformPodiumType(podiumInfo);
            expect(transformedPodium).toEqual(expectedPodium);
        });
    });

    describe('transformPodiumInfo', () => {
        it('should transform a podium to podium info', () => {
            const podium: Podium = {
                gameId: 1,
                solo: {
                    first: { time: 1, name: 'Player 1' },
                    second: { time: 2, name: 'Player 2' },
                    third: { time: 3, name: 'Player 3' },
                },
                multiplayer: {
                    first: { time: 4, name: 'Player 4' },
                    second: { time: 5, name: 'Player 5' },
                    third: { time: 6, name: 'Player 6' },
                },
            };
            const expectedPodiumInfo: PodiumInfo = {
                gameId: 1,
                soloFirstTime: 1,
                soloSecondTime: 2,
                soloThirdTime: 3,
                soloFirstName: 'Player 1',
                soloSecondName: 'Player 2',
                soloThirdName: 'Player 3',
                multFirstTime: 4,
                multSecondTime: 5,
                multThirdTime: 6,
                multFirstName: 'Player 4',
                multSecondName: 'Player 5',
                multThirdName: 'Player 6',
            };
            const transformedPodiumInfo = gamesService.transformPodiumInfo(podium);
            expect(transformedPodiumInfo).toEqual(expectedPodiumInfo);
        });
    });

    describe('getGameByID', () => {
        it('should return game information for the specified game ID', async () => {
            const gameId = 1;
            const expectedGameInformation: GameInformation = {
                gameId: 1,
                gameName: 'Game Name',
                gameDifficulty: 'Easy',
                numberOfDiff: 1,
            };
            jest.spyOn(gamesRepository, 'findOne').mockImplementation(async () => Promise.resolve(expectedGameInformation));
            const gameInformation = await gamesService.getGameByID(gameId);
            expect(gameInformation).toEqual(expectedGameInformation);
        });
    });

    describe('getPodiumByGameId', () => {
        it('should return podium information for the specified game ID', async () => {
            jest.spyOn(gamesService, 'getPodiumByGameId').mockRestore();
            const gameId = 1;
            const expectedPodium: Podium = {
                gameId: 1,
                solo: {
                    first: { time: 1, name: 'Player 1' },
                    second: { time: 2, name: 'Player 2' },
                    third: { time: 3, name: 'Player 3' },
                },
                multiplayer: {
                    first: { time: 4, name: 'Player 4' },
                    second: { time: 5, name: 'Player 5' },
                    third: { time: 6, name: 'Player 6' },
                },
            };
            jest.spyOn(gamesRepository, 'findOnePodium').mockImplementation(async () =>
                Promise.resolve(gamesService.transformPodiumInfo(expectedPodium)),
            );
            const podium = await gamesService.getPodiumByGameId(gameId);
            expect(podium).toEqual(expectedPodium);
        });
    });

    describe('getGames', () => {
        it('should return an array of all game information', async () => {
            const expectedGames: GameInformation[] = [
                {
                    gameId: 1,
                    gameName: 'Game Name 1',
                    gameDifficulty: 'Easy',
                    numberOfDiff: 1,
                },
                {
                    gameId: 2,
                    gameName: 'Game Name 2',
                    gameDifficulty: 'Medium',
                    numberOfDiff: 2,
                },
            ];
            jest.spyOn(gamesRepository, 'find').mockImplementation(async () => Promise.resolve(expectedGames));
            const games = await gamesService.getGames();
            expect(games).toEqual(expectedGames);
        });
    });

    describe('getPodiums', () => {
        it('should return an array of all podiums', async () => {
            const expectedPodiums: PodiumInfo[] = [
                {
                    gameId: 1,
                    soloFirstTime: 1,
                    soloSecondTime: 2,
                    soloThirdTime: 3,
                    soloFirstName: 'Player 1',
                    soloSecondName: 'Player 2',
                    soloThirdName: 'Player 3',
                    multFirstTime: 4,
                    multSecondTime: 5,
                    multThirdTime: 6,
                    multFirstName: 'Player 4',
                    multSecondName: 'Player 5',
                    multThirdName: 'Player 6',
                },
                {
                    gameId: 2,
                    soloFirstTime: 1,
                    soloSecondTime: 2,
                    soloThirdTime: 3,
                    soloFirstName: 'Player 1',
                    soloSecondName: 'Player 2',
                    soloThirdName: 'Player 3',
                    multFirstTime: 4,
                    multSecondTime: 5,
                    multThirdTime: 6,
                    multFirstName: 'Player 4',
                    multSecondName: 'Player 5',
                    multThirdName: 'Player 6',
                },
            ];

            jest.spyOn(gamesRepository, 'findPodium').mockImplementation(async () => Promise.resolve(expectedPodiums));
            const podiums = await gamesService.getPodiums();
            expect(podiums[0]).toEqual(gamesService.transformPodiumType(expectedPodiums[0]));
        });
    });

    describe('createGame', () => {
        it('should create a new game and return the game object', async () => {
            const newGame: GameInformation = {
                gameId: 3,
                gameName: 'Game Name 3',
                gameDifficulty: 'Hard',
                numberOfDiff: 3,
            };
            const expectedGame: Game = {
                gameId: 3,
                gameName: 'Game Name 3',
                gameDifficulty: 'Hard',
                numberOfDiff: 3,
            };
            jest.spyOn(gamesRepository, 'create').mockImplementation(async () => Promise.resolve(expectedGame));
            const game = await gamesService.createGame(newGame);
            expect(game).toEqual(expectedGame);
        });
    });

    describe('createPodium', () => {
        it('should create a new podium and return the podium info', async () => {
            const newPodium: Podium = {
                gameId: 3,
                solo: {
                    first: { time: 1, name: 'Player 1' },
                    second: { time: 2, name: 'Player 2' },
                    third: { time: 3, name: 'Player 3' },
                },
                multiplayer: {
                    first: { time: 4, name: 'Player 4' },
                    second: { time: 5, name: 'Player 5' },
                    third: { time: 6, name: 'Player 6' },
                },
            };
            const expectedPodiumInfo: PodiumInfo = {
                gameId: 3,
                soloFirstTime: 1,
                soloSecondTime: 2,
                soloThirdTime: 3,
                soloFirstName: 'Player 1',
                soloSecondName: 'Player 2',
                soloThirdName: 'Player 3',
                multFirstTime: 4,
                multSecondTime: 5,
                multThirdTime: 6,
                multFirstName: 'Player 4',
                multSecondName: 'Player 5',
                multThirdName: 'Player 6',
            };
            jest.spyOn(gamesRepository, 'createPodium').mockImplementation(async () => Promise.resolve(expectedPodiumInfo));
            const podiumInfo = await gamesService.createPodium(newPodium);
            expect(podiumInfo).toEqual(expectedPodiumInfo);
        });
    });

    describe('updateGame', () => {
        it('should update a game and return the updated game information', async () => {
            const gameId = 1;
            const newGameInfo: GameInformation = {
                gameId: 0,
                gameName: 'New Game Name',
                gameDifficulty: 'Medium',
                numberOfDiff: 2,
            };
            const expectedUpdatedGameInfo: GameInformation = {
                gameId: 1,
                gameName: 'New Game Name',
                gameDifficulty: 'Medium',
                numberOfDiff: 2,
            };
            jest.spyOn(gamesRepository, 'findOneAndUpdate').mockImplementation(async () => Promise.resolve(expectedUpdatedGameInfo));
            const updatedGameInfo = await gamesService.updateGame(gameId, newGameInfo);
            expect(updatedGameInfo).toEqual(expectedUpdatedGameInfo);
        });
    });

    describe('resetPodiumByID', () => {
        it('should update a podium and return nothing', async () => {
            const podiumId = 1;
            const newPodium: Podium = {
                gameId: 1,
                solo: {
                    first: { time: 10, name: 'New Player 1' },
                    second: { time: 11, name: 'New Player 2' },
                    third: { time: 12, name: 'New Player 3' },
                },
                multiplayer: {
                    first: { time: 13, name: 'New Player 4' },
                    second: { time: 14, name: 'New Player 5' },
                    third: { time: 15, name: 'New Player 6' },
                },
            };
            const expectedNewPodiumInfo: PodiumInfo = {
                gameId: 1,
                soloFirstTime: 10,
                soloSecondTime: 11,
                soloThirdTime: 12,
                soloFirstName: 'New Player 1',
                soloSecondName: 'New Player 2',
                soloThirdName: 'New Player 3',
                multFirstTime: 13,
                multSecondTime: 14,
                multThirdTime: 15,
                multFirstName: 'New Player 4',
                multSecondName: 'New Player 5',
                multThirdName: 'New Player 6',
            };
            jest.spyOn(gamesService, 'createFakePodium').mockImplementation(async () => Promise.resolve(newPodium));
            jest.spyOn(gamesRepository, 'findOneAndUpdatePodium').mockImplementation(async () =>
                Promise.resolve(gamesService.transformPodiumInfo(newPodium)),
            );
            await gamesService.resetPodiumById(podiumId);
            expect(gamesRepository.findOneAndUpdatePodium).toHaveBeenCalledWith({ gameId: podiumId }, expectedNewPodiumInfo);
        });
    });

    describe('updateAllPodiums', () => {
        it('should update all podiums, return nothing and broadcast a podium', async () => {
            const allIds: string[] = ['1', '2'];
            const expectedNewPodiums: PodiumInfo[] = [
                {
                    gameId: 1,
                    soloFirstTime: 10,
                    soloSecondTime: 11,
                    soloThirdTime: 12,
                    soloFirstName: '1',
                    soloSecondName: '2',
                    soloThirdName: '3',
                    multFirstTime: 13,
                    multSecondTime: 14,
                    multThirdTime: 15,
                    multFirstName: '4',
                    multSecondName: '5',
                    multThirdName: '6',
                },
                {
                    gameId: 2,
                    soloFirstTime: 20,
                    soloSecondTime: 21,
                    soloThirdTime: 22,
                    soloFirstName: '2',
                    soloSecondName: '3',
                    soloThirdName: '4',
                    multFirstTime: 23,
                    multSecondTime: 24,
                    multThirdTime: 25,
                    multFirstName: '5',
                    multSecondName: '6',
                    multThirdName: '7',
                },
            ];
            jest.spyOn(gamesService, 'createFakePodium').mockImplementation(async () => {
                const gameId = parseInt(allIds.shift(), 10);
                return Promise.resolve({
                    gameId,
                    solo: {
                        first: { time: gameId * 10, name: gameId.toString() },
                        second: { time: gameId * 10 + 1, name: (gameId + 1).toString() },
                        third: { time: gameId * 10 + 2, name: (gameId + 2).toString() },
                    },
                    multiplayer: {
                        first: { time: gameId * 10 + 3, name: (gameId * 2 + 2).toString() },
                        second: { time: gameId * 10 + 4, name: (gameId * 2 + 3).toString() },
                        third: { time: gameId * 10 + 5, name: (gameId * 2 + 4).toString() },
                    },
                });
            });
            jest.spyOn(gamesRepository, 'findOneAndUpdatePodium').mockImplementation(async () => Promise.resolve(null));
            jest.spyOn(gamesRepository, 'getAllIds').mockImplementation(async () => {
                return allIds;
            });
            await gamesService.updateAllPodiums();
            expect(gamesRepository.findOneAndUpdatePodium).toHaveBeenCalledWith({ gameId: 1 }, expectedNewPodiums[0]);
            expect(podiumGateway.broadcastPodium).toHaveBeenCalledWith(PODIUM_MOCK);
        });
    });

    describe('deleteGame', () => {
        it('should delete a game, return nothing and broadcast a podium', async () => {
            const gameId = 1;
            jest.spyOn(gamesRepository, 'deleteGameById').mockImplementation(async () => Promise.resolve(null));
            jest.spyOn(podiumGateway, 'broadcastPodium').mockImplementation();
            await gamesService.deleteGame(gameId);
            expect(gamesRepository.deleteGameById).toHaveBeenCalledWith(gameId);
        });
    });

    describe('deleteAllGames', () => {
        it('should delete all games and return nothing', async () => {
            jest.spyOn(gamesRepository, 'deleteAllGames').mockImplementation(async () => Promise.resolve());
            await gamesService.deleteAllGames();
            expect(gamesRepository.deleteAllGames).toHaveBeenCalled();
        });
    });

    describe('deletePodiumByGameId', () => {
        it('should delete a podium by game id, return nothing and broadcast a podium', async () => {
            const gameId = 1;
            jest.spyOn(gamesRepository, 'deletePodiumPerGameId').mockImplementation(async () => Promise.resolve(null));
            await gamesService.deletePodiumByGameId(gameId);
            expect(gamesRepository.deletePodiumPerGameId).toHaveBeenCalledWith(gameId);
        });
    });

    describe('deleteAllPodiums', () => {
        it('should delete all podiums and return nothing', async () => {
            jest.spyOn(gamesRepository, 'deleteAllPodiums').mockImplementation(async () => Promise.resolve());
            await gamesService.deleteAllPodiums();
            expect(gamesRepository.deleteAllPodiums).toHaveBeenCalled();
        });
    });

    describe('getLength', () => {
        it('should return the number of games in the database', async () => {
            const expectedLength = 2;
            jest.spyOn(gamesRepository, 'getLength').mockImplementation(async () => Promise.resolve(expectedLength));
            const length = await gamesService.getLength();
            expect(length).toEqual(expectedLength);
        });
    });

    describe('getHighestId', () => {
        it('should return the highest game ID in the database', async () => {
            const expectedHighestId = 2;
            jest.spyOn(gamesRepository, 'findHighestGameId').mockImplementation(async () => Promise.resolve(expectedHighestId));
            const highestId = await gamesService.getHighestId();
            expect(highestId).toEqual(expectedHighestId);
        });
    });

    describe('createFakePodium', () => {
        it('should create a fake podium with the given game ID and return it', async () => {
            const gameId = 1;
            const expectedNewPodium: Podium = {
                gameId: 1,
                solo: {
                    first: { time: gameId * 10, name: gameId.toString() },
                    second: { time: gameId * 10 + 1, name: (gameId + 1).toString() },
                    third: { time: gameId * 10 + 2, name: (gameId + 2).toString() },
                },
                multiplayer: {
                    first: { time: gameId * 10 + 3, name: (gameId * 10 + 3).toString() },
                    second: { time: gameId * 10 + 4, name: (gameId * 10 + 4).toString() },
                    third: { time: gameId * 10 + 5, name: (gameId * 10 + 5).toString() },
                },
            };
            const newPodium = await gamesService.createFakePodium(gameId);
            jest.spyOn(gamesService, 'createFakePodium').mockImplementation(async () => Promise.resolve(expectedNewPodium));
            expect(newPodium.gameId).toEqual(expectedNewPodium.gameId);
        });
    });

    describe('getAllIds', () => {
        it('should return all game IDs in the database as strings', async () => {
            const expectedAllIds: string[] = ['1', '2'];
            jest.spyOn(gamesRepository, 'getAllIds').mockImplementation(async () => Promise.resolve(expectedAllIds));
            const allIds = await gamesService.getAllIds();
            expect(allIds).toEqual(expectedAllIds);
        });
    });
});
