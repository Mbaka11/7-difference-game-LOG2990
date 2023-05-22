import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TimerEvents } from './timer-events';

@WebSocketGateway()
export class TimerGateway {
    @WebSocketServer() private server: Server;

    emitTimer(roomName: string, timer: number): void {
        this.server.to(roomName).emit(TimerEvents.GetTimer, timer);
    }

    emitTotalGameTimer(roomName: string, timer: number): void {
        this.server.to(roomName).emit(TimerEvents.GetTotalGameTimer, timer);
    }

    emitInvertedEnd(roomName: string): void {
        this.server.to(roomName).emit(TimerEvents.InvertedTimerEnd);
    }
}
