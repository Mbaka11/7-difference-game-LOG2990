/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/common/constants';
import { MouseHandler } from './mouse-buttons.service';

import { PencilService } from './pencil.service';

describe('PencilService', () => {
    let service: PencilService;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [MouseHandler],
        }).compileComponents();
        service = TestBed.inject(PencilService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should modify isDrawing, lastPoint', () => {
        service.isDrawing = false;
        service.lastPoint = { x: 0, y: 0 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 1, y: 1 });
        service.onMouseDown(new MouseEvent('mousedown'), ctxStub, false);
        expect(service.isDrawing).toBeTruthy();
        expect(service.lastPoint).toEqual({ x: 1, y: 1 });
    });

    it('onMouseMove should not call updateCurrentPoint if isDrawing is false', () => {
        service.isDrawing = false;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseMove(new MouseEvent('mousemove'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call updateCurrentPoint if isDrawing is true', () => {
        service.isDrawing = true;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseMove(new MouseEvent('mousemove'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
    });

    it('onMouseUp should set isDrawing to false and updateCurrent point if isDrawing was true', () => {
        service.isDrawing = true;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseUp(new MouseEvent('mouseUp'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
        expect(service.isDrawing).toBeFalsy();
    });

    it('onMouseUp should not call updateCurrent point if isDrawing was false', () => {
        service.isDrawing = false;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseUp(new MouseEvent('mouseUp'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseEnter should not update lastPoint if isDrawing is false', () => {
        service.isDrawing = false;
        service.lastPoint = { x: 0, y: 0 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 1, y: 1 });
        service.onMouseEnter(new MouseEvent('mouseenter'));
        expect(service.lastPoint).toEqual({ x: 0, y: 0 });
    });

    it('onMouseEnter should update lastPoint if isDrawing is true', () => {
        service.isDrawing = true;
        service.lastPoint = { x: 0, y: 0 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 1, y: 1 });
        service.onMouseEnter(new MouseEvent('mouseenter'));
        expect(service.lastPoint).toEqual({ x: 1, y: 1 });
    });

    it('onMouseOut should not call updateCurrentPoint if isDrawing is false', () => {
        service.isDrawing = false;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseOut(new MouseEvent('mouseout'), ctxStub);
        expect(updateCurrentPointSpy).not.toHaveBeenCalled();
    });

    it('onMouseOut should call updateCurrentPoint if isDrawing is true', () => {
        service.isDrawing = true;
        const updateCurrentPointSpy = spyOn(service, 'updateCurrentPoint').and.stub();
        service.onMouseOut(new MouseEvent('mouseout'), ctxStub);
        expect(updateCurrentPointSpy).toHaveBeenCalled();
    });

    it('updateCurrentPoint should do nothing if mouseEvent coordinates are outside the canvas limits', () => {
        service.lastPoint = { x: 1, y: 1 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 1000, y: 1000 });
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.updateCurrentPoint(new MouseEvent('mousemove'), ctxStub);
        expect(drawSpy).not.toHaveBeenCalled();
        expect(service.lastPoint).toEqual({ x: 1, y: 1 });
    });

    it('updateCurrentPoint should call draw and change lastPoint if mouseEvent coordinates are inside the canvas limits', () => {
        service.lastPoint = { x: 1, y: 1 };
        spyOn(service.mouseHandler, 'getPositionFromMouse').and.returnValue({ x: 3, y: 3 });
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.updateCurrentPoint(new MouseEvent('mousemove'), ctxStub);
        expect(drawSpy).toHaveBeenCalled();
        expect(service.lastPoint).toEqual({ x: 3, y: 3 });
    });

    it('draw should draw a line with the correct coordinates', () => {
        service.color = 'red';
        service.strokeWidth = 3;
        const beginPathStub = spyOn(ctxStub, 'beginPath').and.stub();
        const moveToSpy = spyOn(ctxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(ctxStub, 'lineTo').and.stub();
        const strokeSpy = spyOn(ctxStub, 'stroke').and.stub();
        service.draw(ctxStub, { x: 2, y: 2 }, { x: 5, y: 5 });
        expect(beginPathStub).toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalledWith(2, 2);
        expect(lineToSpy).toHaveBeenCalledWith(5, 5);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('draw should draw a rectangle is eraser mode is on and start and end coordinates are same', () => {
        service.isErasing = true;
        service.strokeWidth = 1;
        const rectSpy = spyOn(ctxStub, 'rect').and.stub();
        const fillSpy = spyOn(ctxStub, 'fill').and.stub();
        service.draw(ctxStub, { x: 5, y: 10 }, { x: 5, y: 10 });
        expect(rectSpy).toHaveBeenCalledWith(4, 9, 2, 2);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('draw should draw in pink if the eraser is selected', () => {
        service.isErasing = true;
        service.strokeWidth = 1;
        const moveToSpy = spyOn(ctxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(ctxStub, 'lineTo').and.stub();
        const strokeSpy = spyOn(ctxStub, 'stroke').and.stub();
        service.draw(ctxStub, { x: 5, y: 15 }, { x: 5, y: 10 });
        expect(moveToSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
        expect(ctxStub.strokeStyle).toEqual('#ffc0cb');
    });
});
