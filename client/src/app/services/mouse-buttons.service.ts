/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MouseHandler {
    mousePosition: Vec2 = { x: 0, y: 0 };
    clicksEnabled = true;

    disableClicks(playbackSpeed: number) {
        this.clicksEnabled = false;
        setTimeout(() => {
            this.clicksEnabled = true;
        }, 1000 / playbackSpeed);
    }

    mouseHitDetect(event: MouseEvent, playbackSpeed: number) {
        if (this.clicksEnabled) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.disableClicks(playbackSpeed);
            return this.mousePosition;
        } else {
            return undefined;
        }
    }

    getPositionFromMouse(event: MouseEvent) {
        return { x: event.offsetX, y: event.offsetY };
    }
}
