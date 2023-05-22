import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { Inject, Injectable } from '@nestjs/common';

const TIMER_START_VALUE = 0;
const TIMER_INTERVAL_1_SECOND_MILLISECONDS = 100;
const TIMER_INTERVAL_2_SECOND_MILLISECONDS = 50;
const TIMER_INTERVAL_4_SECOND_MILLISECONDS = 25;

@Injectable()
export class TimerService {
    timer: number = TIMER_START_VALUE;
    totalGameTimer: number = TIMER_START_VALUE;
    intervalID: NodeJS.Timer;
    intervalIDTotalGameTimer: NodeJS.Timer;
    lastInterval: number = TIMER_INTERVAL_1_SECOND_MILLISECONDS;

    constructor(private readonly timerGateway: TimerGateway, @Inject('roomName') private readonly roomName: string) {
        this.intervalID = setInterval(this.callbackSetInterval, TIMER_INTERVAL_1_SECOND_MILLISECONDS);
        this.intervalIDTotalGameTimer = setInterval(this.callbackSetIntervalTotalGameTime, TIMER_INTERVAL_1_SECOND_MILLISECONDS);
    }

    callbackSetInterval = (): void => {
        this.timer++;
        this.timerGateway.emitTimer(this.roomName, this.timer);
    };

    callbackSetIntervalTotalGameTime = (): void => {
        this.totalGameTimer++;
        this.timerGateway.emitTotalGameTimer(this.roomName, this.totalGameTimer);
    };

    setInvertedTimer(startTimerValue: number): void {
        this.stopTimer();
        this.timer = startTimerValue;
        this.intervalID = setInterval(this.callbackSetIntervalInverted, TIMER_INTERVAL_1_SECOND_MILLISECONDS);
    }

    callbackSetIntervalInverted = (): void => {
        this.timer--;
        this.timerGateway.emitTimer(this.roomName, this.timer);
        if (this.timer === 0) {
            this.stopTimer();
            this.timerGateway.emitInvertedEnd(this.roomName);
        }
    };

    changeIntervalTox1(): void {
        this.stopTimer();
        this.lastInterval = TIMER_INTERVAL_1_SECOND_MILLISECONDS;
        this.intervalID = setInterval(this.callbackSetInterval, TIMER_INTERVAL_1_SECOND_MILLISECONDS);
    }

    changeIntervalTox2(): void {
        this.stopTimer();
        this.lastInterval = TIMER_INTERVAL_2_SECOND_MILLISECONDS;
        this.intervalID = setInterval(this.callbackSetInterval, TIMER_INTERVAL_2_SECOND_MILLISECONDS);
    }

    changeIntervalTox4(): void {
        this.stopTimer();
        this.lastInterval = TIMER_INTERVAL_4_SECOND_MILLISECONDS;
        this.intervalID = setInterval(this.callbackSetInterval, TIMER_INTERVAL_4_SECOND_MILLISECONDS);
    }

    stopTimer(): void {
        clearInterval(this.intervalID);
    }

    stopTotalGameTimer(): void {
        clearInterval(this.intervalIDTotalGameTimer);
    }

    replayTimer(): void {
        this.stopTimer();
        this.intervalID = setInterval(this.callbackSetInterval, this.lastInterval);
    }

    resetTimer(): void {
        clearInterval(this.intervalID);
        this.timer = TIMER_START_VALUE;
    }

    decrementTimer(decrementValue: number): void {
        this.timer -= decrementValue;
        if (this.timer < 0) this.timer = -1;
    }

    incrementTimer(incrementValue: number): void {
        this.timer += incrementValue;
    }
}
