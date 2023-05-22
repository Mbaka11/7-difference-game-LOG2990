/* eslint-disable max-lines */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    BLACK_PIXEL,
    BLUE_PIXEL,
    BROWN_PIXEL,
    DEFAULT_HEIGHT,
    DEFAULT_WIDTH,
    GREEN_PIXEL,
    ORANGE_PIXEL,
    PaintOptions,
    PINK_PIXEL,
    PIXEL_BYTE_SIZE,
    PURPLE_PIXEL,
    RED_PIXEL,
    TRANSPARENT_PIXEL,
    WHITE_PIXEL,
    YELLOW_PIXEL,
} from '@app/common/constants';
import { DrawService } from '@app/services/draw.service';
import { PencilService } from '@app/services/pencil.service';
import { RectangleService } from '@app/services/rectangle.service';
import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
    let component: CanvasComponent;
    let rectangleService: jasmine.SpyObj<RectangleService>;
    let pencilService: jasmine.SpyObj<PencilService>;
    let drawService: jasmine.SpyObj<DrawService>;
    let fixture: ComponentFixture<CanvasComponent>;

    beforeEach(async () => {
        rectangleService = jasmine.createSpyObj('RectangleService', [
            'onMouseDown',
            'onMouseMove',
            'onMouseUp',
            'onMouseEnter',
            'onMouseOut',
            'onToggleShift',
        ]);
        pencilService = jasmine.createSpyObj('PencilService', ['onMouseDown', 'onMouseMove', 'onMouseUp', 'onMouseEnter', 'onMouseOut']);
        drawService = jasmine.createSpyObj('DrawService', ['resetCanvas', 'drawPixels']);
        await TestBed.configureTestingModule({
            declarations: [CanvasComponent],
            providers: [
                { provide: RectangleService, useValue: rectangleService },
                { provide: PencilService, useValue: pencilService },
                { provide: DrawService, useValue: drawService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('a change to currentColor should change the variable in pencilService and RectangleService', () => {
        component.currentColor = 'blue';
        component.selectedPaintOption = PaintOptions.Pencil;
        component.ngOnChanges();
        expect(pencilService.color).toEqual('blue');
        expect(rectangleService.color).toEqual('blue');
    });

    it('a change to eraser in selectedPaintOptions should set the color to eraser', () => {
        component.currentColor = 'blue';
        component.selectedPaintOption = PaintOptions.Eraser;
        component.ngOnChanges();
        expect(pencilService.color).toEqual('eraser');
    });

    it('a change in strokeWidth should change the strokeWidth in pencilService', () => {
        component.currentStrokeWidth = 3;
        component.ngOnChanges();
        expect(pencilService.strokeWidth).toEqual(3);
    });

    it('a change to currentColor should change the variable in pencilService and RectangleService', () => {
        component.currentColor = 'blue';
        component.ngOnChanges();
        expect(pencilService.color).toEqual('blue');
        expect(rectangleService.color).toEqual('blue');
        expect(rectangleService.color).toEqual('blue');
    });

    it('mouseDown should call the appropriate service', () => {
        component.mouseDown(new MouseEvent('mousedown'));
        expect(rectangleService.onMouseDown).not.toHaveBeenCalled();
        expect(pencilService.onMouseDown).not.toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Rectangle;
        component.mouseDown(new MouseEvent('mousedown'));
        expect(rectangleService.onMouseDown).toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Pencil;
        component.mouseDown(new MouseEvent('mousedown'));
        expect(pencilService.onMouseDown).toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Eraser;
        component.mouseDown(new MouseEvent('mousedown'));
        expect(pencilService.onMouseDown).toHaveBeenCalled();
    });

    it('mouseMove should call the appropriate service', () => {
        component.selectedPaintOption = PaintOptions.Rectangle;
        component.mouseMove(new MouseEvent('mousemove'));
        expect(rectangleService.onMouseMove).toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Pencil;
        component.mouseMove(new MouseEvent('mousemove'));
        expect(pencilService.onMouseMove).toHaveBeenCalled();
    });

    it('mouseUp should call the appropriate service and processModification', () => {
        const processModificationSpy = spyOn(component, 'processModification').and.stub();
        spyOn(component, 'currentModCanvasHasModification').and.returnValue(true);
        component.selectedPaintOption = PaintOptions.Rectangle;
        component.mouseUp(new MouseEvent('mouseup'));
        expect(rectangleService.onMouseUp).toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Pencil;
        component.mouseUp(new MouseEvent('mouseup'));
        expect(pencilService.onMouseUp).toHaveBeenCalled();
        expect(processModificationSpy).toHaveBeenCalledTimes(2);
    });

    it('mouseEnter should call the appropriate service', () => {
        component.selectedPaintOption = PaintOptions.Rectangle;
        component.mouseEnter(new MouseEvent('mouseenter'));
        expect(rectangleService.onMouseEnter).toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Pencil;
        component.mouseEnter(new MouseEvent('mouseenter'));
        expect(pencilService.onMouseEnter).toHaveBeenCalled();
    });

    it('mouseOut should call the appropriate service', () => {
        const processModificationSpy = spyOn(component, 'processModification').and.stub();
        component.selectedPaintOption = PaintOptions.Rectangle;
        component.mouseOut(new MouseEvent('mouseout'));
        expect(rectangleService.onMouseOut).toHaveBeenCalled();
        component.selectedPaintOption = PaintOptions.Pencil;
        pencilService.isDrawing = true;
        component.mouseOut(new MouseEvent('mouseout'));
        expect(pencilService.onMouseOut).toHaveBeenCalled();
        expect(processModificationSpy).toHaveBeenCalled();
    });

    it('processModification should add a modification if up to date with undos', () => {
        const getDifferentPixelsFromCurrentModSpy = spyOn(component, 'getDifferentPixelsFromCurrentMod').and.returnValue([{ row: 0, col: 0 }]);
        const updateAllModsCanvasSpy = spyOn(component, 'updateAllModsCanvas').and.stub();
        component.modifications = [];
        component.numberOfMods = 0;
        pencilService.color = 'green';
        component.processModification();
        expect(getDifferentPixelsFromCurrentModSpy).toHaveBeenCalled();
        expect(updateAllModsCanvasSpy).toHaveBeenCalled();
        expect(component.modifications.length).toEqual(1);
        expect(component.modifications[0]).toEqual({ points: [{ row: 0, col: 0 }], color: 'green' });
    });

    it('processModification should have the right number of modifications if numberOfMods is behind', () => {
        spyOn(component, 'getDifferentPixelsFromCurrentMod').and.returnValue([{ row: 5, col: 5 }]);
        spyOn(component, 'updateAllModsCanvas').and.stub();
        component.modifications = [
            {
                points: [
                    { row: 0, col: 0 },
                    { row: 1, col: 1 },
                ],
                color: 'red',
            },
            {
                points: [
                    { row: 2, col: 2 },
                    { row: 3, col: 3 },
                ],
                color: 'blue',
            },
        ];
        component.numberOfMods = 1;
        pencilService.color = 'green';
        component.processModification();
        expect(component.modifications.length).toEqual(2);
        expect(component.modifications).toEqual([
            {
                points: [
                    { row: 0, col: 0 },
                    { row: 1, col: 1 },
                ],
                color: 'red',
            },
            {
                points: [{ row: 5, col: 5 }],
                color: 'green',
            },
        ]);
    });

    it('getDifferentPixelsFromCurrentMod should only return the different pixels', () => {
        const currentModCtx = component.getCanvasContext(component.currentModCanvas);
        const data = new Uint8ClampedArray(DEFAULT_WIDTH * DEFAULT_HEIGHT * PIXEL_BYTE_SIZE);
        // Mettre le 2e pixel en rouge
        data[4] = 255;
        data[7] = 255;
        // Mettre le 5e pixel en vert
        data[17] = 255;
        data[19] = 255;

        spyOn(currentModCtx, 'getImageData').and.returnValue({ data, colorSpace: 'srgb', width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
        const differentPixels = component.getDifferentPixelsFromCurrentMod();
        expect(differentPixels.length).toEqual(2);
        expect(differentPixels[0]).toEqual({ row: 0, col: 1 });
        expect(differentPixels[1]).toEqual({ row: 0, col: 4 });
    });

    it('updateAllModsCanvas should call its 3 functions', () => {
        const getCanvasContextSpy = spyOn(component, 'getCanvasContext').and.stub();
        const getUpdatedPixels = spyOn(component, 'getUpdatedPixels').and.stub();
        component.updateAllModsCanvas();
        expect(getCanvasContextSpy).toHaveBeenCalled();
        expect(getUpdatedPixels).toHaveBeenCalled();
        expect(drawService.drawPixels).toHaveBeenCalled();
    });

    it('getUpdatedPixels should return differentPixels where there were modifications', () => {
        component.numberOfMods = 2;
        component.modifications = [
            {
                points: [
                    { row: 0, col: 0 },
                    { row: 1, col: 1 },
                ],
                color: 'red',
            },
            {
                points: [{ row: 2, col: 2 }],
                color: 'green',
            },
        ];
        const updatedPixels: number[][][] = component.getUpdatedPixels();
        expect(updatedPixels[0][0]).toEqual(RED_PIXEL);
        expect(updatedPixels[1][1]).toEqual(RED_PIXEL);
        expect(updatedPixels[2][2]).toEqual(GREEN_PIXEL);
        expect(updatedPixels[0][2]).toEqual(TRANSPARENT_PIXEL);
    });

    it('getPixel should return the appropriate pixel', () => {
        const redPixel = component.getPixel('red');
        const orangePixel = component.getPixel('orange');
        const yellowPixel = component.getPixel('yellow');
        const browPixel = component.getPixel('brown');
        const pinkPixel = component.getPixel('pink');
        const purplePixel = component.getPixel('purple');
        const bluePixel = component.getPixel('blue');
        const greenPixel = component.getPixel('green');
        const whitePixel = component.getPixel('white');
        const blackPixel = component.getPixel('black');
        const eraserPixel = component.getPixel('eraser');
        const badInputPixel = component.getPixel('badInput');
        expect(redPixel).toEqual(RED_PIXEL);
        expect(orangePixel).toEqual(ORANGE_PIXEL);
        expect(yellowPixel).toEqual(YELLOW_PIXEL);
        expect(browPixel).toEqual(BROWN_PIXEL);
        expect(pinkPixel).toEqual(PINK_PIXEL);
        expect(purplePixel).toEqual(PURPLE_PIXEL);
        expect(bluePixel).toEqual(BLUE_PIXEL);
        expect(greenPixel).toEqual(GREEN_PIXEL);
        expect(whitePixel).toEqual(WHITE_PIXEL);
        expect(blackPixel).toEqual(BLACK_PIXEL);
        expect(eraserPixel).toEqual(TRANSPARENT_PIXEL);
        expect(badInputPixel).toEqual(TRANSPARENT_PIXEL);
    });

    it('resetForeground should reset numberOfMods, modifications and call updateAllModsCanvas()', () => {
        component.numberOfMods = 1;
        component.modifications = [
            {
                points: [
                    { row: 0, col: 0 },
                    { row: 1, col: 1 },
                ],
                color: 'red',
            },
        ];
        const updateAllModsCanvasSpy = spyOn(component, 'updateAllModsCanvas').and.stub();
        component.resetForeground();
        expect(component.numberOfMods).toEqual(0);
        expect(component.modifications).toEqual([]);
        expect(updateAllModsCanvasSpy).toHaveBeenCalled();
    });

    it('undo should decrement numberOfMods if greater than 0 and updateAllModsCanvas', () => {
        const updateAllModsCanvasSpy = spyOn(component, 'updateAllModsCanvas').and.stub();
        component.numberOfMods = 2;
        component.undo();
        expect(updateAllModsCanvasSpy).toHaveBeenCalled();
        expect(component.numberOfMods).toEqual(1);
    });

    it('undo should not decrement numberOfMods if it is 0', () => {
        component.numberOfMods = 0;
        component.undo();
        expect(component.numberOfMods).toEqual(0);
    });

    it('redo should increment numberOfMods if less than length of modifications and updateAllModsCanvas', () => {
        const updateAllModsCanvasSpy = spyOn(component, 'updateAllModsCanvas').and.stub();
        component.numberOfMods = 0;
        component.modifications = [
            {
                points: [
                    { row: 0, col: 0 },
                    { row: 1, col: 1 },
                ],
                color: 'red',
            },
        ];
        component.redo();
        expect(updateAllModsCanvasSpy).toHaveBeenCalled();
        expect(component.numberOfMods).toEqual(1);
    });

    it('redo should not increment numberOfMods if it is equal to the length of modifications', () => {
        component.numberOfMods = 0;
        component.modifications = [];
        component.undo();
        expect(component.numberOfMods).toEqual(0);
    });

    it('currentModCanvasHasModification should return true of currentMods has modifications', () => {
        spyOn(component, 'getDifferentPixelsFromCurrentMod').and.returnValue([
            { row: 0, col: 0 },
            { row: 1, col: 1 },
        ]);
        const returnValue: boolean = component.currentModCanvasHasModification();
        expect(returnValue).toBeTruthy();
    });

    it('currentModCanvasHasModification should return false of currentMods does not have modifications', () => {
        spyOn(component, 'getDifferentPixelsFromCurrentMod').and.returnValue([]);
        const returnValue: boolean = component.currentModCanvasHasModification();
        expect(returnValue).toBeFalsy();
    });

    it('pressing shift should call rectangleService.onToggleShift with true param', () => {
        const event = new KeyboardEvent('keydown', { key: 'shift' });
        document.dispatchEvent(event);
        expect(component.rectangleService.onToggleShift).toHaveBeenCalledWith(true);
    });

    it('releasing shift should call rectangleService.onToggleShift with false param', () => {
        const event = new KeyboardEvent('keyup', { key: 'shift' });
        document.dispatchEvent(event);
        expect(component.rectangleService.onToggleShift).toHaveBeenCalledWith(false);
    });
});
