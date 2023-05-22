/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { MouseHandler } from './mouse-buttons.service';

describe('MouseHandler', () => {
    let service: MouseHandler;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseHandler);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have mousePosition with x and y properties set to 0', () => {
        expect(service.mousePosition.x).toEqual(0);
        expect(service.mousePosition.y).toEqual(0);
    });

    it('should have clicksEnabled set to true', () => {
        expect(service.clicksEnabled).toBeTruthy();
    });

    it('disableClicks should set clicksEnabled to false and back to true after 1 second', () => {
        jasmine.clock().uninstall();
        jasmine.clock().install();

        service.disableClicks(1);
        expect(service.clicksEnabled).toBeFalsy();
        jasmine.clock().tick(1001);
        expect(service.clicksEnabled).toBeTruthy();

        jasmine.clock().uninstall();
    });

    it('mouseHitDetect should return undefined is clicksEnabled is false', () => {
        service.clicksEnabled = false;
        const response = service.mouseHitDetect(new MouseEvent('click'), 1);
        expect(response).toBe(undefined);
    });

    it('mouseHitDetect should return the mouse position is clicksEnabled is true', () => {
        service.clicksEnabled = true;
        const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 100,
            clientY: 100,
        });

        const disableClicksSpy = spyOn(service, 'disableClicks').and.stub();

        const response = service.mouseHitDetect(mouseEvent, 1);
        expect(response).toEqual({ x: 100, y: 100 });
        expect(disableClicksSpy).toHaveBeenCalled();
    });

    it('mouseHitDetect should return the mouse position is clicksEnabled is true', () => {
        service.clicksEnabled = true;
        const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: 100,
            clientY: 100,
        });

        const disableClicksSpy = spyOn(service, 'disableClicks').and.stub();

        const response = service.mouseHitDetect(mouseEvent, 1);
        expect(response).toEqual({ x: 100, y: 100 });
        expect(disableClicksSpy).toHaveBeenCalled();
    });
});
