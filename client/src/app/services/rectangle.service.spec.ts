/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/common/constants';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseHandler } from './mouse-buttons.service';

import { RectangleService } from './rectangle.service';

describe('RectangleService', () => {
    let service: RectangleService;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [MouseHandler],
        }).compileComponents();
        service = TestBed.inject(RectangleService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should modify isDrawing, startPoint, startingContext', () => {
        service.isDrawing = false;
        service.startPoint = { x: 0, y: 0 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 1, y: 1 });
        service.onMouseDown(new MouseEvent('mousedown'), ctxStub);
        expect(service.isDrawing).toBeTruthy();
        expect(service.startPoint).toEqual({ x: 1, y: 1 });
        expect(service.startingContext).toEqual(ctxStub);
    });

    it('onMouseMove should not call updateCurrentPoint if service is not updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(false);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseMove(new MouseEvent('mousemove'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call updateCurrentPoint if service is updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(true);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseMove(new MouseEvent('mousemove'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set isDrawing to false and updateCurrent point if service is updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(true);
        service.isDrawing = true;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseUp(new MouseEvent('mouseUp'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
        expect(service.isDrawing).toBeFalsy();
    });

    it('onMouseUp should set isDrawing to false and not call updateCurrent point if service is not updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(false);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseUp(new MouseEvent('mouseUp'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseEnter should not call updateCurrentPoint if service is not updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(false);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseEnter(new MouseEvent('mouseenter'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseEnter should call updateCurrentPoint if service is updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(true);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseEnter(new MouseEvent('mouseenter'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
    });

    it('onMouseOut should not call updateCurrentPoint if service is not updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(false);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseOut(new MouseEvent('mouseout'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseOut should call updateCurrentPoint if service is updating', () => {
        spyOn(service, 'isUpdating').and.returnValue(true);
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseOut(new MouseEvent('mouseout'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
    });

    it('updateCurrentPoint should call draw and change endPoint', () => {
        service.endPoint = { x: 0, y: 0 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 1, y: 1 });
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.updateCurrentPoint(new MouseEvent('mousemove'), ctxStub, true);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.endPoint).toEqual({ x: 1, y: 1 });
    });

    it('updateCurrentPoint should draw square is square mode is enabled', () => {
        service.squareModeIsEnabled = true;
        service.startPoint = { x: 1, y: 1 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 20, y: 30 });
        spyOn(service, 'getSquareEndCoordinates').and.returnValue({ x: 20, y: 20 });
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.updateCurrentPoint(new MouseEvent('mousemove'), ctxStub, true);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.endPoint).toEqual({ x: 20, y: 20 });
    });

    it('draw should draw a rectangle with the correct coordinates', () => {
        service.color = 'red';
        const clearRectSpy = spyOn(ctxStub, 'clearRect').and.stub();
        const beginPathStub = spyOn(ctxStub, 'beginPath').and.stub();
        const rectSpy = spyOn(ctxStub, 'rect').and.stub();
        const fillSpy = spyOn(ctxStub, 'fill').and.stub();
        service.draw(ctxStub, { x: 2, y: 2 }, { x: 5, y: 5 });
        expect(clearRectSpy).toHaveBeenCalled();
        expect(beginPathStub).toHaveBeenCalled();
        expect(rectSpy).toHaveBeenCalledWith(2, 2, 3, 3);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('isUpdating should return true if isDrawing is true and starting context is equal to the param', () => {
        service.isDrawing = true;
        service.startingContext = ctxStub;
        const returnValue = service.isUpdating(ctxStub);
        expect(returnValue).toBeTruthy();
    });

    it('isUpdating should return false if isDrawing is true and starting context is not equal to the param', () => {
        service.isDrawing = true;
        const returnValue = service.isUpdating(ctxStub);
        expect(returnValue).toBeFalsy();
    });

    it('isUpdating should return false if isDrawing is false', () => {
        service.isDrawing = false;
        const returnValue = service.isUpdating(ctxStub);
        expect(returnValue).toBeFalsy();
    });

    it('getSquareSideLength should return the width if width is smaller than height', () => {
        const start: Vec2 = { x: 1, y: 1 };
        const end: Vec2 = { x: 10, y: 20 };
        const result = service.getSquareSideLength(start, end);
        expect(result).toEqual(Math.abs(end.x - start.x));
    });

    it('getSquareSideLength should return the width if width is smaller than height', () => {
        const start: Vec2 = { x: 1, y: 1 };
        const end: Vec2 = { x: 10, y: 20 };
        const result = service.getSquareSideLength(start, end);
        expect(result).toEqual(Math.abs(end.x - start.x));
    });

    it('getSquareSideLength should return the height if width is greater than height', () => {
        const start: Vec2 = { x: 1, y: 1 };
        const end: Vec2 = { x: 30, y: 20 };
        const result = service.getSquareSideLength(start, end);
        expect(result).toEqual(Math.abs(end.y - start.y));
    });

    it('getSquareEndCoordinates should return the smallest difference in x or y between start and end', () => {
        const start: Vec2 = { x: 1, y: 1 };
        const end: Vec2 = { x: 30, y: 20 };
        const result = service.getSquareEndCoordinates(start, end);
        expect(result).toEqual({ x: end.y - start.y + start.x, y: end.y - start.y + start.y });
    });

    it('getSquareEndCoordinates should return values smaller than start if square is in 3rd quadrant', () => {
        const start: Vec2 = { x: 30, y: 30 };
        const end: Vec2 = { x: 15, y: 10 };
        const result = service.getSquareEndCoordinates(start, end);
        expect(result).toEqual({ x: end.x - start.x + start.x, y: end.x - start.x + start.y });
    });

    it('onToggleShift should not call updateCurrentPoint if service is not drawing', () => {
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.isDrawing = false;
        service.onToggleShift(false);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onToggleShift should call updateCurrentPoint if shift key is down', () => {
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.isDrawing = true;
        service.onToggleShift(false);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
    });

    it('drawRectangle should draw a hollow rectangle', () => {
        const start: Vec2 = { x: 1, y: 1 };
        const end: Vec2 = { x: 7, y: 7 };
        const beginPathSpy = spyOn(ctxStub, 'beginPath').and.stub();
        const rectSpy = spyOn(ctxStub, 'rect').and.stub();
        const strokeSpy = spyOn(ctxStub, 'stroke').and.stub();
        service.drawRectangle(ctxStub, start, end);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(rectSpy).toHaveBeenCalledWith(1, 1, 6, 6);
        expect(strokeSpy).toHaveBeenCalled();
    });
});
