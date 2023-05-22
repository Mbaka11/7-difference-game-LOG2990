import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    private readonly socketUrl: string = environment.socketServerUrl;
    constructor() {
        this.connect();
    }

    connect(): void {
        'ws://local';
        this.socket = io(this.socketUrl, { transports: ['websocket'] });
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    removeAllListeners(): void {
        this.socket.removeAllListeners();
    }
}
