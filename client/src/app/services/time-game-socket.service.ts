import { Injectable } from '@angular/core';
import { Game, TimeGameSetting } from '@app/common/time-game-interface';
import { TimerEvents } from '@app/constants/timer-events';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class TimeGameSocketService {
    socket: Socket;
    gameData = new Subject<Game>();
    gameSetting = new Subject<TimeGameSetting>();
    loseGame = new Subject<unknown>();

    constructor(socketClient: SocketClientService) {
        this.socket = socketClient.socket;

        this.socket.on('getTimeGameSetting', ({ data }) => {
            this.gameSetting.next(data);
        });

        this.socket.on('getTimeGame', ({ data }) => {
            this.gameData.next(data);
        });

        this.socket.on(TimerEvents.InvertedTimerEnd, () => {
            this.loseGame.next({});
        });
    }

    startTimer(roomName: string, timerStartValue: number) {
        this.socket.emit(TimerEvents.SetInvertedTimer, { roomName, timerStartValue });
    }

    sendGameSettings(setting: TimeGameSetting) {
        this.socket.emit('saveTimeGameSetting', setting);
    }

    getGame(roomName: string) {
        this.socket.emit('getTimeGameSetting', roomName);
    }

    incrementTimer(roomName: string, incrementValue: number): void {
        this.socket.emit(TimerEvents.IncrementTimer, { roomName, incrementValue });
    }

    decrementTimer(roomName: string, decrementValue: number): void {
        this.socket.emit(TimerEvents.DecrementTimer, { roomName, decrementValue });
    }
}
