import { FileService } from '@app/services/file/file.service';
import { GameInformation } from '@common/game-information';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { GameCardController } from './game-card.controller';

/* eslint-disable */

describe('GameCardController', () => {
    let gameCardController: GameCardController;
    let fileService: jest.Mocked<FileService>;

    beforeEach(async () => {
        const FileServiceMock: Partial<jest.Mocked<FileService>> = {
            getGamesById: jest.fn(),
            deleteAllGames: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameCardController],
            providers: [
                {
                    provide: FileService,
                    useValue: FileServiceMock,
                },
            ],
        }).compile();

        gameCardController = module.get<GameCardController>(GameCardController);
        fileService = module.get<FileService>(FileService) as jest.Mocked<FileService>;
    });

    it('should return a game when getGameCardTest is called', async () => {
        // Arrange
        const id = '1';
        const game: GameInformation = {
            gameId: 1,
            gameName: 'Test Game',
            gameDifficulty: 'Facile',
            numberOfDiff: 5,
        };

        fileService.getGamesById.mockResolvedValue(game);

        const res = {
            send: jest.fn(),
        } as unknown as Response;

        // Act
        await gameCardController.getGameCardTest(id, res);

        // Assert
        expect(fileService.getGamesById).toHaveBeenCalledWith(parseInt(id, 10));
        expect(res.send).toHaveBeenCalledWith(game);
    });

    it('deleteAllGames() should call fileService.deleteAllGames', async () => {
        jest.spyOn(fileService, 'deleteAllGames');

        await gameCardController.deleteAllGames();

        expect(fileService.deleteAllGames).toHaveBeenCalled();
    });
});
