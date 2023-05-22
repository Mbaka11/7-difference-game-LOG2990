import { Injectable } from '@angular/core';
import { Points } from '@app/common/game-interface';
import { TimerEvents } from '@app/constants/timer-events';
import { EventType, GameEvent } from '@app/interfaces/game-event';
import { Coordinate } from '@common/coordinate';
import { Subject } from 'rxjs';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class VideoReplayService {
    static gameEvents: GameEvent[] = [];
    static isPlayingReplay: boolean = false;
    currentEventIndex: number = 0;
    elapsedTime: number = 0;
    isPaused: boolean = true;
    playbackSpeed: number;
    timer: number;
    gameId: number;

    startReplaySubject = new Subject<{ roomName: string; speed: number }>();
    restartReplaySubject = new Subject<unknown>();
    logCoordsReplaySubject = new Subject<MouseEvent>();
    cheatModeReplaySubject = new Subject<Event>();
    hintReplaySubject = new Subject<number>();
    opponentReplaySubject = new Subject<Coordinate[]>();
    closeThirdHintSubject = new Subject<unknown>();

    constructor(private readonly socketClient: SocketClientService) {}

    startGame() {
        this.clearEvents();
        this.onGetTimer();
    }

    logEvent(eventType: EventType, event?: Event, data?: Coordinate[], differenceNumber?: number) {
        if (!VideoReplayService.isPlayingReplay) {
            VideoReplayService.gameEvents.push({ event, timestamp: this.timer, eventType, data, differenceNumber });
        }
    }

    clearEvents() {
        VideoReplayService.gameEvents = [];
        this.currentEventIndex = 0;
    }

    togglePlayPause(points: Points, playbackSpeed: number) {
        if (!VideoReplayService.isPlayingReplay) {
            VideoReplayService.isPlayingReplay = true;
            points = { numberOfDifferences: 0, numberOfDifferencesAdversary: 0 };
            this.startReplaySubject.next({ roomName: this.getReplayRoomName(), speed: playbackSpeed });
        } else {
            if (this.isPaused) {
                this.replay(this.getReplayRoomName());
            } else {
                this.pause(this.getReplayRoomName());
            }
        }
        this.isPaused = !this.isPaused;
        return points;
    }

    restart(roomName: string) {
        this.currentEventIndex = 0;
        this.isPaused = true;
        VideoReplayService.isPlayingReplay = false;
        this.socketClient.socket.emit(TimerEvents.ResetTimer, roomName);
        this.restartReplaySubject.next({});
    }

    restartWithoutDeletingTimer() {
        this.currentEventIndex = 0;
        this.isPaused = true;
        VideoReplayService.isPlayingReplay = false;
        this.restartReplaySubject.next({});
    }

    pause(roomName: string) {
        this.socketClient.socket.emit(TimerEvents.StopTimer, roomName);
    }

    replay(roomName: string) {
        this.socketClient.socket.emit(TimerEvents.ReplayTimer, roomName);
    }

    changePlaybackSpeedX1(roomName: string): void {
        this.socketClient.socket.emit(TimerEvents.ChangePlaybackSpeedX1, roomName);
    }

    changePlaybackSpeedX2(roomName: string): void {
        this.socketClient.socket.emit(TimerEvents.ChangePlaybackSpeedX2, roomName);
    }

    changePlaybackSpeedX4(roomName: string): void {
        this.socketClient.socket.emit(TimerEvents.ChangePlaybackSpeedX4, roomName);
    }

    onGetTimer(): void {
        this.socketClient.socket.on(TimerEvents.GetTimer, this.callbackOnGetTimer);
    }

    callbackOnGetTimer = (timer: number): void => {
        this.timer = timer;
        if (VideoReplayService.isPlayingReplay) this.verifyEvent();
    };

    verifyEvent(): void {
        if (VideoReplayService.gameEvents[this.currentEventIndex]) {
            if (VideoReplayService.gameEvents[this.currentEventIndex].timestamp === this.timer) {
                const gameEvent: GameEvent = VideoReplayService.gameEvents[this.currentEventIndex];
                this.chooseEvent(gameEvent.eventType, gameEvent.event, gameEvent.data, gameEvent.differenceNumber);
                this.currentEventIndex++;
            }
        }
    }

    chooseEvent(eventType: EventType, event?: Event, data?: Coordinate[], differenceNumber?: number): void {
        switch (eventType) {
            case EventType.UserClick:
                if (event) this.logCoordsReplaySubject.next(event as MouseEvent);
                break;
            case EventType.Cheat:
                if (event) this.cheatModeReplaySubject.next(event);
                break;
            case EventType.Hint:
                if (typeof differenceNumber === 'number') this.hintReplaySubject.next(differenceNumber);
                break;
            case EventType.OpponentClick:
                if (data) this.opponentReplaySubject.next(data);
                break;
            case EventType.CloseThirdHint:
                this.closeThirdHintSubject.next({});
                break;
            default:
                break;
        }
    }

    getReplayRoomName(): string {
        return `replay-gameId-${this.gameId}-group-${this.socketClient.socket.id}`;
    }
}
