/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { TimerService } from './timer.service';

const TIMER_START_VALUE = 0;
const TIMER_INTERVAL_1_SECOND_MILLISECONDS = 100;
const TIMER_INTERVAL_2_SECOND_MILLISECONDS = 50;
const TIMER_INTERVAL_4_SECOND_MILLISECONDS = 25;

const TIME_TEST_1 = 1000;
const TIME_TEST_2 = 60000;
const TIME_TEST_3 = 61000;

const ROOM_NAME = 'roomName_Test';

describe('TimerService', () => {
    let service: TimerService;
    let timerGateway: TimerGateway;

    jest.useFakeTimers();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerService,
                TimerGateway,
                {
                    provide: 'roomName',
                    useValue: ROOM_NAME,
                },
            ],
        }).compile();

        service = module.get<TimerService>(TimerService);
        timerGateway = module.get<TimerGateway>(TimerGateway);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(timerGateway, 'emitTimer').mockImplementation(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(timerGateway, 'emitInvertedEnd').mockImplementation(() => {});
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        jest.spyOn(timerGateway, 'emitTotalGameTimer').mockImplementation(() => {});
    });

    afterEach(() => {
        service.stopTimer();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor()', () => {
        it('should start the timer at 0 and not call timerGateway.emitTimer()', () => {
            const timer = service.timer;
            expect(timer).toBe(0);
            expect(timerGateway.emitTimer).not.toHaveBeenCalled();
        });

        it('should advance the timer by 1 and call 1 time timerGateway.emitTimer()', () => {
            jest.advanceTimersByTime(TIME_TEST_1);

            const time = TIME_TEST_1 / 1000;
            const timer = service.timer;

            expect(timer).toBe(10);

            for (let i = 1; i <= time; i++) {
                expect(timerGateway.emitTimer).toHaveBeenCalledWith(ROOM_NAME, time);
            }

            expect(timerGateway.emitTimer).toHaveBeenCalledTimes(time * 10);
        });

        it('should advance the timer by 1 minute', () => {
            jest.advanceTimersByTime(TIME_TEST_2);

            const time = TIME_TEST_2 / 1000;
            const timer = service.timer;

            expect(timer).toBe(time * 10);

            for (let i = 1; i <= time; i++) {
                expect(timerGateway.emitTimer).toHaveBeenCalledWith(ROOM_NAME, time);
            }

            expect(timerGateway.emitTimer).toHaveBeenCalledTimes(time * 10);
        });

        it('should advance the timer by 1 minute and 1 second', () => {
            jest.advanceTimersByTime(TIME_TEST_3);

            const time = TIME_TEST_3 / 1000;
            const timer = service.timer;

            expect(timer).toBe(610);

            for (let i = 1; i <= time; i++) {
                expect(timerGateway.emitTimer).toHaveBeenCalledWith(ROOM_NAME, time);
            }

            expect(timerGateway.emitTimer).toHaveBeenCalledWith(ROOM_NAME, time);
            expect(timerGateway.emitTimer).toHaveBeenCalledTimes(time * 10);
        });
    });

    it('setInvertedTimer() should set timer to startTimerValue and invert the interval', () => {
        const startTimerValue = 60;

        jest.spyOn(service, 'stopTimer');
        jest.spyOn(global, 'setInterval');

        service.setInvertedTimer(startTimerValue);

        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.timer).toEqual(startTimerValue);
        expect(global.setInterval).toHaveBeenCalledWith(service.callbackSetIntervalInverted, TIMER_INTERVAL_1_SECOND_MILLISECONDS);
    });

    describe('callbackSetIntervalInverted()', () => {
        it('should decrement timer by 60 and emitTimer 60 times', () => {
            const startTimerValue = 650;
            const time = TIME_TEST_3 / 1000;
            jest.spyOn(timerGateway, 'emitTimer');
            service.setInvertedTimer(startTimerValue);
            expect(service.timer).toEqual(startTimerValue);

            jest.advanceTimersByTime(TIME_TEST_3);

            expect(timerGateway.emitTimer).toHaveBeenCalledTimes(time * 10);
        });

        it('should decrement timer by 60 and emitTimer 60 times and emitInvertedEnd', () => {
            const startTimerValue = 600;
            jest.spyOn(timerGateway, 'emitTimer');
            jest.spyOn(service, 'stopTimer');
            service.setInvertedTimer(startTimerValue);
            expect(service.timer).toEqual(startTimerValue);

            jest.advanceTimersByTime(TIME_TEST_3);

            expect(timerGateway.emitTimer).toHaveBeenCalledTimes(600);
            expect(service.stopTimer).toHaveBeenCalled();
            expect(timerGateway.emitInvertedEnd).toHaveBeenCalled();
        });
    });

    it('changeIntervalTox1() should save the interval and set it to TIMER_INTERVAL_1_SECOND_MILLISECONDS', () => {
        jest.spyOn(service, 'stopTimer');
        jest.spyOn(global, 'setInterval');

        service.changeIntervalTox1();

        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.lastInterval).toEqual(TIMER_INTERVAL_1_SECOND_MILLISECONDS);
        expect(global.setInterval).toHaveBeenCalledWith(service.callbackSetInterval, TIMER_INTERVAL_1_SECOND_MILLISECONDS);
    });
    it('changeIntervalTox2() should save the interval and set it to TIMER_INTERVAL_2_SECOND_MILLISECONDS', () => {
        jest.spyOn(service, 'stopTimer');
        jest.spyOn(global, 'setInterval');

        service.changeIntervalTox2();

        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.lastInterval).toEqual(TIMER_INTERVAL_2_SECOND_MILLISECONDS);
        expect(global.setInterval).toHaveBeenCalledWith(service.callbackSetInterval, TIMER_INTERVAL_2_SECOND_MILLISECONDS);
    });

    it('changeIntervalTox4() should save the interval and set it to TIMER_INTERVAL_4_SECOND_MILLISECONDS', () => {
        jest.spyOn(service, 'stopTimer');
        jest.spyOn(global, 'setInterval');

        service.changeIntervalTox4();

        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.lastInterval).toEqual(TIMER_INTERVAL_4_SECOND_MILLISECONDS);
        expect(global.setInterval).toHaveBeenCalledWith(service.callbackSetInterval, TIMER_INTERVAL_4_SECOND_MILLISECONDS);
    });

    describe('stopTimer()', () => {
        it('should clear the interval', () => {
            jest.spyOn(global, 'clearInterval');

            service.stopTimer();
            expect(global.clearInterval).toHaveBeenCalledWith(service.intervalID);
        });
    });

    it('stopTotalGameTimer() should stop totalGameTimer interval', () => {
        jest.spyOn(global, 'clearInterval');

        service.stopTotalGameTimer();

        expect(global.clearInterval).toHaveBeenCalledWith(service.intervalIDTotalGameTimer);
    });

    it('replayTimer() should stop timer and create a new one with last interval', () => {
        jest.spyOn(service, 'stopTimer');
        jest.spyOn(global, 'setInterval');

        service.replayTimer();

        expect(service.stopTimer).toHaveBeenCalled();
        expect(global.setInterval).toHaveBeenCalledWith(service.callbackSetInterval, service.lastInterval);
    });

    it('resetTimer() clearInterval and set this.timer to TIMER_START_VALUE', () => {
        jest.spyOn(global, 'clearInterval');

        service.resetTimer();

        expect(global.clearInterval).toHaveBeenCalledWith(service.intervalID);
        expect(service.timer).toEqual(TIMER_START_VALUE);
    });

    describe('decrementTimer()', () => {
        it('set this.timer to this.timer - decrementValue', () => {
            const timerStartValue = 10;
            service.timer = timerStartValue;
            const decrementValue = 5;

            service.decrementTimer(decrementValue);

            expect(service.timer).toEqual(timerStartValue - decrementValue);
        });
        it('should set this.timer to -1 because value was < 0', () => {
            const timerStartValue = 2;
            service.timer = timerStartValue;
            const decrementValue = 5;

            service.decrementTimer(decrementValue);

            expect(service.timer).toEqual(-1);
        });
    });

    it('incrementTimer() should increment this.timer', () => {
        const incrementValue = 10;
        service.timer = TIMER_START_VALUE;

        service.incrementTimer(incrementValue);

        expect(service.timer).toEqual(TIMER_START_VALUE + incrementValue);
    });
});
