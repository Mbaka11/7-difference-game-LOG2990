import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import {
    BLACK_PIXEL,
    BLUE_PIXEL,
    BROWN_PIXEL,
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
    GREEN_PIXEL,
    ORANGE_PIXEL,
    PINK_PIXEL,
    PIXEL_BYTE_SIZE,
    PURPLE_PIXEL,
    PaintOptions,
    RED_PIXEL,
    TRANSPARENT_PIXEL,
    WHITE_PIXEL,
    YELLOW_PIXEL,
} from '@app/common/constants';
import { Modification } from '@app/interfaces/modification';
import { DrawService } from '@app/services/draw.service';
import { PencilService } from '@app/services/pencil.service';
import { RectangleService } from '@app/services/rectangle.service';
import { Coordinate } from '@common/coordinate';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnChanges {
    @ViewChild('currentModification') currentModCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifications') allModsCanvas: ElementRef<HTMLCanvasElement>;
    @Input() currentColor: string;
    @Input() currentStrokeWidth: number;
    @Input() selectedPaintOption: PaintOptions;
    @Output() addDifference = new EventEmitter<CanvasComponent>();

    modifications: Modification[] = [];
    numberOfMods = 0;

    constructor(public pencilService: PencilService, public drawService: DrawService, public rectangleService: RectangleService) {
        pencilService.color = this.currentColor;
        pencilService.strokeWidth = this.currentStrokeWidth;
        rectangleService.color = this.currentColor;
    }

    @HostListener('document:keydown.shift') shiftDown() {
        this.rectangleService.onToggleShift(true);
    }

    @HostListener('document:keyup.shift') shiftUp() {
        this.rectangleService.onToggleShift(false);
    }

    ngOnChanges() {
        if (this.selectedPaintOption !== PaintOptions.Eraser) {
            this.pencilService.color = this.currentColor;
            this.rectangleService.color = this.currentColor;
        } else {
            this.pencilService.color = 'eraser';
        }
        this.pencilService.strokeWidth = this.currentStrokeWidth;
    }

    mouseDown(event: MouseEvent) {
        switch (this.selectedPaintOption) {
            case PaintOptions.Rectangle:
                this.rectangleService.onMouseDown(event, this.getCanvasContext(this.currentModCanvas));
                break;
            case PaintOptions.Pencil:
                this.pencilService.onMouseDown(event, this.getCanvasContext(this.currentModCanvas), false);
                break;
            case PaintOptions.Eraser:
                this.pencilService.onMouseDown(event, this.getCanvasContext(this.currentModCanvas), true);
                break;
            default:
                break;
        }
    }

    mouseMove(event: MouseEvent) {
        if (this.selectedPaintOption === PaintOptions.Rectangle) {
            this.rectangleService.onMouseMove(event, this.getCanvasContext(this.currentModCanvas));
        } else {
            this.pencilService.onMouseMove(event, this.getCanvasContext(this.currentModCanvas));
        }
    }

    mouseUp(event: MouseEvent) {
        if (this.selectedPaintOption === PaintOptions.Rectangle) {
            this.rectangleService.onMouseUp(event, this.getCanvasContext(this.currentModCanvas));
        } else {
            this.pencilService.onMouseUp(event, this.getCanvasContext(this.currentModCanvas));
        }
        if (this.currentModCanvasHasModification()) {
            this.processModification();
        }
    }

    mouseOut(event: MouseEvent) {
        if (this.selectedPaintOption === PaintOptions.Rectangle) {
            this.rectangleService.onMouseOut(event, this.getCanvasContext(this.currentModCanvas));
        } else {
            this.pencilService.onMouseOut(event, this.getCanvasContext(this.currentModCanvas));
            if (this.pencilService.isDrawing) {
                this.processModification();
            }
        }
    }

    mouseEnter(event: MouseEvent) {
        if (this.selectedPaintOption === PaintOptions.Rectangle) {
            this.rectangleService.onMouseEnter(event, this.getCanvasContext(this.currentModCanvas));
        } else {
            this.pencilService.onMouseEnter(event);
        }
    }

    processModification() {
        const differentPixels: Coordinate[] = this.getDifferentPixelsFromCurrentMod();
        if (this.numberOfMods < this.modifications.length) {
            this.modifications.splice(this.numberOfMods);
        }
        this.modifications.push({ points: differentPixels, color: this.pencilService.color });
        this.numberOfMods++;
        this.addDifference.emit(this);
        this.drawService.resetCanvas(this.currentModCanvas);
        this.updateAllModsCanvas();
    }

    getDifferentPixelsFromCurrentMod(): Coordinate[] {
        const currentModCtx = this.getCanvasContext(this.currentModCanvas);
        const data: Uint8ClampedArray = currentModCtx.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT).data;

        const differentPixels: Coordinate[] = [];
        for (let i = 0; i < DEFAULT_HEIGHT; i++) {
            for (let j = 0; j < DEFAULT_WIDTH; j++) {
                const r = data[(i * DEFAULT_WIDTH + j) * PIXEL_BYTE_SIZE];
                const g = data[(i * DEFAULT_WIDTH + j) * PIXEL_BYTE_SIZE + 1];
                const b = data[(i * DEFAULT_WIDTH + j) * PIXEL_BYTE_SIZE + 2];
                const a = data[(i * DEFAULT_WIDTH + j) * PIXEL_BYTE_SIZE + 3];
                if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
                    differentPixels.push({ row: i, col: j });
                }
            }
        }

        return differentPixels;
    }

    updateAllModsCanvas() {
        const allModsCtx = this.getCanvasContext(this.allModsCanvas);
        const pixels = this.getUpdatedPixels();
        this.drawService.drawPixels(pixels, allModsCtx);
    }

    getUpdatedPixels(): number[][][] {
        const pixels: number[][][] = [];
        for (let i = 0; i < DEFAULT_HEIGHT; i++) {
            pixels[i] = [];
            for (let j = 0; j < DEFAULT_WIDTH; j++) {
                pixels[i][j] = [0, 0, 0, 0];
            }
        }

        for (let i = 0; i < this.numberOfMods; i++) {
            for (const coord of this.modifications[i].points) {
                pixels[coord.row][coord.col] = this.getPixel(this.modifications[i].color);
            }
        }

        return pixels;
    }

    getPixel(color: string): number[] {
        switch (color) {
            case 'red':
                return RED_PIXEL;
            case 'orange':
                return ORANGE_PIXEL;
            case 'yellow':
                return YELLOW_PIXEL;
            case 'brown':
                return BROWN_PIXEL;
            case 'pink':
                return PINK_PIXEL;
            case 'purple':
                return PURPLE_PIXEL;
            case 'blue':
                return BLUE_PIXEL;
            case 'green':
                return GREEN_PIXEL;
            case 'white':
                return WHITE_PIXEL;
            case 'black':
                return BLACK_PIXEL;
            case 'eraser':
                return TRANSPARENT_PIXEL;
            default:
                return TRANSPARENT_PIXEL;
        }
    }

    getCanvasContext(canvas: ElementRef<HTMLCanvasElement>): CanvasRenderingContext2D {
        const canvasElement = canvas.nativeElement;
        return canvasElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    }

    resetForeground() {
        this.modifications = [];
        this.numberOfMods = 0;
        this.updateAllModsCanvas();
    }

    undo() {
        if (this.numberOfMods > 0) {
            this.numberOfMods--;
        }
        this.updateAllModsCanvas();
    }

    redo() {
        if (this.numberOfMods < this.modifications.length) {
            this.numberOfMods++;
        }
        this.updateAllModsCanvas();
    }

    currentModCanvasHasModification() {
        return this.getDifferentPixelsFromCurrentMod().length !== 0;
    }
}
