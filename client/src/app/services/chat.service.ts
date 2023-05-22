import { Injectable } from '@angular/core';
import { ChatEvents } from '@app/common/chat.gateway.events';
import { GameType } from '@app/common/constants';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messageSource = new Subject<{ message: string; color: string; isSystem: boolean }>();
    useHint = new Subject<unknown>();

    socket: Socket;

    constructor(socketClient: SocketClientService) {
        this.socket = socketClient.socket;

        this.socket.on(ChatEvents.RoomMessage, ({ senderType, message }) => {
            switch (senderType) {
                case 'onPlayerJoin': {
                    this.sendSystemMessage(message, 'green');
                    break;
                }
                case 'onHint': {
                    this.sendSystemMessage(message, 'violet');
                    break;
                }
                case 'onPlayerLeave': {
                    this.sendSystemMessage(message, 'grey');
                    break;
                }
                case 'onPlayerError': {
                    this.sendSystemMessage(message, 'red');
                    break;
                }
                case 'onPlayerFoundDifference': {
                    this.sendSystemMessage(message, 'blue');
                    break;
                }
                default:
                    this.sendUserMessage(message, 'black');
            }
        });

        this.socket.on(ChatEvents.UpdatePodium, (message: string) => {
            this.sendSystemMessage(message, 'orange');
        });

        this.socket.on(ChatEvents.RemoveHint, () => {
            this.removeHint();
        });

        this.socket.on(ChatEvents.MassMessage, (message: string) => {
            this.sendSystemMessage(message, 'brown');
        });
    }

    removeHint() {
        this.useHint.next({});
    }

    sendUserMessage(message: string, color: string) {
        this.messageSource.next({ message, color, isSystem: false });
    }

    sendSystemMessage(message: string, color: string) {
        this.messageSource.next({ message, color, isSystem: true });
    }

    joinRoom(roomName: string) {
        this.socket.emit(ChatEvents.JoinRoom, roomName);
    }

    sendRoomMessage(roomName: string, message: string, senderType: string) {
        this.socket.emit(ChatEvents.RoomMessage, { roomName, message, senderType });
    }

    sendRemoveHint(roomName: string) {
        this.socket.emit(ChatEvents.RemoveHint, roomName);
    }

    sendUpdatePodium(message: string) {
        this.socket.emit(ChatEvents.UpdatePodium, message);
    }

    formatTime(date: Date) {
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        return `(${hour}:${minute}:${second})`;
    }

    joinAction(username: string, roomName: string) {
        const message = `${this.formatTime(new Date())} ${username} a rejoint la partie.`;
        this.sendRoomMessage(roomName, message, 'onPlayerJoin');
    }

    foundDifferenceAction(gameType: GameType, username: string, roomName: string) {
        const message = `${this.formatTime(new Date())} Difference trouvée${
            gameType === GameType.MultiplayerClassic || gameType === GameType.MultiplayerTime ? ` par ${username}` : ''
        }.`;
        this.sendRoomMessage(roomName, message, 'onPlayerFoundDifference');
    }
    errorAction(gameType: GameType, username: string, roomName: string) {
        const message = `${this.formatTime(new Date())} Erreur${
            gameType === GameType.MultiplayerClassic || gameType === GameType.MultiplayerTime ? ` par ${username}` : ''
        }.`;
        this.sendRoomMessage(roomName, message, 'onPlayerError');
    }
}
