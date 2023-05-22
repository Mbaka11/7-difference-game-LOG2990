import { QUEUE_ROOM_NAME, WAITING_ROOM_NAME } from '@app/gateways/waiting-room/waiting-room.gateway.constants';
import { WaitingRoomEvents } from '@app/gateways/waiting-room/waiting-room.gateway.events';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WaitingRoomService {
    getAllGameRooms(rooms: Map<string, Set<string>>): string[] {
        const gameRooms = [];
        for (const roomKey of rooms.keys()) {
            if (roomKey.includes('gameId')) {
                gameRooms.push(roomKey);
            }
        }
        return gameRooms;
    }

    getSocketRoom(socket: Socket, server: Server): string | null {
        const rooms = server.sockets.adapter.rooms;
        for (const roomName of rooms.keys()) {
            const room = rooms.get(roomName);
            if (room.has(socket.id) && roomName !== socket.id) {
                return roomName;
            }
        }
        return null;
    }

    getOtherSocketInRoom(socket: Socket, server: Server): Socket | null {
        const roomName = this.getSocketRoom(socket, server);
        if (!roomName) {
            return null;
        }
        const room = server.of('/').adapter.rooms.get(roomName);
        for (const socketId of room) {
            if (socketId !== socket.id) {
                return server.sockets.sockets.get(socketId);
            }
        }
    }

    getRoomNameTime(creatorId: string, gameId: number): string {
        return `timeMultiplayer-gameId-${gameId}-group-${creatorId}`;
    }

    getRoomName(creatorId: string, gameId: number): string {
        return `multiplayer-gameId-${gameId}-group-${creatorId}`;
    }

    getGameIdFromRoomName(roomName: string): string {
        const arr = roomName.split('-');
        const gameIdIndex = arr.indexOf('gameId') + 1;
        return arr[gameIdIndex];
    }

    getGameTypeFromRoomName(roomName: string): string {
        const arr = roomName.split('-');
        return arr[0];
    }

    getGroupFromRoomName(roomName: string): string {
        const substring = 'group-';
        const remainingStr = roomName.slice(roomName.indexOf(substring) + substring.length);
        return remainingStr;
    }

    getFirstSocketIdFromRoom(room: Set<string>): string {
        return room ? Array.from(room)[0] : '';
    }

    broadcastAllGameRooms(server: Server): void {
        const rooms = server.of('/').adapter.rooms;
        const gameRooms = this.getAllGameRooms(rooms);
        server.emit(WaitingRoomEvents.GetGameRooms, gameRooms);
    }

    updateQueueRoom(server: Server, roomName: string): void {
        const gameId = this.getGameIdFromRoomName(roomName);

        if (server.of('/').adapter.rooms.get(QUEUE_ROOM_NAME + gameId)) {
            const firstSocketIdQueueRoom = this.getFirstSocketIdFromRoom(server.of('/').adapter.rooms.get(QUEUE_ROOM_NAME + gameId));

            server
                .to(firstSocketIdQueueRoom)
                .emit(WaitingRoomEvents.IsRoomFull, this.isRoomFull(server.of('/').adapter.rooms.get(WAITING_ROOM_NAME + gameId)));

            this.shiftSocketFromRoom(server, QUEUE_ROOM_NAME + gameId);
        }
    }

    shiftSocketFromRoom(server: Server, roomName: string): void {
        const firstSocketFromRoom = this.getFirstSocketIdFromRoom(server.of('/').adapter.rooms.get(roomName));
        const firstSocket = server.sockets.sockets.get(firstSocketFromRoom);
        firstSocket.leave(roomName);
    }

    isGameCreator(server: Server, roomName: string): boolean {
        return server.of('/').adapter.rooms.get(roomName).size === 1;
    }

    isRoomFull(room: Set<string>): boolean {
        return room ? room.size >= 2 : false;
    }
}
