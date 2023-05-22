import { Injectable, OnDestroy } from '@angular/core';
import { TimerEvents } from '@app/constants/timer-events';
import { SocketClientService } from './socket-client.service';

const SECONDES_IN_MINUTES = 60;
const TIMER_ITERATIONS_PER_SECOND = 10;
const TIMER_FORMAT_INIT = '00 : 00';

@Injectable({
    providedIn: 'root',
})
export class TimerService implements OnDestroy {
    timerFormat: string = TIMER_FORMAT_INIT;
    private timer: number;
    private totalGameTimer: number;

    constructor(private readonly socketClient: SocketClientService) {}

    onGetTimer() {
        this.socketClient.socket.on(TimerEvents.GetTimer, this.callbackOnGetTimer);
        this.socketClient.socket.on(TimerEvents.GetTotalGameTimer, this.callbackOnGetTotalGameTimer);
    }

    callbackOnGetTimer = (timer: number): void => {
        this.timer = this.toSecond(timer);
        this.timerFormat = this.getTimerFormat(Math.floor(this.toSecond(timer)));
    };

    callbackOnGetTotalGameTimer = (totalGameTimer: number): void => {
        this.totalGameTimer = this.toSecond(totalGameTimer);
    };

    getTimer(): number {
        return this.timer;
    }

    getTotalGameTimer(): number {
        return this.totalGameTimer;
    }

    getTimerFormat(componentTimer: number): string {
        const timerSecondes = componentTimer % SECONDES_IN_MINUTES;
        const timerMinutes = Math.floor(componentTimer / SECONDES_IN_MINUTES);

        return `${timerMinutes.toString().padStart(2, '0')} : ${timerSecondes.toString().padStart(2, '0')}`;
    }

    stopTimer(): void {
        this.socketClient.socket.removeListener(TimerEvents.GetTimer);
    }

    resetTimer(): void {
        this.timerFormat = TIMER_FORMAT_INIT;
    }

    decrementTimer(roomName: string, decrementValue: number): void {
        this.socketClient.socket.emit(TimerEvents.DecrementTimer, { roomName, decrementValue });
    }

    ngOnDestroy(): void {
        this.stopTimer();
    }

    private toSecond(timer: number): number {
        return timer / TIMER_ITERATIONS_PER_SECOND;
    }
}
