import { TimeGameSetting } from '@app/Common/time-game-interface';
import { PodiumGateway } from '@app/gateways/podium/podium.gateway';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { GamesRepository } from '@app/services/database/games.repository';
import { GamesService } from '@app/services/database/games.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { GameInformation } from '@common/game-information';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { FileService } from './file.service';

/* eslint-disable */

describe('FileService', () => {
    let service: FileService;
    let algoService: AlgoService;
    const imageData = 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    const file = `data:image/png;base64,${imageData}`;
    const path = 'test-image';
    const genericPath = './assets/images';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            //FIXME add gameService dans les providers et faire pour gameService la meme chose que pour algoService ? (je pense quil voulait dire FileService)
            providers: [
                FileService,
                AlgoService,
                GamesService,
                { provide: GamesRepository, useValue: {} },
                WaitingRoomGateway,
                WaitingRoomService,
                { provide: PodiumGateway, useValue: {} },
            ],
        }).compile();

        service = module.get<FileService>(FileService);
        service['gameDatabase'] = module.get<GamesService>(GamesService);
        algoService = new AlgoService();
        jest.resetAllMocks();
    });

    afterEach(() => {
        if (fs.existsSync(`${service.genericPath}/${path}.bmp`)) {
            fs.unlinkSync(`${service.genericPath}/${path}.bmp`);
        }
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('extractFile should write a file to the specified path', async () => {
        await service.extractFile(path, file);
        expect(fs.existsSync(`${service.genericPath}/${path}.bmp`)).toBe(true);
    });

    it('extractFile should write the correct data to the file', async () => {
        await service.extractFile(path, file);
        const writtenData = fs.readFileSync(`${service.genericPath}/${path}.bmp`).toString('base64');
        expect(writtenData).toBe(imageData);
    });

    it('readImage should return the contents of the specified image file', async () => {
        const fileName = 'test-image';
        fs.writeFileSync(`${service.genericPath}/${path}.bmp`, Buffer.from(imageData, 'base64'));
        const data = await service.readImage(fileName);
        expect(data).toBe(imageData);
    });

    it('readImage should reject with an error if file reading fails', async () => {
        const fileName = 'test-image';
        await expect(service.readImage(fileName)).rejects.toThrowError();
    });

    it('writeImage should write the image to disk in the "originals" folder if isOriginal is true', async () => {
        const originalFolder = `${service.genericPath}/originals`;
        if (!fs.existsSync(originalFolder)) {
            fs.mkdirSync(originalFolder);
        }
        await service.writeImage(path, true, imageData);
        const data = fs.readFileSync(`${originalFolder}/${path}.bmp`, 'base64');
        expect(data).toBe(imageData);
        if (fs.existsSync(`${originalFolder}/${path}.bmp`)) {
            fs.unlinkSync(`${originalFolder}/${path}.bmp`);
        }
    });

    it('writeImage should write the image to disk in the "modified" folder if isOriginal is false', async () => {
        const modifiedFolder = `${service.genericPath}/modified`;
        if (!fs.existsSync(modifiedFolder)) {
            fs.mkdirSync(modifiedFolder);
        }
        await service.writeImage(path, false, imageData);
        const data = fs.readFileSync(`${modifiedFolder}/${path}.bmp`, 'base64');
        expect(data).toBe(imageData);
        if (fs.existsSync(`${modifiedFolder}/${path}.bmp`)) {
            fs.unlinkSync(`${modifiedFolder}/${path}.bmp`);
        }
    });

    it('saveJSONTempToGameName should read the temp JSON file, save it to disk as a JSON file with the specified game name', async () => {
        const array = [
            [
                { row: 1, col: 2 },
                { row: 3, col: 4 },
            ],
            [
                { row: 5, col: 6 },
                { row: 7, col: 8 },
            ],
        ];

        if (!fs.existsSync('./assets/differences/temp')) {
            fs.mkdirSync('./assets/differences/temp', { recursive: true });
        }
        fs.writeFileSync('assets/differences/temp/temp.json', JSON.stringify(array));

        await service.saveJSONTempToGameName(path);
        const data = JSON.parse(fs.readFileSync(`./assets/differences/${path}.json`, 'utf8'));
        expect(data).toEqual(array);

        if (fs.existsSync(`./assets/differences/${path}.json`)) {
            fs.unlinkSync(`./assets/differences/${path}.json`);
        }
    });

    it('saveJSONTempToGameName should throw error is file does not exist', async () => {
        const array = [
            [
                { row: 1, col: 2 },
                { row: 3, col: 4 },
            ],
            [
                { row: 5, col: 6 },
                { row: 7, col: 8 },
            ],
        ];

        if (!fs.existsSync('./assets/differences/temp')) {
            fs.mkdirSync('./assets/differences/temp', { recursive: true });
        }
        if (fs.existsSync('assets/differences/temp/temp.json')) {
            fs.unlinkSync(`./assets/differences/temp/temp.json`);
        }

        try {
            await service.saveJSONTempToGameName(path);
        } catch (error) {
            expect(error).toBeTruthy();
        }

        if (!fs.existsSync('./assets/differences/temp')) {
            fs.mkdirSync('./assets/differences/temp', { recursive: true });
        }
        fs.writeFileSync('assets/differences/temp/temp.json', JSON.stringify(array));
        if (fs.existsSync(`./assets/differences/${path}.json`)) {
            fs.unlinkSync(`./assets/differences/${path}.json`);
        }
    });

    it('getJSONDifferencesArray should return an array of Coordinate arrays', async () => {
        const array = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
        ];

        fs.writeFileSync(`./assets/differences/${path}.json`, JSON.stringify(array));

        const result = await service.getJSONDifferencesArray(path);
        expect(result).toEqual(array);
    });

    it('getJSONDifferencesArray should throw an error if file not found', async () => {
        const array = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
        ];

        if (fs.existsSync(`./assets/differences/${path}.json`)) {
            fs.unlinkSync(`./assets/differences/${path}.json`);
        }

        try {
            await service.getJSONDifferencesArray(path);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('generateDifferenceBMP should return a promise', async () => {
        const result = service.generateDifferenceBMP([[true, false]]);
        expect(result).toBeInstanceOf(Promise);
    });

    it('generateDifferenceBMP should resolve the promise', async () => {
        await expect(service.generateDifferenceBMP([[true, false]])).resolves.toBeUndefined();
    });

    it('generateDifferenceBMP should generate the difference BMP', async () => {
        const differenceSheet = [
            [false, false, true],
            [false, true, false],
            [true, false, false],
        ];
        await service.generateDifferenceBMP(differenceSheet);
        expect(fs.existsSync(`${service.genericPath}/imageTemp/diffImage.bmp`)).toBe(true);
        fs.unlinkSync(`${service.genericPath}/imageTemp/diffImage.bmp`);
    });

    it('generateDifferenceBMP should create a BMP file with the specified pixel values', async () => {
        const differenceSheet = [
            [true, false],
            [false, true],
        ];
        const mockAlgoService = {
            createPixelDifferenceSheet: jest.fn(() => [
                [
                    [255, 0, 0],
                    [0, 0, 0],
                ],
                [
                    [0, 0, 0],
                    [0, 0, 255],
                ],
            ]),
        };

        await service.generateDifferenceBMP(differenceSheet);

        const bmpContents = fs.readFileSync(`${service.genericPath}/imageTemp/diffImage.bmp`);
        expect(bmpContents.toString('hex')).toBe(
            '89504e470d0a1a0a0000000d494844520000000200000002080600000072b60d2400000006624b474400ff00ff00ffa0bda7930000001449444154089963646060f8ffffff7f18c9f01f004cd708f9e25508230000000049454e44ae426082',
        );
        fs.unlinkSync(`${service.genericPath}/imageTemp/diffImage.bmp`);
    });

    it('deleteFile should call fs.unlink with the provided path and should not log an error', async () => {
        jest.spyOn(fs, 'unlink');
        fs.writeFileSync(`${service.genericPath}/${path}.bmp`, Buffer.from(imageData, 'base64'));
        await service.deleteFile(`${service.genericPath}/${path}.bmp`);
        expect(fs.unlink).toHaveBeenCalled();
    });

    it('deleteFile should call fs.unlink and throw an error if file not found', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        jest.spyOn(fs, 'unlink').mockImplementation((path, callback) => {
            callback(new Error('File not found'));
        });

        try {
            await service.deleteFile(`${service.genericPath}/${path}.bmp`);
        } catch (error) {
            expect(error).toBeTruthy();
        }

        expect(fs.unlink).toHaveBeenCalled();
    });

    it('getIdAndAddGame should return the id of the newly added game', async () => {
        const gameName = 'test game';
        const gameDifficulty = 'hard';
        const numberOfDiff = 5;
        const inputGame: GameInformation = { gameId: 0, gameName, gameDifficulty, numberOfDiff };
        jest.spyOn(service.gameDatabase, 'getHighestId').mockImplementation(async () => {
            return 3;
        });
        jest.spyOn(service.gameDatabase, 'createFakePodium').mockImplementation(async () => {
            return {
                gameId: 1,
                solo: {
                    first: { time: 2, name: 'bab' },
                    second: { time: 3, name: 'rab' },
                    third: { time: 4, name: 'crab' },
                },
                multiplayer: {
                    first: { time: 2, name: 'bab' },
                    second: { time: 3, name: 'rab' },
                    third: { time: 4, name: 'crab' },
                },
            };
        });

        jest.spyOn(service.gameDatabase, 'createGame').mockImplementation(async () => {
            return {
                gameId: 1,
                gameName: 'test',
                gameDifficulty: 'test2',
                numberOfDiff: 2,
            };
        });

        jest.spyOn(service.gameDatabase, 'createPodium').mockImplementation(async () => {
            return {
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
        });

        fs.writeFileSync('./assets/games1.json', '');
        const gameId = await service.getIdAndAddGame(inputGame);

        expect(gameId).toBe(4);
        fs.unlinkSync('./assets/games1.json');
    });

    it('getGamesById should return the correct gameInformation', async () => {
        const gameInfo: Promise<GameInformation[]> = new Promise((resolve) => {
            resolve([
                {
                    gameId: 1,
                    gameName: 'n1',
                    gameDifficulty: 'd1',
                    numberOfDiff: 3,
                },
                {
                    gameId: 2,
                    gameName: 'n2',
                    gameDifficulty: 'd2',
                    numberOfDiff: 4,
                },
            ]);
        });
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(gameInfo));
        jest.spyOn(service, 'getGames').mockReturnValue(gameInfo);
        const expGameInfo = await service.getGamesById(1);
        expect(expGameInfo.gameId).toEqual(1);
        expect(expGameInfo.gameName).toEqual('n1');
        expect(expGameInfo.gameDifficulty).toEqual('d1');
        expect(expGameInfo.numberOfDiff).toEqual(3);
    });

    it('should delete the game with the specified id from the file', async () => {
        const gameIdToDelete = 2;
        const gameInfo: GameInformation[] = [
            {
                gameId: 1,
                gameName: 'n1',
                gameDifficulty: 'd1',
                numberOfDiff: 3,
            },
            {
                gameId: 2,
                gameName: 'n2',
                gameDifficulty: 'd2',
                numberOfDiff: 4,
            },
        ];
        if (fs.existsSync('./assets/games1.json')) {
            fs.unlinkSync('./assets/games1.json');
        }
        fs.writeFileSync('./assets/games1.json', JSON.stringify(gameInfo));

        jest.spyOn(service.gameDatabase, 'deletePodiumByGameId').mockImplementation(async () => {});
        jest.spyOn(service.gameDatabase, 'deleteGame').mockImplementation(async () => {});

        await service.deleteGameWithId(gameIdToDelete);

        const fileInformation = fs.readFileSync('./assets/games1.json', 'utf8');
        expect(fileInformation).toBe(undefined);
        if (fs.existsSync('./assets/games1.json')) {
            fs.unlinkSync('./assets/games1.json');
        }
    });

    it('should not modify the file if the game with the specified id does not exist', async () => {
        const gameIdToDelete = 4;
        const gameInfo: GameInformation[] = [
            {
                gameId: 1,
                gameName: 'n1',
                gameDifficulty: 'd1',
                numberOfDiff: 3,
            },
            {
                gameId: 2,
                gameName: 'n2',
                gameDifficulty: 'd2',
                numberOfDiff: 4,
            },
        ];
        if (fs.existsSync('./assets/games1.json')) {
            fs.unlinkSync('./assets/games1.json');
        }
        fs.writeFileSync('./assets/games1.json', JSON.stringify(gameInfo));
        jest.spyOn(service.gameDatabase, 'deletePodiumByGameId').mockImplementation(async () => {});
        jest.spyOn(service.gameDatabase, 'deleteGame').mockImplementation(async () => {});

        await service.deleteGameWithId(gameIdToDelete);

        const fileInformation = fs.readFileSync('./assets/games1.json', 'utf8');
        expect(fileInformation).toBe(undefined);
        if (fs.existsSync('./assets/games1.json')) {
            fs.unlinkSync('./assets/games1.json');
        }
    });

    it('saveTimeGameSetting should write the image to disk in the "originals" folder if isOriginal is true', async () => {
        const originalFolder = './assets';
        if (!fs.existsSync(originalFolder)) {
            fs.mkdirSync(originalFolder);
        }
        const timeSetting: TimeGameSetting = { bonusTime: 0, startTime: 0, penaltyTime: 0 };

        const writeFileMock = jest.spyOn(fs, 'writeFile').mockImplementation((path, data, cb) => {
            cb(null);
        });

        await service.saveTimeGameSetting(`${originalFolder}/settingsTest.json`, timeSetting);

        expect(writeFileMock).toHaveBeenCalledWith(`${originalFolder}/settingsTest.json`, JSON.stringify(timeSetting), expect.any(Function));

        if (fs.existsSync(`${originalFolder}/settingsTest.json`)) {
            fs.unlinkSync(`${originalFolder}/settingsTest.json`);
        }

        writeFileMock.mockRestore();
    });

    it('readSettingsFile should return an array of gameInformation', async () => {
        const array =
            '[{"gameId":1,"gameName":"n1","gameDifficulty":"d1","numberOfDiff":3},{"gameId":3,"gameName":"n3","gameDifficulty":"d3","numberOfDiff":4}]';

        fs.writeFileSync(`./assets/${path}.json`, JSON.stringify(array));

        const result = await service.readSettingsFile(path);
        expect(result).toEqual(array);

        if (fs.existsSync(`./assets/${path}.json`)) {
            fs.unlinkSync(`./assets/${path}.json`);
        }
    });

    it('readSettingsFile should throw an error if file not found', async () => {
        if (fs.existsSync(`./assets/${path}.json`)) {
            fs.unlinkSync(`./assets/${path}.json`);
        }

        try {
            await service.readSettingsFile(path);
        } catch (error) {
            expect(error).toBeTruthy();
        }

        if (fs.existsSync(`./assets/${path}.json`)) {
            fs.unlinkSync(`./assets/${path}.json`);
        }
    });

    it('getTimeGame should return randomized games and settings', async () => {
        const pathSetting = 'path/to/settings.json';
        const settings = { startTime: 0, penaltyTime: 0, bonusTime: 0 };
        const games = [
            {
                gameDifferences: [[{ row: 1, col: 1 }]],
                gameOriginal: 'original',
                gameModified: 'modified',
                gameInformation: {
                    gameId: 1,
                    gameName: 'test',
                    gameDifficulty: 'easy',
                    numberOfDiff: 1,
                },
            },
        ];
        jest.spyOn(service, 'readSettingsFile').mockResolvedValue(JSON.stringify(settings));
        jest.spyOn(service, 'getShuffledGames').mockResolvedValue(games);

        const result = await service.getTimeGame(pathSetting);

        expect(result).toEqual({ settings, timeGames: games });
    });

    it('getShuffledGames should return an array of shuffled games', async () => {
        // Mock the necessary dependencies
        const mockGameInfo = [
            {
                gameId: 1,
                gameName: 'test1',
                gameDifficulty: 'easy',
                numberOfDiff: 1,
            },
            {
                gameId: 2,
                gameName: 'test2',
                gameDifficulty: 'medium',
                numberOfDiff: 2,
            },
        ];
        const mockGames = [
            {
                gameDifferences: [[{ row: 1, col: 1 }]],
                gameOriginal: 'original',
                gameModified: 'modified',
                gameInformation: {
                    gameId: 1,
                    gameName: 'test1',
                    gameDifficulty: 'easy',
                    numberOfDiff: 1,
                },
            },
            {
                gameDifferences: [[{ row: 2, col: 2 }]],
                gameOriginal: 'original2',
                gameModified: 'modified2',
                gameInformation: {
                    gameId: 2,
                    gameName: 'test2',
                    gameDifficulty: 'medium',
                    numberOfDiff: 2,
                },
            },
        ];
        jest.spyOn(service, 'getGames').mockResolvedValueOnce(mockGameInfo);
        jest.spyOn(service, 'shuffle').mockReturnValueOnce(mockGameInfo);
        jest.spyOn(service, 'readImage').mockResolvedValue('image data');
        jest.spyOn(service, 'getJSONDifferencesArray').mockResolvedValue([[{ row: 1, col: 1 }]]);

        // Call the function and get the result
        const result = await service.getShuffledGames();

        // Check that the result has the expected format and content
        expect(Array.isArray(result)).toBe(true);
    });

    it('shuffle should shuffle an array of GameInformation objects', () => {
        const games: GameInformation[] = [
            { gameId: 1, gameName: 'Game 1', gameDifficulty: 'Easy', numberOfDiff: 3 },
            { gameId: 2, gameName: 'Game 2', gameDifficulty: 'Medium', numberOfDiff: 5 },
            { gameId: 3, gameName: 'Game 3', gameDifficulty: 'Hard', numberOfDiff: 7 },
        ];
        const shuffledGames = service.shuffle(games);
        expect(shuffledGames.length).toEqual(games.length);
    });

    it('should call deletePodiumByGameId and deleteGame methods with correct parameters', async () => {
        const gameId = 123;
        const deletePodiumByGameIdSpy = jest.spyOn(service.gameDatabase, 'deletePodiumByGameId').mockImplementation(async () => {});
        const deleteGameSpy = jest.spyOn(service.gameDatabase, 'deleteGame').mockImplementation(async () => {});

        await service.deleteGameWithId(gameId);

        expect(deletePodiumByGameIdSpy).toHaveBeenCalledWith(gameId);
        expect(deleteGameSpy).toHaveBeenCalledWith(gameId);
    });

    it('should call getAllIds and deleteGameWithId methods with correct parameters', async () => {
        const allIds = ['1', '2', '3'];
        jest.spyOn(service.gameDatabase, 'getAllIds').mockResolvedValue(allIds);
        jest.spyOn(service, 'deleteGameWithId');
        const deleteGameWithIdSpy = jest.spyOn(service, 'deleteGameWithId').mockImplementation(async () => {});
        jest.spyOn(service.waitingRoomGateway, 'disconnectAll').mockImplementation(() => {});
        await service.deleteAllGames();

        expect(service.gameDatabase.getAllIds).toHaveBeenCalled();
        expect(deleteGameWithIdSpy).toHaveBeenCalledTimes(allIds.length);
        expect(deleteGameWithIdSpy).toHaveBeenCalledWith(1);
        expect(deleteGameWithIdSpy).toHaveBeenCalledWith(2);
        expect(deleteGameWithIdSpy).toHaveBeenCalledWith(3);
    });

    it('should not call deleteGameWithId if getAllIds returns an empty array', async () => {
        jest.spyOn(service.gameDatabase, 'getAllIds').mockResolvedValue([]);
        const deleteGameWithIdSpy = jest.spyOn(service, 'deleteGameWithId');

        await service.deleteAllGames();

        expect(service.gameDatabase.getAllIds).toHaveBeenCalled();
        expect(deleteGameWithIdSpy).not.toHaveBeenCalled();
    });

    it('should return an array of GameInformation objects', async () => {
        const games = [
            { gameId: 1, gameName: 'king you are', gameDifficulty: 'facile', numberOfDiff: 5 },
            { gameId: 2, gameName: 'king you are', gameDifficulty: 'facile', numberOfDiff: 6 },
            { gameId: 3, gameName: 'drtfghbj', gameDifficulty: 'facile', numberOfDiff: 3 },
        ];
        jest.spyOn(service.gameDatabase, 'getGames').mockResolvedValue(games);

        const result = await service.getGames();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(games.length);
        result.forEach((game) => {
            expect(game).toHaveProperty('gameId');
            expect(game).toHaveProperty('gameName');
            expect(game).toHaveProperty('gameDifficulty');
            expect(game).toHaveProperty('numberOfDiff');
        });
    });

    it('should return an empty array if there are no games in the database', async () => {
        jest.spyOn(service.gameDatabase, 'getGames').mockResolvedValue([]);

        const result = await service.getGames();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
    });
});
