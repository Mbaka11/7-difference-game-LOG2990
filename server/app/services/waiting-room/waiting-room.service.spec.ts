import { WaitingRoomEvents } from '@app/gateways/waiting-room/waiting-room.gateway.events';
import { Server, Socket } from 'socket.io';
import { WaitingRoomService } from './waiting-room.service';

describe('WaitingRoomService', () => {
    let waitingRoomService: WaitingRoomService;
    let mockServer: Server;

    const roomsTest: Map<string, Set<string>> = new Map();
    const room1 = new Set(['socket1', 'socket2']);
    const room2 = new Set(['socket3', 'socket4']);
    const room3 = new Set(['socket5', 'socket6']);
    roomsTest.set('multiplayer-gameId-1-group-socket1', room1);
    roomsTest.set('multiplayer-gameId-1-group-socket3', room2);
    roomsTest.set('queue-gameId-1', room3);

    const socketsTest: Map<string, Socket> = new Map();
    const socket1 = { id: 'socket1' } as Socket;
    const socket2 = { id: 'socket2' } as Socket;
    const socket5 = { id: 'socket5' } as Socket;
    socketsTest.set('socket1', socket1);
    socketsTest.set('socket2', socket2);
    socketsTest.set('socket5', socket5);

    beforeEach(() => {
        waitingRoomService = new WaitingRoomService();
        mockServer = {
            sockets: {
                adapter: {
                    rooms: roomsTest,
                },
                sockets: socketsTest,
            },
            of: () => {
                return {
                    adapter: {
                        rooms: roomsTest,
                    },
                };
            },
            to: () => {
                return mockServer;
            },
            emit: jest.fn(),
        } as unknown as Server;
    });

    describe('getAllGameRooms', () => {
        it('should return an array of game rooms', () => {
            const result = waitingRoomService.getAllGameRooms(roomsTest);
            expect(result).toEqual(['multiplayer-gameId-1-group-socket1', 'multiplayer-gameId-1-group-socket3', 'queue-gameId-1']);
        });
    });

    describe('getSocketRoom', () => {
        it('should return the room name for the given socket', () => {
            const result = waitingRoomService.getSocketRoom(socket1, mockServer);
            expect(result).toEqual('multiplayer-gameId-1-group-socket1');
        });

        it('should return null if the socket is not in any room', () => {
            const socket = { id: 'socket99' } as Socket;
            const result = waitingRoomService.getSocketRoom(socket, mockServer);
            expect(result).toBeNull();
        });
    });

    describe('getOtherSocketInRoom', () => {
        it('should return the other socket in the room', () => {
            jest.spyOn(socketsTest, 'get');

            const result = waitingRoomService.getOtherSocketInRoom(socket1, mockServer);

            expect(socketsTest.get).toHaveBeenCalledWith(socket2.id);
            expect(result).toEqual(socket2);
        });

        it('should return null if there is no other socket in the room', () => {
            const socket = { id: 'socket99' } as Socket;

            const result = waitingRoomService.getOtherSocketInRoom(socket, mockServer);
            expect(result).toBeNull();
        });

        it('should return null if the socket is not in any room', () => {
            const socket = { id: 'socket99' } as Socket;

            const result = waitingRoomService.getOtherSocketInRoom(socket, mockServer);
            expect(result).toBeNull();
        });
    });

    it('getRoomNameTime() should return the roomName for time gameType', () => {
        const gameId = 1;
        const roomNameTime = waitingRoomService.getRoomNameTime(socket1.id, gameId);
        expect(roomNameTime).toBe(`timeMultiplayer-gameId-${gameId}-group-${socket1.id}`);
    });

    describe('getRoomName', () => {
        it('should return the correct new game room name', () => {
            const roomName = waitingRoomService.getRoomName(socket1.id, 1);
            expect(roomName).toBe(`multiplayer-gameId-${1}-group-${socket1.id}`);
        });
    });

    describe('getGameIdFromRoomName', () => {
        it('should return the correct id from the room name', () => {
            const roomId = waitingRoomService.getGameIdFromRoomName('multiplayer-gameId-1-group-socket1');
            expect(roomId).toBe('1');
        });
    });

    describe('getGameTypeFromRoomName', () => {
        it('should return the correct game type from the room name', () => {
            const roomId = waitingRoomService.getGameTypeFromRoomName('multiplayer-gameId-1-group-socket1');
            expect(roomId).toBe('multiplayer');
        });
    });

    describe('getGroupFromRoomName', () => {
        it('should return the correct group from the room name', () => {
            const group = waitingRoomService.getGroupFromRoomName('multiplayer-gameId-1-group-socket1');
            expect(group).toBe('socket1');
        });
    });

    describe('getFirstSocketIdFromRoom', () => {
        it('should return the correct socket id from the room', () => {
            const firstSocketId = waitingRoomService.getFirstSocketIdFromRoom(room1);
            expect(firstSocketId).toBe('socket1');
        });
        it('should return an empty string if the room doesnt exist', () => {
            const firstSocketId = waitingRoomService.getFirstSocketIdFromRoom(undefined);
            expect(firstSocketId).toBe('');
        });
    });

    describe('broadcastAllGameRooms', () => {
        it('should server.emit to the correct event the gameRooms', () => {
            jest.spyOn(waitingRoomService, 'getAllGameRooms');

            waitingRoomService.broadcastAllGameRooms(mockServer);

            expect(waitingRoomService.getAllGameRooms).toHaveBeenCalledWith(roomsTest);
            expect(mockServer.emit).toHaveBeenCalledWith(WaitingRoomEvents.GetGameRooms, [
                'multiplayer-gameId-1-group-socket1',
                'multiplayer-gameId-1-group-socket3',
                'queue-gameId-1',
            ]);
        });
    });

    describe('updateQueueRoom', () => {
        it('should server.emit WaitingRoomEvents.IsRoomFull to the first socket in the queue and remove it from the queue', () => {
            jest.spyOn(waitingRoomService, 'shiftSocketFromRoom');
            jest.spyOn(mockServer, 'to');
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            socket5.leave = () => {};

            waitingRoomService.updateQueueRoom(mockServer, 'queue-gameId-1');

            expect(mockServer.to).toHaveBeenCalledWith('socket5');
            expect(mockServer.emit).toHaveBeenCalledWith(WaitingRoomEvents.IsRoomFull, false);
            expect(waitingRoomService.shiftSocketFromRoom).toHaveBeenCalledWith(mockServer, 'queue-gameId-1');
        });
    });

    describe('shiftSocketFromRoom', () => {
        it('should make leave the first socket from a room', () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            socket1.leave = () => {};
            jest.spyOn(socket1, 'leave');

            waitingRoomService.shiftSocketFromRoom(mockServer, 'multiplayer-gameId-1-group-socket1');

            expect(socket1.leave).toHaveBeenCalledWith('multiplayer-gameId-1-group-socket1');
        });
    });

    describe('isGameCreator', () => {
        it('should return false because the socket is not the creator', () => {
            const isGameCreator = waitingRoomService.isGameCreator(mockServer, 'multiplayer-gameId-1-group-socket1');

            expect(isGameCreator).toBe(false);
        });
    });

    describe('isRoomFull', () => {
        it('should return true because the room is full', () => {
            const isRoomFull = waitingRoomService.isRoomFull(room1);

            expect(isRoomFull).toBe(true);
        });
    });
});
