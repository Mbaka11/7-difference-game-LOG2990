import { Podium } from '@common/podium';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class PodiumGateway {
    @WebSocketServer() private server: Server;

    broadcastPodium(podium: Podium) {
        this.server.emit('BroadcastPodium', podium);
    }
}
