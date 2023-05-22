import { AlgoController } from '@app/controllers/algo/algo.controller';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { FileService } from '@app/services/file/file.service';
import { GameInformation } from '@common/game-information';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

/* eslint-disable */

interface ImgData {
    originalData: string;
    diffData: string;
    name: string;
    radius: number;
}

interface Coordinate {
    row: number;
    col: number;
}

describe.only('AlgoController', () => {
    let controller: AlgoController;
    let fileService: SinonStubbedInstance<FileService>;
    let algoService: SinonStubbedInstance<AlgoService>;
    let waitingRoomGateway: SinonStubbedInstance<WaitingRoomGateway>;

    beforeEach(async () => {
        fileService = createStubInstance(FileService);
        algoService = createStubInstance(AlgoService);
        waitingRoomGateway = createStubInstance(WaitingRoomGateway);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AlgoController],
            providers: [
                {
                    provide: FileService,
                    useValue: fileService,
                },
                {
                    provide: AlgoService,
                    useValue: algoService,
                },
                {
                    provide: WaitingRoomGateway,
                    useValue: waitingRoomGateway,
                },
            ],
        }).compile();

        controller = module.get<AlgoController>(AlgoController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return all images and games', async () => {
        const games: GameInformation[] = [
            { gameId: 0, gameName: 'name test', gameDifficulty: 'diff test', numberOfDiff: 3 },
            { gameId: 1, gameName: 'name test2', gameDifficulty: 'diff test2', numberOfDiff: 4 },
        ];
        const data: string[] = [undefined, undefined];
        const res = { send: jest.fn() };
        fileService.getGames.resolves(games);

        await controller.getAllImages(res as any);

        expect(res.send).toHaveBeenCalledWith({ data, games });
    });

    it('getModifiedPixels should return original and modified pixels', async () => {
        const gameName = 'testGame';
        const originalPixels = [
            [
                [1, 2, 3],
                [4, 5, 6],
            ],
        ];
        const modifiedPixels = [
            [
                [7, 8, 9],
                [10, 11, 12],
            ],
        ];
        const res = {
            send: jest.fn(),
        };

        algoService.readImage.withArgs(`assets/images/originals/${gameName}.bmp`).resolves(originalPixels);
        algoService.readImage.withArgs(`assets/images/modified/${gameName}.bmp`).resolves(modifiedPixels);

        await controller.getModifiedPixels(gameName, res as any);

        expect(res.send).toHaveBeenCalledWith({ original: originalPixels, modified: modifiedPixels });
    });

    it('getModifiedPixels should call readImage on AlgoService twice with correct arguments', async () => {
        const gameName = 'testGame';
        const res = {
            send: jest.fn(),
        };

        await controller.getModifiedPixels(gameName, res as any);

        expect(algoService.readImage.calledTwice).toBe(true);
        expect(algoService.readImage.firstCall.args[0]).toBe(`assets/images/originals/${gameName}.bmp`);
        expect(algoService.readImage.secondCall.args[0]).toBe(`assets/images/modified/${gameName}.bmp`);
    });

    it('getImage should return image data', async () => {
        const fileName = 'testImage';
        const settings = { startTime: 0, penaltyTime: 0, bonusTime: 0 };
        const originalImageData = 'originalImageData';
        const modifiedImageData = 'modifiedImageData';
        const res = {
            send: jest.fn(),
        };

        fileService.readImage.withArgs(`originals/${fileName}`).resolves(originalImageData);
        fileService.readSettingsFile.withArgs('./assets/settings.json').resolves(JSON.stringify(settings));
        fileService.readImage.withArgs(`modified/${fileName}`).resolves(modifiedImageData);
        await controller.getImage(fileName, res as any);

        expect(res.send).toHaveBeenCalledWith({ leftData: originalImageData, rightData: modifiedImageData, timeGameSetting: settings });
    });

    it('deleteTemps should call deleteFile on FileService four times with correct arguments', async () => {
        const res = {
            send: jest.fn(),
        };
        await controller.deleteTemps();

        expect(fileService.deleteFile.called).toBe(true);
        expect(fileService.deleteFile.callCount).toBe(4);
        expect(fileService.deleteFile.getCall(0).args[0]).toBe('assets/differences/temp/temp.json');
        expect(fileService.deleteFile.getCall(1).args[0]).toBe('assets/images/imageTemp/diffImage.bmp');
        expect(fileService.deleteFile.getCall(2).args[0]).toBe('assets/images/imageTemp/modified.bmp');
        expect(fileService.deleteFile.getCall(3).args[0]).toBe('assets/images/imageTemp/original.bmp');
    });

    it('deleteReal should call deleteFile on FileService four times with correct arguments', async () => {
        const param: string = '1';
        await controller.deleteReal(param);
        expect(waitingRoomGateway.disconnectAll.called).toBe(true);
        expect(fileService.deleteFile.called).toBe(true);
        expect(fileService.deleteFile.callCount).toBe(3);
        expect(fileService.deleteFile.getCall(0).args[0]).toBe(`assets/differences/${param}.json`);
        expect(fileService.deleteFile.getCall(1).args[0]).toBe(`assets/images/modified/${param}.bmp`);
        expect(fileService.deleteFile.getCall(2).args[0]).toBe(`assets/images/originals/${param}.bmp`);
        expect(fileService.deleteGameWithId.called).toBe(true);
        expect(fileService.deleteGameWithId.callCount).toBe(1);
        expect(fileService.deleteGameWithId.getCall(0).args[0]).toBe(1);
    });

    it('save should call readImage method on fileService with correct parameters', async () => {
        const res = {} as Response;
        const body = { imageName: 'testImage', difficulty: 'easy', numberOfDiff: 5 };
        const inputGame: GameInformation = { gameId: 0, gameName: body.imageName, gameDifficulty: body.difficulty, numberOfDiff: body.numberOfDiff };
        fileService.getIdAndAddGame.withArgs(inputGame).resolves(0);
        await controller.save(body);
        expect(fileService.readImage.firstCall.args).toEqual(['imageTemp/original']);
        expect(fileService.readImage.secondCall.args).toEqual(['imageTemp/modified']);
    });

    it('save should call getIdAndAddGame method on fileService with correct parameters', async () => {
        const res = {} as Response;
        const body = { imageName: 'testImage', difficulty: 'easy', numberOfDiff: 5 };
        const inputGame: GameInformation = { gameId: 0, gameName: body.imageName, gameDifficulty: body.difficulty, numberOfDiff: body.numberOfDiff };
        fileService.getIdAndAddGame.withArgs(inputGame).resolves(0);
        await controller.save(body);
        expect(fileService.getIdAndAddGame.firstCall.args).toEqual([inputGame]);
    });

    it('save should call writeImage method on fileService with correct parameters', async () => {
        fileService.getIdAndAddGame.resolves(1);
        const res = {} as Response;
        const body = { imageName: 'testImage', difficulty: 'easy', numberOfDiff: 5 };
        const originalImage = 'originalImage';
        const modifiedImage = 'modifiedImage';
        fileService.readImage.onFirstCall().resolves(originalImage);
        fileService.readImage.onSecondCall().resolves(modifiedImage);
        await controller.save(body);
        expect(fileService.writeImage.firstCall.args).toEqual(['1', true, originalImage]);
        expect(fileService.writeImage.secondCall.args).toEqual(['1', false, modifiedImage]);
    });

    it('save should call saveJSONTempToGameName method on fileService with correct parameters', async () => {
        fileService.getIdAndAddGame.resolves(1);
        const res = {} as Response;
        const body = { imageName: 'testImage', difficulty: 'easy', numberOfDiff: 5 };
        await controller.save(body);
        expect(await fileService.saveJSONTempToGameName.firstCall.args).toEqual(['1']);
    });

    it('validate should call algoService.findDifferenceInformation with correct arguments', async () => {
        const res = {
            send: jest.fn(),
        };
        const diffSheetAndDiffPixels = {
            differences: [
                [true, false],
                [false, true],
            ],
            nbDiffPixels: 2,
        };
        const diffInfo = {
            nbDifferences: 0,
            difficulty: 'difficile',
            clusters: [[{ row: 0, col: 0 } as Coordinate]],
        };
        algoService.findDifferences.resolves(diffSheetAndDiffPixels);
        algoService.findDifferenceInformation.resolves(diffInfo);
        fileService.generateDifferenceBMP.resolves(
            await new Promise<void>((resolve) => {
                resolve();
            }),
        );

        await controller.validate({} as any, res as any);

        expect(algoService.findDifferenceInformation.calledOnce).toBe(true);
        expect(algoService.findDifferenceInformation.firstCall.args[0]).toBe(diffSheetAndDiffPixels);
    });
});
