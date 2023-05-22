import { Injectable } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/common/constants';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseHandler } from './mouse-buttons.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService {
    isDrawing = false;
    color: string;
    startPoint: Vec2;
    endPoint: Vec2;
    mousePoint: Vec2;
    startingContext: CanvasRenderingContext2D;
    squareModeIsEnabled: boolean;

    constructor(public mouseHandler: MouseHandler) {}

    onMouseDown(event: MouseEvent, context: CanvasRenderingContext2D) {
        this.squareModeIsEnabled = event.shiftKey;
        this.isDrawing = true;
        const coord = this.mouseHandler.getPositionFromMouse(event);
        this.startPoint = coord;
        this.startingContext = context;
    }

    onMouseMove(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isUpdating(context)) {
            this.updateCurrentPoint(event, context, true);
        }
    }

    onMouseUp(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isUpdating(context)) {
            this.updateCurrentPoint(event, context, true);
        }
        this.isDrawing = false;
    }

    onMouseOut(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isUpdating(context)) {
            this.updateCurrentPoint(event, context, true);
        }
    }

    onMouseEnter(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isUpdating(context)) {
            this.updateCurrentPoint(event, context, true);
        }
    }

    updateCurrentPoint(event: MouseEvent, context: CanvasRenderingContext2D, hasRealMouseEvent: boolean) {
        if (hasRealMouseEvent) {
            this.mousePoint = this.mouseHandler.getPositionFromMouse(event);
        }
        this.endPoint = this.squareModeIsEnabled ? this.getSquareEndCoordinates(this.startPoint, this.mousePoint) : this.mousePoint;
        this.draw(context, this.startPoint, this.endPoint);
    }

    draw(context: CanvasRenderingContext2D, start: Vec2, end: Vec2) {
        context.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        context.fillStyle = this.color;
        const rectWidth = this.getRectWidth(start, end);
        const rectHeight = this.getRectHeight(start, end);
        context.beginPath();
        context.rect(start.x, start.y, rectWidth, rectHeight);
        context.fill();
    }

    drawRectangle(context: CanvasRenderingContext2D, start: Vec2, end: Vec2) {
        context.strokeStyle = 'red';
        const rectWidth = this.getRectWidth(start, end);
        const rectHeight = this.getRectHeight(start, end);
        context.beginPath();
        context.rect(start.x, start.y, rectWidth, rectHeight);
        context.stroke();
    }

    isUpdating(context: CanvasRenderingContext2D): boolean {
        return this.isDrawing && this.startingContext === context;
    }

    getRectWidth(start: Vec2, end: Vec2) {
        return end.x - start.x;
    }

    getRectHeight(start: Vec2, end: Vec2) {
        return end.y - start.y;
    }

    getSquareSideLength(start: Vec2, end: Vec2) {
        const absWidth = Math.abs(this.getRectWidth(start, end));
        const absHeight = Math.abs(this.getRectHeight(start, end));
        return absWidth < absHeight ? absWidth : absHeight;
    }

    getSquareEndCoordinates(start: Vec2, end: Vec2): Vec2 {
        const sideLength = this.getSquareSideLength(start, end);
        const x = end.x > start.x ? start.x + sideLength : start.x - sideLength;
        const y = end.y > start.y ? start.y + sideLength : start.y - sideLength;
        return { x, y };
    }

    onToggleShift(isShiftDown: boolean) {
        this.squareModeIsEnabled = isShiftDown;
        if (this.isDrawing) {
            const artificialMouseEvent = new MouseEvent('mousemove');
            this.updateCurrentPoint(artificialMouseEvent, this.startingContext, false);
        }
    }
}
