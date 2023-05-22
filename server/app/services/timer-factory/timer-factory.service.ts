import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { TimerService } from '@app/services/timer/timer.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TimerFactoryService {
    timers: Map<string, TimerService> = new Map<string, TimerService>();

    constructor(private waitingRoomService: WaitingRoomService, private timerGateway: TimerGateway) {}

    generateTimer(roomName: string, room: Set<string>): void {
        const gameType = this.waitingRoomService.getGameTypeFromRoomName(roomName);
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);

        if (this.timers.get(group)) return;

        if (
            ((gameType === 'singleplayer' || (gameType === 'multiplayer' && room.size === 2)) && !this.timers.get(group)) ||
            gameType === 'replay' ||
            gameType === 'timeSingleplayer' ||
            gameType === 'timeMultiplayer'
        ) {
            this.timers.set(group, new TimerService(this.timerGateway, roomName));
        }
    }

    changePlaybackSpeedX1(roomName: string) {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).changeIntervalTox1();
    }

    changePlaybackSpeedX2(roomName: string) {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).changeIntervalTox2();
    }

    changePlaybackSpeedX4(roomName: string) {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).changeIntervalTox4();
    }

    setInvertedTimer(roomName: string, startTimerValue: number): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).setInvertedTimer(startTimerValue);
    }

    decrementTimer(roomName: string, decrementValue: number): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).decrementTimer(decrementValue);
    }

    incrementTimer(roomName: string, incrementValue: number): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).incrementTimer(incrementValue);
    }

    deleteTimer(roomName: string, room: Set<string>): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        const timer = this.timers.get(group);
        const gameType = this.waitingRoomService.getGameTypeFromRoomName(roomName);

        if (timer) {
            if (gameType === 'timeMultiplayer') {
                if (room.size > 0) return;
            }
            timer.stopTimer();
            timer.stopTotalGameTimer();
            this.timers.delete(group);
        }
    }

    resetTimer(roomName: string): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).resetTimer();
    }

    stopTimer(roomName: string): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).stopTimer();
    }

    stopTotalGameTimer(roomName: string): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).stopTotalGameTimer();
    }

    replayTimer(roomName: string): void {
        const group = this.waitingRoomService.getGroupFromRoomName(roomName);
        this.timers.get(group).replayTimer();
    }
}
