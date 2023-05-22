/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/common/constants';
import { CanvasComponent } from '@app/components/canvas/canvas.component';
import { DrawService } from '@app/services/draw.service';
import { Coordinate } from '@common/coordinate';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;
    let ctxStub2: CanvasRenderingContext2D;
    let canvas: CanvasComponent;
    let fixture: ComponentFixture<CanvasComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [DrawService] });
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        ctxStub2 = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        fixture = TestBed.createComponent(CanvasComponent);
        canvas = fixture.componentInstance;
        fixture.detectChanges();
        service.context = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(DEFAULT_WIDTH);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service.height).toEqual(DEFAULT_HEIGHT);
    });

    it(' drawWord should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        service.drawWord(ctxStub, 'test', { x: 0, y: 0 });
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawWord should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        service.drawWord(ctxStub, '', { x: 0, y: 0 });
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

    it(' drawWord should call fillText as many times as letters in a word', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        const word = 'test';
        service.drawWord(ctxStub, word, { x: 0, y: 0 });
        expect(fillTextSpy).toHaveBeenCalledTimes(word.length);
    });

    it(' drawWord should color pixels on the canvas', () => {
        let imageData = service.context.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawWord(ctxStub, 'test', { x: 1, y: 1 });
        imageData = service.context.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawWord should clear the canvas after a set timeout', () => {
        jasmine.clock().uninstall();
        jasmine.clock().install();
        spyOn(ctxStub, 'clearRect');
        spyOn(ctxStub, 'putImageData');

        service.drawWord(ctxStub, 'test', { x: 0, y: 0 });

        jasmine.clock().tick(1001);

        expect(ctxStub.clearRect).toHaveBeenCalled();
        expect(ctxStub.putImageData).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('drawGrid should call moveTo and lineTo 4 times', () => {
        const expectedCallTimes = 4;
        const moveToSpy = spyOn(service.context, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.context, 'lineTo').and.callThrough();
        service.drawGrid();
        expect(moveToSpy).toHaveBeenCalledTimes(expectedCallTimes);
        expect(lineToSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('drawGrid should color pixels on the canvas', () => {
        let imageData = service.context.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.context.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawImg should draw image on provided context', () => {
        const url = 'url';
        const drawImageSpy = spyOn(ctxStub, 'drawImage');
        const imgStub = jasmine.createSpyObj('HTMLImageElement', ['onload']);
        spyOn(window, 'Image').and.returnValue(imgStub);

        service.drawImg(ctxStub, url);

        expect(imgStub.src).toBe(url);
        expect(imgStub.onload).toBeDefined();
        imgStub.onload();
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('drawToCanvas should draw the image on the provided canvas', () => {
        const img = new Image();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(img as any, 'onload').and.callFake(() => {
            ctxStub.drawImage(img, 0, 0);
        });
        service.drawToCanvas(img, ctxStub);
        img.dispatchEvent(new Event('load'));
    });

    it('drawImageUrl should set the canvas width and height to 640 and 480 respectively', async () => {
        const canvasRef = { nativeElement: document.createElement('canvas') };
        service.drawImgUrl(canvasRef, 'test-url');
        expect(canvasRef.nativeElement.width).toEqual(640);
        expect(canvasRef.nativeElement.height).toEqual(480);
    });

    it('resetCanvas should clear the canvas', () => {
        const modifiedRef = document.createElement('canvas');
        const canvasRef = { nativeElement: modifiedRef };
        const context = modifiedRef.getContext('2d') as CanvasRenderingContext2D;
        context.fillRect(0, 0, modifiedRef.width, modifiedRef.height);
        service.resetCanvas(canvasRef);
        expect(context.getImageData(0, 0, modifiedRef.width, modifiedRef.height).data).toEqual(
            new Uint8ClampedArray(modifiedRef.width * modifiedRef.height * 4),
        );
    });

    it('flatten3DArray should return a one-dimensional array with correct order', () => {
        const testValues = [
            [
                [1, 2, 3],
                [4, 5, 6],
            ],
            [
                [11, 12, 13],
                [14, 15, 16],
            ],
        ];
        const result = service.flatten3DArray(testValues);
        expect(result.length).toEqual(12);
        expect(result).toEqual([1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16]);
    });

    it('drawPixels should draw pixels on the canvas', () => {
        const pixels: number[][][] = [];
        for (let i = 0; i < DEFAULT_HEIGHT; i++) {
            pixels[i] = [];
            for (let j = 0; j < DEFAULT_WIDTH; j++) {
                pixels[i][j] = [0, 0, 0, 0];
            }
        }
        pixels[0][1] = [255, 0, 0, 255];

        service.drawPixels(pixels, ctxStub);
        const imageData = ctxStub.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT).data;
        const flattenedPixels = service.flatten3DArray(pixels);
        expect(Array.from(imageData)).toEqual(flattenedPixels);
    });

    it('drawToMergeCanvas should combine the pixels of both canvases', async () => {
        const foregroundPixels: number[][][] = [];
        const backgroundPixels: number[][][] = [];
        for (let i = 0; i < DEFAULT_HEIGHT; i++) {
            foregroundPixels[i] = [];
            backgroundPixels[i] = [];
            for (let j = 0; j < DEFAULT_WIDTH; j++) {
                foregroundPixels[i][j] = [0, 0, 0, 0];
                backgroundPixels[i][j] = [0, 0, 0, 0];
            }
        }
        backgroundPixels[0][0] = [255, 255, 0, 255];
        foregroundPixels[1][1] = [255, 0, 0, 255];

        const foregroundCanvas = canvas.allModsCanvas.nativeElement;
        const foregroundCtx = foregroundCanvas.getContext('2d') as CanvasRenderingContext2D;

        service.drawPixels(backgroundPixels, ctxStub);
        service.drawPixels(foregroundPixels, foregroundCtx);

        service.drawToMergeCanvas(ctxStub, canvas, ctxStub2);

        const resultData = ctxStub2.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT).data;
        const pixelData: number[][][] = service.getPixelMatrix(resultData, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        expect(pixelData[0][0]).toEqual([255, 255, 0, 255]);
        expect(pixelData[1][1]).toEqual([255, 0, 0, 255]);
        expect(pixelData[3][3]).toEqual([0, 0, 0, 0]);
    });

    it('drawDifferenceToBlankCanvas should draw to canvas', () => {
        const difference: Coordinate[] = [{ row: 0, col: 0 }];
        const drawPixelsSpy = spyOn(service, 'drawPixels').and.stub();
        service.drawDifferenceToBlankCanvas(difference, ctxStub);
        expect(drawPixelsSpy).toHaveBeenCalled();
    });

    it('should draw black pixels on the coordinates in the difference array and white pixels elsewhere', () => {
        const difference: Coordinate[] = [
            { row: 10, col: 10 },
            { row: 20, col: 20 },
            { row: 30, col: 30 },
        ];

        service.drawDifferenceToBlankCanvas(difference, ctxStub);
        const imageData = ctxStub.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const row = Math.floor(i / (4 * DEFAULT_WIDTH));
            const col = (i / 4) % DEFAULT_WIDTH;
            const coord = { row, col };
            if (difference.some((c) => c.row === coord.row && c.col === coord.col)) {
                expect(data[i]).toEqual(0);
                expect(data[i + 1]).toEqual(0);
                expect(data[i + 2]).toEqual(0);
                expect(data[i + 3]).toEqual(255);
            } else {
                expect(data[i]).toEqual(255);
                expect(data[i + 1]).toEqual(255);
                expect(data[i + 2]).toEqual(255);
                expect(data[i + 3]).toEqual(255);
            }
        }
    });
});
