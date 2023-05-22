/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ElementRef, Injectable } from '@angular/core';
import { BLACK_PIXEL, DEFAULT_HEIGHT, DEFAULT_WIDTH, PIXEL_BYTE_SIZE, WHITE_PIXEL } from '@app/common/constants';
import { CanvasComponent } from '@app/components/canvas/canvas.component';
import { Vec2 } from '@app/interfaces/vec2';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    context: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        this.context.beginPath();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 3;

        this.context.moveTo((this.width * 3) / 10, (this.height * 4) / 10);
        this.context.lineTo((this.width * 7) / 10, (this.height * 4) / 10);

        this.context.moveTo((this.width * 3) / 10, (this.height * 6) / 10);
        this.context.lineTo((this.width * 7) / 10, (this.height * 6) / 10);

        this.context.moveTo((this.width * 4) / 10, (this.height * 3) / 10);
        this.context.lineTo((this.width * 4) / 10, (this.height * 7) / 10);

        this.context.moveTo((this.width * 6) / 10, (this.height * 3) / 10);
        this.context.lineTo((this.width * 6) / 10, (this.height * 7) / 10);

        this.context.stroke();
    }

    drawWord(context: CanvasRenderingContext2D, word: string, coordinates: Vec2) {
        const savedImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        const startPosition: Vec2 = { x: coordinates.x, y: coordinates.y };
        const step = 20;
        context.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            context.fillText(word[i], startPosition.x + step * i, startPosition.y);
        }
        setTimeout(() => {
            context.clearRect(startPosition.x, startPosition.y - step, word.length * step, step);
            context.putImageData(savedImageData, 0, 0);
        }, 1000);
    }

    drawImg(ctx: CanvasRenderingContext2D, url: string) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        };
        img.src = url;
    }

    drawToCanvas(img: HTMLImageElement, ctx: CanvasRenderingContext2D) {
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
    }

    async drawImgUrl(imgRef: ElementRef<HTMLCanvasElement>, url: string): Promise<number[][][]> {
        const canvas = imgRef.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = DEFAULT_WIDTH;
        canvas.height = DEFAULT_HEIGHT;
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                resolve('res');
            };
        });

        return this.getPixelMatrix(ctx.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT).data, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    resetCanvas(imgRef: ElementRef<HTMLCanvasElement>) {
        const canvas = imgRef.nativeElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawPixels(pixels: number[][][], context: CanvasRenderingContext2D) {
        const imageData = context.createImageData(DEFAULT_WIDTH, DEFAULT_HEIGHT);
        imageData.data.set(this.flatten3DArray(pixels));
        context.putImageData(imageData, 0, 0);
    }

    flatten3DArray(array: number[][][]) {
        const flattenedArray = [];
        for (const row of array) {
            for (const col of row) {
                for (const element of col) {
                    flattenedArray.push(element);
                }
            }
        }
        return flattenedArray;
    }

    drawToMergeCanvas(backgroundCtx: CanvasRenderingContext2D, foreground: CanvasComponent, mergeCtx: CanvasRenderingContext2D) {
        const backgroundData: Uint8ClampedArray = backgroundCtx.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT).data;
        const backgroundPixels: number[][][] = this.getPixelMatrix(backgroundData, DEFAULT_WIDTH, DEFAULT_HEIGHT);

        const foregroundCanvas = foreground.allModsCanvas.nativeElement;
        const foregroundCtx = foregroundCanvas.getContext('2d') as CanvasRenderingContext2D;
        const foregroundData: Uint8ClampedArray = foregroundCtx.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT).data;
        const foregroundPixels: number[][][] = this.getPixelMatrix(foregroundData, DEFAULT_WIDTH, DEFAULT_HEIGHT);

        const mergePixels: number[][][] = [];

        for (let i = 0; i < DEFAULT_HEIGHT; i++) {
            mergePixels[i] = [];
            for (let j = 0; j < DEFAULT_WIDTH; j++) {
                mergePixels[i][j] = this.isTransparentPixel(foregroundPixels[i][j]) ? backgroundPixels[i][j] : foregroundPixels[i][j];
            }
        }
        this.drawPixels(mergePixels, mergeCtx);
    }

    getPixelMatrix(rawData: Uint8ClampedArray, width: number, height: number): number[][][] {
        const pixelMatrix: number[][][] = [];
        for (let i = 0; i < height; i++) {
            pixelMatrix[i] = [];
            for (let j = 0; j < width; j++) {
                const byteIndex = (i * width + j) * PIXEL_BYTE_SIZE;
                const r = rawData[byteIndex];
                const g = rawData[byteIndex + 1];
                const b = rawData[byteIndex + 2];
                const a = rawData[byteIndex + 3];
                pixelMatrix[i][j] = [r, g, b, a];
            }
        }
        return pixelMatrix;
    }

    drawDifferenceToBlankCanvas(difference: Coordinate[], ctx: CanvasRenderingContext2D) {
        const pixels: number[][][] = [];
        for (let i = 0; i < DEFAULT_HEIGHT; i++) {
            pixels[i] = [];
            for (let j = 0; j < DEFAULT_WIDTH; j++) {
                pixels[i][j] = WHITE_PIXEL;
            }
        }
        for (const coord of difference) {
            pixels[coord.row][coord.col] = BLACK_PIXEL;
        }
        this.drawPixels(pixels, ctx);
    }

    isTransparentPixel(pixel: number[]): boolean {
        // Si l'octet alpha est a 0, le pixel est transparent
        return pixel[3] === 0;
    }
}
