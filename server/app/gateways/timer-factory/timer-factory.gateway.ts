import { TimerEvents } from '@app/gateways/timer/timer-events';
import { TimerFactoryService } from '@app/services/timer-factory/timer-factory.service';
import { Inject } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const CONVERT_SECONDS = 10;

@WebSocketGateway()
export class TimerFactoryGateway {
    @WebSocketServer() private server: Server;

    constructor(@Inject(TimerFactoryService) private timerFactoryService: TimerFactoryService) {}

    @SubscribeMessage(TimerEvents.ChangePlaybackSpeedX1)
    changePlaybackSpeedX1(_: Socket, roomName: string): void {
        this.timerFactoryService.changePlaybackSpeedX1(roomName);
    }

    @SubscribeMessage(TimerEvents.ChangePlaybackSpeedX2)
    changePlaybackSpeedX2(_: Socket, roomName: string): void {
        this.timerFactoryService.changePlaybackSpeedX2(roomName);
    }

    @SubscribeMessage(TimerEvents.ChangePlaybackSpeedX4)
    changePlaybackSpeedX4(_: Socket, roomName: string): void {
        this.timerFactoryService.changePlaybackSpeedX4(roomName);
    }

    @SubscribeMessage(TimerEvents.SetInvertedTimer)
    setInvertedTimer(_: Socket, { roomName, timerStartValue }: { roomName: string; timerStartValue: number }): void {
        this.timerFactoryService.setInvertedTimer(roomName, timerStartValue * CONVERT_SECONDS);
    }

    @SubscribeMessage(TimerEvents.DecrementTimer)
    decrementTimer(_: Socket, { roomName, decrementValue }: { roomName: string; decrementValue: number }): void {
        this.timerFactoryService.decrementTimer(roomName, decrementValue);
    }

    @SubscribeMessage(TimerEvents.IncrementTimer)
    incrementTimer(_: Socket, { roomName, incrementValue }: { roomName: string; incrementValue: number }): void {
        this.timerFactoryService.incrementTimer(roomName, incrementValue);
    }

    @SubscribeMessage(TimerEvents.ResetTimer)
    resetTimer(_: Socket, roomName: string): void {
        this.timerFactoryService.resetTimer(roomName);
    }

    @SubscribeMessage(TimerEvents.StopTimer)
    stopTimer(_: Socket, roomName: string): void {
        this.timerFactoryService.stopTimer(roomName);
    }

    @SubscribeMessage(TimerEvents.ReplayTimer)
    replayTimer(_: Socket, roomName: string): void {
        this.timerFactoryService.replayTimer(roomName);
    }
}
