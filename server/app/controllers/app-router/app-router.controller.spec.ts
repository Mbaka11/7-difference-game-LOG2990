import { AlgoService } from '@app/services/algo/detection-algo.service';
import { FileService } from '@app/services/file/file.service';
import { AppRouterController } from './app-router.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

/* eslint-disable */

interface Coordinate {
  row: number;
  col: number;
}

describe('AppRouterController', () => {
  let appRouterController: AppRouterController;
  let fileService: jest.Mocked<FileService>;
  let algoService: jest.Mocked<AlgoService>;

  beforeEach(async () => {
    const AlgoServiceMock: Partial<jest.Mocked<AlgoService>> = {
      isDifferentPixel: jest.fn(),
    };

    const FileServiceMock: Partial<jest.Mocked<FileService>> = {
      getJSONDifferencesArray: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppRouterController],
      providers: [
        {
          provide: AlgoService,
          useValue: AlgoServiceMock,
        },
        {
          provide: FileService,
          useValue: FileServiceMock,
        },
      ],
    }).compile();

    appRouterController = module.get<AppRouterController>(AppRouterController);
    fileService = module.get<FileService>(FileService) as jest.Mocked<FileService>;
    algoService = module.get<AlgoService>(AlgoService) as jest.Mocked<AlgoService>;
  });

  it('algoService should be defined', () => {
    expect(algoService).toBeDefined();
  });

  it('fileService should be defined', () => {
    expect(fileService).toBeDefined();
  });

  it('getMistake should call getJSONDifferencesArray and isDifferentPixel', async () => {
    const clusters: Coordinate[][] = [[{ row: 0, col: 0 }], [{ row: 1, col: 1 }]];
    fileService.getJSONDifferencesArray.mockResolvedValue(clusters);
    algoService.isDifferentPixel.mockReturnValue(clusters[0]);
    const result = await appRouterController.getMistake({ gameName: 'nom', xCoord: 0, yCoord: 0 });
    expect(result).toEqual(clusters[0]);
  });

  it('should return differences when getMistakes is called', async () => {
    const id = 'test_id';
    const differences: Coordinate[][] = [
      [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
      ],
    ];
    fileService.getJSONDifferencesArray.mockResolvedValue(differences);
    const res = {
      send: jest.fn(),
    } as unknown as Response;
    await appRouterController.getMistakes(id, res);
    expect(fileService.getJSONDifferencesArray).toHaveBeenCalledWith(id);
    expect(res.send).toHaveBeenCalledWith(differences);
  });
});
