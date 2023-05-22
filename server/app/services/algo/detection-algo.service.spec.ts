import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { AlgoService } from './detection-algo.service';

/* eslint-disable */

describe('Algo_service', () => {
    let service: AlgoService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AlgoService],
        }).compile();

        service = module.get<AlgoService>(AlgoService);

        jest.resetAllMocks();
    });

    afterEach(() => {});

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a 2D array of pixel data', async () => {
        const path = 'test-path';
        const imageData = 'Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
        fs.writeFileSync(`./${path}.bmp`, Buffer.from(imageData, 'base64'));
        const result = await service.readImage(`./${path}.bmp`);
        expect(result).toEqual([
            [
                [0, 0, 0, 255],
                [0, 0, 0, 255],
            ],
            [
                [0, 0, 0, 255],
                [0, 0, 0, 255],
            ],
        ]);
        fs.unlinkSync(`./${path}.bmp`);
    });

    it('should return a 2D array of boolean values indicating differences between two images', async () => {
        const path1 = 'test-path1';
        const imageData1 = 'Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
        fs.writeFileSync(`./${path1}.bmp`, Buffer.from(imageData1, 'base64'));

        const path2 = 'test-path2';
        const imageData2 = 'Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
        fs.writeFileSync(`./${path2}.bmp`, Buffer.from(imageData2, 'base64'));

        const result = await service.findDifferences(`./${path1}.bmp`, `./${path2}.bmp`, 1);
        expect(result.differences).toEqual([
            [false, false],
            [false, false],
        ]);
        expect(result.nbDiffPixels).toEqual(0);

        fs.unlinkSync(`./${path1}.bmp`);
        fs.unlinkSync(`./${path2}.bmp`);
    });

    it('should return a 2D array of boolean values and the number of different pixels', async () => {
        const differences = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, true, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];

        const result = await service.createDifferenceSheet(differences, 0);
        expect(result.differences).toEqual([
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, true, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ]);
        expect(result.nbDiffPixels).toEqual(1);
    });

    it('should return a 2D array of boolean values with marked surrounding pixels and the number of different pixels', async () => {
        const differences = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, true, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];

        const result = await service.createDifferenceSheet(differences, 3);
        expect(result.differences).toEqual([
            [false, false, false, true, false, false, false, false],
            [false, false, true, true, true, false, false, false],
            [false, true, true, true, true, true, false, false],
            [true, true, true, true, true, true, true, false],
            [false, true, true, true, true, true, false, false],
            [false, false, true, true, true, false, false, false],
            [false, false, false, true, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ]);
        expect(result.nbDiffPixels).toEqual(25);
    });

    it('should return a 2D array of boolean values and the number of different pixels', async () => {
        const differences = [
            [false, false, true, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];

        const result = await service.createDifferenceSheet(differences, 3);
        expect(result.differences).toEqual([
            [true, true, true, true, true, true, false, false],
            [true, true, true, true, true, false, false, false],
            [false, true, true, true, false, false, false, false],
            [false, false, true, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ]);
        expect(result.nbDiffPixels).toEqual(15);
    });

    it('getDifferencePercentage should return 0 if it has no different pixels', async () => {
        const result = service.getDifferencePercentage(0);
        expect(result).toEqual(0);
    });

    it('getDifferencePercentage should return 20 if it has 20% of different pixels', async () => {
        const result = service.getDifferencePercentage(61440);
        expect(result).toEqual(20);
    });

    it('should return a 2D array of boolean values and the number of different pixels', async () => {
        const differences = [
            [true, true, false, false, false, false, false, false],
            [true, true, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];

        const result = await service.createDifferenceSheet(differences, 3);
        expect(result.differences).toEqual([
            [true, true, true, true, true, false, false, false],
            [true, true, true, true, true, false, false, false],
            [true, true, true, true, false, false, false, false],
            [true, true, true, false, false, false, false, false],
            [true, true, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ]);
        expect(result.nbDiffPixels).toEqual(19);
    });

    it('should return the correct number of differences, difficulty, and clusters', async () => {
        const diffSheetAndDiffPixels = {
            differences: [
                [true, true, false, false, false, false, false, false],
                [true, true, false, false, false, false, false, false],
                [false, false, false, false, false, true, true, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, true, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
            ],
            nbDiffPixels: 6,
        };
        const expectedResult = {
            nbDifferences: 3,
            difficulty: 'facile',
            clusters: [
                [
                    { row: 0, col: 0 },
                    { row: 1, col: 0 },
                    { row: 0, col: 1 },
                    { row: 1, col: 1 },
                ],
                [
                    { row: 2, col: 5 },
                    { row: 2, col: 6 },
                ],
                [{ row: 4, col: 3 }],
            ],
        };

        const result = await service.findDifferenceInformation(diffSheetAndDiffPixels);
        expect(result).toEqual(expectedResult);
    });

    it('should correctly find the clusters in the difference sheet', () => {
        const differenceSheet = [
            [true, true, false, false, false, false, false, false],
            [true, true, false, false, false, false, false, false],
            [false, false, false, false, false, true, true, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, true, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];
        const start = { row: 0, col: 0 };
        const clusters = [];
        const diffNumber = 0;
        clusters[diffNumber] = [];
        service.bfs(differenceSheet, start, clusters, diffNumber);

        expect(clusters).toEqual([
            [
                { row: 0, col: 0 },
                { row: 1, col: 0 },
                { row: 0, col: 1 },
                { row: 1, col: 1 },
            ],
        ]);
    });

    it('isSamePixel should return true if the pixels are the same', async () => {
        const pixel1 = [0, 0, 0];
        const pixel2 = [0, 0, 0];
        expect(service.isSamePixel(pixel1, pixel2)).toBeTruthy();
    });

    it('isSamePixel should return false if the pixels are NOT the same', async () => {
        const pixel1 = [0, 0, 0];
        const pixel2 = [0, 0, 1];
        expect(service.isSamePixel(pixel1, pixel2)).toBeFalsy();
    });

    it('createPixelDifferenceSheet should return a matrix of white pixels if all elements of diffSheet are false', async () => {
        const differences = [
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];

        const pixelDifferenceSheet: number[][][] = service.createPixelDifferenceSheet(differences);

        expect(pixelDifferenceSheet).toEqual([
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
        ]);
    });

    it('createPixelDifferenceSheet should return a matrix of pixels corresponding to the diffSheet', async () => {
        const differences = [
            [true, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, true, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [true, false, false, false, false, false, false, false],
        ];

        const pixelDifferenceSheet: number[][][] = service.createPixelDifferenceSheet(differences);

        expect(pixelDifferenceSheet).toEqual([
            [
                [0, 0, 0],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [0, 0, 0],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
            [
                [0, 0, 0],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ],
        ]);
    });

    it('isDifferentPixel should return an array of coordinates when there is a match', () => {
        const differences = [
            [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ],
            [
                { row: 1, col: 0 },
                { row: 1, col: 1 },
                { row: 1, col: 2 },
            ],
        ];
        const row = 0;
        const col = 1;

        const result = service.isDifferentPixel(differences, row, col);

        expect(result).toEqual([
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
        ]);
    });

    it('isDifferentPixel should return null when provided coordinate is not in array', () => {
        const differences = [
            [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 },
            ],
            [
                { row: 1, col: 0 },
                { row: 1, col: 1 },
                { row: 1, col: 2 },
            ],
        ];
        const row = 2;
        const col = 1;

        const result = service.isDifferentPixel(differences, row, col);

        expect(result).toBeNull();
    });

    it('should return true if the difference is not in the edges', () => {
        const differences = [
            [true, true, false, false, false, false, false, false],
            [true, true, false, false, false, false, false, false],
            [false, false, true, true, true, false, false, false],
            [false, false, true, true, true, false, false, false],
            [false, false, true, true, true, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
        ];

        expect(service.isInteriorDifference(differences, 0, 0)).toBeTruthy();
        expect(service.isInteriorDifference(differences, 3, 3)).toBeTruthy();
    });

    it('should return false if the difference is in the edges', () => {
        const differences = [
            [true, true, false, false, false, false, false, true],
            [true, false, false, false, false, false, false, true],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [true, true, false, false, false, false, false, true],
        ];
        const maxHeight = differences.length - 1;
        const maxWidth = differences[0].length - 1;
        expect(service.isInteriorDifference(differences, 0, 0)).toBeFalsy();
        expect(service.isInteriorDifference(differences, 0, maxHeight)).toBeFalsy();
        expect(service.isInteriorDifference(differences, maxWidth, maxHeight)).toBeFalsy();
        expect(service.isInteriorDifference(differences, maxWidth, 0)).toBeFalsy;
        expect(service.isInteriorDifference(differences, 0, 1)).toBeFalsy();
        expect(service.isInteriorDifference(differences, maxWidth, 1)).toBeFalsy();
        expect(service.isInteriorDifference(differences, 1, 0)).toBeFalsy();
        expect(service.isInteriorDifference(differences, 1, maxHeight)).toBeFalsy();
    });

    it('should return true if the difference is partly in the edges', () => {
        const differences = [
            [true, true, true, false, false, false, true, true],
            [true, true, true, false, false, false, true, true],
            [true, true, false, false, false, false, true, true],
            [false, false, false, false, false, false, false, false],
            [false, false, false, false, false, false, false, false],
            [true, true, false, false, false, false, false, false],
            [true, true, true, false, false, false, true, true],
            [true, true, true, false, false, false, true, true],
        ];
        const maxHeight = differences.length - 1;
        const maxWidth = differences[0].length - 1;
        expect(service.isInteriorDifference(differences, 0, maxHeight)).toBeTruthy();
        expect(service.isInteriorDifference(differences, maxWidth, maxHeight)).toBeTruthy();
        expect(service.isInteriorDifference(differences, maxWidth, 0)).toBeTruthy();
        expect(service.isInteriorDifference(differences, maxWidth, 1)).toBeTruthy();
        expect(service.isInteriorDifference(differences, 0, 1)).toBeTruthy();
        expect(service.isInteriorDifference(differences, 1, 0)).toBeTruthy();
        expect(service.isInteriorDifference(differences, 1, maxHeight)).toBeTruthy();
    });

    it('getDifficulty should return facile if conditions are not respected', () => {
        const difficulty = service.getDifficulty(1, 6);
        expect(difficulty).toEqual('facile');
    });

    it('getDifficulty should return difficile if conditions are respected', () => {
        const difficulty = service.getDifficulty(30000, 8);
        expect(difficulty).toEqual('difficile');
    });
});
