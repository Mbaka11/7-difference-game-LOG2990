import { Injectable } from '@angular/core';
import { DEFAULT_WIDTH } from '@app/common/constants';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseHandler } from './mouse-buttons.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService {
    lastPoint: Vec2 = { x: 0, y: 0 };
    strokeWidth = 1;
    isDrawing = false;
    color: string;
    isErasing = false;

    constructor(public mouseHandler: MouseHandler) {}

    onMouseDown(event: MouseEvent, context: CanvasRenderingContext2D, isEraser: boolean) {
        this.isDrawing = true;
        const coord = this.mouseHandler.getPositionFromMouse(event);
        this.lastPoint = coord;
        this.isErasing = isEraser;
        this.updateCurrentPoint(event, context);
    }

    onMouseMove(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isDrawing) {
            this.updateCurrentPoint(event, context);
        }
    }

    onMouseUp(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isDrawing) {
            this.updateCurrentPoint(event, context);
        }
        this.isDrawing = false;
    }

    onMouseOut(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (this.isDrawing) {
            this.updateCurrentPoint(event, context);
        }
    }

    onMouseEnter(event: MouseEvent) {
        if (this.isDrawing) {
            const coord = this.mouseHandler.getPositionFromMouse(event);
            this.lastPoint = coord;
        }
    }

    updateCurrentPoint(event: MouseEvent, context: CanvasRenderingContext2D) {
        const coord = this.mouseHandler.getPositionFromMouse(event);
        if (coord.x >= 0 && coord.x < DEFAULT_WIDTH && coord.y >= 0 && coord.y < DEFAULT_WIDTH) {
            this.draw(context, this.lastPoint, coord);
            this.lastPoint = coord;
        }
    }

    draw(context: CanvasRenderingContext2D, start: Vec2, end: Vec2) {
        context.beginPath();

        if (start.x === end.x && start.y === end.y) {
            if (this.isErasing) {
                context.rect(start.x - this.strokeWidth, start.y - this.strokeWidth, this.strokeWidth * 2, this.strokeWidth * 2);
                context.fillStyle = 'pink';
                context.lineCap = 'square';
                context.fill();
            } else {
                context.arc(start.x, start.y, this.strokeWidth, 0, 2 * Math.PI);
                context.fillStyle = this.color;
                context.lineCap = 'round';
                context.fill();
            }
        } else {
            if (this.isErasing) {
                context.strokeStyle = 'pink';
            } else {
                context.strokeStyle = this.color;
            }
            context.lineWidth = this.strokeWidth * 2;
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.stroke();
        }
    }
}
