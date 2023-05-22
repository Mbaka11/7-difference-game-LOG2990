/* eslint-disable @typescript-eslint/no-magic-numbers */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { FilterQuery, Model } from 'mongoose';
import { GamesRepository } from './games.repository';
import { Game, GameHistoryInfo, GameHistoryInfoDocument, GamesDocument, PodiumDocument, PodiumInfo } from './schemas/games.schema';

const game: Game = {
    gameId: 1,
    gameName: 'Game 1',
    gameDifficulty: 'easy',
    numberOfDiff: 3,
};

const gameHistoryInfo: GameHistoryInfo = {
    duration: '12',
    date: '12 avril',
    gameMode: 'Classique',
    players: ['me', 'you'],
    winner: 'me',
    surrender: 'you',
};

const gameList: Game[] = [game];
const filterQuery: FilterQuery<Game> = {
    gameId: 1,
};

const gameId = 1;

const podium: PodiumInfo = {
    gameId: 1,
    soloFirstTime: 1,
    soloFirstName: 'Adam',
    soloSecondTime: 2,
    soloSecondName: 'Benjamin',
    soloThirdTime: 3,
    soloThirdName: 'Catherine',
    multFirstTime: 1,
    multFirstName: 'David',
    multSecondTime: 2,
    multSecondName: 'Elizabeth',
    multThirdTime: 3,
    multThirdName: 'Frank',
};

const mockPodiumModelConstructor = jest.fn(() => ({
    find: jest.fn(),
    findOne: jest.fn(() => {
        return podium;
    }),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    distinct: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
    toObject: jest.fn(() => {
        return podium;
    }),
}));

const mockGameHistoryModelConstructor = jest.fn(() => ({
    find: jest.fn(),
    findOne: jest.fn(() => {
        return podium;
    }),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    distinct: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
    toObject: jest.fn(() => {
        return gameHistoryInfo;
    }),
}));

const mockGameModelConstructor = jest.fn(() => ({
    find: jest.fn(() => {
        return gameList;
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findOne: jest.fn(() => {
        return game;
    }),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    distinct: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
    toObject: jest.fn(() => {
        return game;
    }),
    gameId: 1,
    gameName: 'Game 1',
    gameDifficulty: 'easy',
    numberOfDiff: 3,
}));

describe('GamesRepository', () => {
    let gamesRepository: GamesRepository;
    let gameModel: Model<GamesDocument>;
    let podiumModel: Model<PodiumDocument>;
    let gameHistoryModel: Model<GameHistoryInfoDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamesRepository,
                {
                    provide: getModelToken(Game.name),
                    useValue: new mockGameModelConstructor(),
                },
                {
                    provide: getModelToken(PodiumInfo.name),
                    useValue: new mockPodiumModelConstructor(),
                },
                {
                    provide: getModelToken(GameHistoryInfo.name),
                    useValue: {
                        constructor: jest.fn().mockResolvedValue(gameHistoryModel),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        deleteOne: jest.fn(),
                        deleteMany: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        gamesRepository = module.get<GamesRepository>(GamesRepository);
        gameModel = module.get<Model<GamesDocument>>(getModelToken(Game.name));
        podiumModel = module.get<Model<PodiumDocument>>(getModelToken(PodiumInfo.name));
        gameHistoryModel = module.get<Model<GameHistoryInfoDocument>>(getModelToken(GameHistoryInfo.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should find one podium by filter query', async () => {
        // jest.spyOn(podiumModel, 'findOne').mockResolvedValueOnce(podium);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gamesRepository.findOnePodium(filterQuery);
        expect(podiumModel.findOne).toHaveBeenCalledWith(filterQuery);
        expect(result).toEqual(podium);
    });

    it('should find one game by filter query', async () => {
        // jest.spyOn(gameModel, 'findOne').mockResolvedValueOnce(game);
        const result = await gamesRepository.findOne(filterQuery);
        expect(gameModel.findOne).toHaveBeenCalledWith(filterQuery);
        expect(result).toEqual(game);
    });

    it('should find all games', async () => {
        // jest.spyOn(gameModel, 'find').mockResolvedValueOnce([game]);
        const result = await gamesRepository.find();
        expect(gameModel.find).toHaveBeenCalledWith({});
        expect(result).toEqual(gameList);
    });

    it('should find all podiums', async () => {
        const podiumList: PodiumInfo[] = [podium];
        jest.spyOn(podiumModel, 'find').mockResolvedValueOnce(podiumList);
        const result = await gamesRepository.findPodium();
        expect(podiumModel.find).toHaveBeenCalledWith({});
        expect(result).toEqual(podiumList);
    });

    it('should find all game histories', async () => {
        const gameHistories: GameHistoryInfo[] = [gameHistoryInfo];
        jest.spyOn(gameHistoryModel, 'find').mockResolvedValueOnce(gameHistories);
        const result = await gamesRepository.findGameHistory();
        expect(gameHistoryModel.find).toHaveBeenCalledWith({});
        expect(result).toEqual(gameHistories);
    });

    it('should find one podium by filter query and update it', async () => {
        const podiumFilterQuery: FilterQuery<PodiumInfo> = { gameId: 1 };
        const updatedPodium: Partial<PodiumInfo> = { soloFirstName: 'New Player' };
        jest.spyOn(podiumModel, 'findOneAndUpdate').mockResolvedValueOnce({ ...podium, ...updatedPodium });
        const result = await gamesRepository.findOneAndUpdatePodium(podiumFilterQuery, updatedPodium);
        expect(podiumModel.findOneAndUpdate).toHaveBeenCalledWith(podiumFilterQuery, updatedPodium);
        expect(result).toEqual({ ...podium, ...updatedPodium });
    });

    it('should return all distinct gameIds', async () => {
        const gameIds: string[] = ['1', '2', '3'];
        jest.spyOn(podiumModel, 'distinct').mockResolvedValueOnce(gameIds);
        const result = await gamesRepository.getAllIds();
        expect(podiumModel.distinct).toHaveBeenCalledWith('gameId');
        expect(result).toEqual(gameIds);
    });

    test('findOneAndUpdate() should update the specified game and return the updated game', async () => {
        const updatedGame = { ...game, gameName: 'Updated Game 1' };
        gameModel.findOneAndUpdate = jest.fn().mockResolvedValue(updatedGame);
        const result = await gamesRepository.findOneAndUpdate(filterQuery, updatedGame);
        expect(gameModel.findOneAndUpdate).toHaveBeenCalledWith(filterQuery, updatedGame);
        expect(result).toEqual(updatedGame);
    });

    test('deletePodiumPerGameId() should delete the specified podium and return true', async () => {
        podiumModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
        const result = await gamesRepository.deletePodiumPerGameId(gameId);
        expect(podiumModel.deleteOne).toHaveBeenCalledWith({ gameId });
        expect(result).toBe(true);
    });

    test('deleteGameById() should delete the specified game and return true', async () => {
        gameModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
        const result = await gamesRepository.deleteGameById(gameId);
        expect(gameModel.deleteOne).toHaveBeenCalledWith({ gameId });
        expect(result).toBe(true);
    });

    test('deleteAllPodiums() should delete all podiums', async () => {
        podiumModel.deleteMany = jest.fn().mockResolvedValue({});
        await gamesRepository.deleteAllPodiums();
        expect(podiumModel.deleteMany).toHaveBeenCalledWith({});
    });

    test('deleteAllGames() should delete all games', async () => {
        gameModel.deleteMany = jest.fn().mockResolvedValue({});
        await gamesRepository.deleteAllGames();
        expect(gameModel.deleteMany).toHaveBeenCalledWith({});
    });

    test('deleteAllHistory() should delete all game history records', async () => {
        gameHistoryModel.deleteMany = jest.fn().mockResolvedValue({});
        await gamesRepository.deleteAllHistory();
        expect(gameHistoryModel.deleteMany).toHaveBeenCalledWith({});
    });

    test('getLength() should return the number of documents in the game collection', async () => {
        const count = 5;
        gameModel.countDocuments = jest.fn().mockResolvedValue(count);
        const result = await gamesRepository.getLength();
        expect(gameModel.countDocuments).toHaveBeenCalled();
        expect(result).toBe(count);
    });

    test('findHighestGameId() should return the highest gameId', async () => {
        const testData = ['1', '5', '3', '8', '4'];
        gamesRepository.getAllIds = jest.fn().mockResolvedValue(testData);
        const highestId = await gamesRepository.findHighestGameId();
        expect(highestId).toEqual(8);
    });

    test('findHighestGameId with empty array', async () => {
        gamesRepository.getAllIds = jest.fn().mockResolvedValue([]);
        const highestId = await gamesRepository.findHighestGameId();
        expect(highestId).toEqual(0);
    });
});

describe('functions with new ', () => {
    let gamesRepository: GamesRepository;
    let gameHistoryModel: Model<GameHistoryInfoDocument>;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamesRepository,
                {
                    provide: getModelToken(Game.name),
                    useValue: mockGameModelConstructor,
                },
                {
                    provide: getModelToken(PodiumInfo.name),
                    useValue: mockPodiumModelConstructor,
                },
                {
                    provide: getModelToken(GameHistoryInfo.name),
                    useValue: mockGameHistoryModelConstructor,
                },
            ],
        }).compile();

        gamesRepository = module.get<GamesRepository>(GamesRepository);
        gameHistoryModel = module.get<Model<GameHistoryInfoDocument>>(getModelToken(GameHistoryInfo.name));
    });

    it('should create a new podium and return it', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await gamesRepository.createPodium(podium);
        expect(result).toEqual(podium);
    });

    it('should create a new game and return it', async () => {
        const result = await gamesRepository.create(game);
        expect(result.gameId).toEqual(game.gameId);
        expect(result.gameName).toEqual(game.gameName);
        expect(result.gameDifficulty).toEqual(game.gameDifficulty);
        expect(result.numberOfDiff).toEqual(game.numberOfDiff);
    });

    it('should create a new game history and return it', async () => {
        const result = await gamesRepository.createGameHistory(gameHistoryInfo);
        expect(result).toEqual(gameHistoryInfo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
