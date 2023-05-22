/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TimerEvents } from '@app/constants/timer-events';
import { SocketClientService } from './socket-client.service';
import { TimerService } from './timer.service';

const TIMER_ITERATIONS_PER_SECOND = 10;

describe('TimerService', () => {
    let service: TimerService;
    let socketClientService: SocketClientService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketClientService = new SocketClientService();
        socketTestHelper = new SocketTestHelper();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketClientService.socket = socketTestHelper as any;

        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketClientService }],
        });
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getTimer should return the current timer value', () => {
        service.callbackOnGetTimer(120);
        expect(service.getTimer()).toEqual(12);
    });

    it('getTotalGameTimer should return the current totalGameTimer value', () => {
        service.callbackOnGetTotalGameTimer(120);
        expect(service.getTotalGameTimer()).toEqual(12);
    });

    describe('onGetTimer()', () => {
        it('should create a listener with TimerEvents.GetTimer and callback', () => {
            spyOn(socketTestHelper, 'on');

            service.onGetTimer();

            expect(socketTestHelper.on).toHaveBeenCalledWith(TimerEvents.GetTimer, service.callbackOnGetTimer);
        });
    });

    describe('callbackOnGetTimer()', () => {
        it('should call getTimerFormat() with its argument and store the answer in this.timerFormat', () => {
            const timer = 10;
            const timerFormat = '00 : 01';

            spyOn(service, 'getTimerFormat').and.returnValue(timerFormat);

            service.callbackOnGetTimer(timer);

            expect(service.getTimerFormat).toHaveBeenCalledWith(1);
            expect(service.timerFormat).toEqual(timerFormat);
        });
    });

    describe('callbackOnGetTotalGameTimer()', () => {
        it('should store the answer in this.totalGameTimer', () => {
            const totalGameTimerTest = 100;

            service.callbackOnGetTotalGameTimer(totalGameTimerTest);

            const totalGameTimer = service.getTotalGameTimer();
            expect(totalGameTimer).toEqual(totalGameTimerTest / TIMER_ITERATIONS_PER_SECOND);
        });
    });

    describe('getTimerFormat()', () => {
        it('should return 00 : 05', () => {
            const timer = 5;

            const timerFormat = service.getTimerFormat(timer);

            expect(timerFormat).toEqual('00 : 05');
        });
        it('should return 01 : 00', () => {
            const timer = 60;

            const timerFormat = service.getTimerFormat(timer);

            expect(timerFormat).toEqual('01 : 00');
        });
        it('should return 01 : 15', () => {
            const timer = 75;

            const timerFormat = service.getTimerFormat(timer);

            expect(timerFormat).toEqual('01 : 15');
        });
        it('should return 10 : 45', () => {
            const timer = 645;

            const timerFormat = service.getTimerFormat(timer);

            expect(timerFormat).toEqual('10 : 45');
        });
    });

    describe('stopTimer()', () => {
        it('should remove listener TimerEvents.GetTimer from the socket', () => {
            service.onGetTimer();
            const listenerCreated = socketTestHelper.isListenerCreated(TimerEvents.GetTimer);
            expect(listenerCreated).toBeTrue();

            service.stopTimer();
            const listenerDeleted = socketTestHelper.isListenerCreated(TimerEvents.GetTimer);
            expect(listenerDeleted).toBeFalse();
        });
    });

    describe('resetTimer()', () => {
        it('should set this.timerFormat to 00 : 00', () => {
            service.timerFormat = '12 : 34';
            expect(service.timerFormat).toEqual('12 : 34');
            service.resetTimer();
            expect(service.timerFormat).toEqual('00 : 00');
        });
    });

    describe('ngOnDestroy()', () => {
        it('should call this.stopTimer()', () => {
            spyOn(service, 'stopTimer');

            service.ngOnDestroy();

            expect(service.stopTimer).toHaveBeenCalledOnceWith();
        });
    });
});
