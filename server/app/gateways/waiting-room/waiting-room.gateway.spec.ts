import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Namespace, Server, Socket } from 'socket.io';
import { WaitingRoomGateway } from './waiting-room.gateway';
import { WaitingRoomEvents } from './waiting-room.gateway.events';

const ROOM_NAME = 'roomNameTest';
const USERNAME = 'usernameTest';

describe('WaitingRoomGateway', () => {
    let gateway: WaitingRoomGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let waitingRoomService: SinonStubbedInstance<WaitingRoomService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        waitingRoomService = createStubInstance<WaitingRoomService>(WaitingRoomService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaitingRoomGateway,
                {
                    provide: WaitingRoomService,
                    useValue: waitingRoomService,
                },
                {
                    provide: Logger,
                    useValue: logger,
                },
            ],
        }).compile();

        gateway = module.get<WaitingRoomGateway>(WaitingRoomGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('isGameCreator() should emit to WaitingRoomEvents.IsGameCreator the response of waitingRoomService.isGameCreator()', () => {
        gateway.isGameCreator(socket, ROOM_NAME);

        expect(waitingRoomService.isGameCreator.calledWith(server, ROOM_NAME)).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.IsGameCreator, waitingRoomService.isGameCreator(server, ROOM_NAME))).toBeTruthy();
    });

    it('isRoomFull() should emit to WaitingRoomEvents.IsRoomFull the response of waitingRoomService.isRoomFull()', () => {
        const gameRoomName = 'singleplayer-gameId-1-group-1';
        const roomTest = new Set<string>(gameRoomName);

        const adapterStub = {
            rooms: {
                get: () => {
                    return roomTest;
                },
            },
        };

        server.of.returns({ adapter: adapterStub } as unknown as Namespace);

        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.IsRoomFull);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.isRoomFull(socket, ROOM_NAME);

        expect(waitingRoomService.isRoomFull.calledWith(roomTest)).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.IsRoomFull, waitingRoomService.isRoomFull(roomTest))).toBeTruthy();
    });

    it('joinGameRoom() should join the socket room and call waitingRoomService.broadcastAllGameRooms(server)', () => {
        gateway.joinGameRoom(socket, ROOM_NAME);

        expect(socket.join.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server));
    });

    it('leaveGameRoom() should leave the socket room, call updateQueueRoom and broadcastAllGameRooms from waitingRoomService', () => {
        gateway.leaveGameRoom(socket, ROOM_NAME);

        expect(socket.leave.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.updateQueueRoom.calledWith(server, ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server)).toBeTruthy();
    });

    it('leaveQueueRoom() should leave the socket room, call waitingRoomService.broadcastAllGameRooms(server)', () => {
        gateway.leaveQueueRoom(socket, ROOM_NAME);

        expect(socket.leave.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server)).toBeTruthy();
    });

    it('creatorLeftGame() should leave the socket room, emit and call updateQueueRoom and broadcastAllGameRooms from waitingRoomService', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.CreatorLeftGame);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.creatorLeftGame(socket, ROOM_NAME);

        expect(socket.leave.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.updateQueueRoom.calledWith(server, ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server)).toBeTruthy();
    });

    it('opponentLeftGame() should leave the socket room, emit and call updateQueueRoom and broadcastAllGameRooms from waitingRoomService', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.OpponentLeftGame);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.opponentLeftGame(socket, ROOM_NAME);

        expect(socket.leave.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.updateQueueRoom.calledWith(server, ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server)).toBeTruthy();
    });

    it('getGameRooms() should emit all the rooms returned by the waitingRoomService', () => {
        const gameRoomName = 'singleplayer-gameId-1-group-1';
        const roomsTest = new Map([[gameRoomName, new Set<string>()]]);
        const allGameRooms = [gameRoomName];

        waitingRoomService.getAllGameRooms.returns(allGameRooms);

        const adapterStub = {
            rooms: roomsTest,
        };

        server.of.returns({ adapter: adapterStub } as Namespace);

        socket.to.returns({
            emit: (event: string, gameRooms: string[]) => {
                expect(event).toEqual(WaitingRoomEvents.GetGameRooms);
                expect(gameRooms).toEqual(allGameRooms);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.getGameRooms(socket);

        expect(waitingRoomService.getAllGameRooms.calledWith(roomsTest)).toBeTruthy();
    });

    it('opponentJoinedGame() should emit to the events OpponentJoinedGame and GiveCreatorUsername with proper arguments', () => {
        const gameRoomNameTest = 'timeMultiplayer-gameId-1-group-VUEU92G71UJ';
        jest.spyOn(waitingRoomService, 'getRoomNameTime').mockReturnValue(gameRoomNameTest);

        socket.to.returns({
            emit: (event: string, objAnswer?: { gameRoomName: string; opponentUsername: string }) => {
                if (event === WaitingRoomEvents.OpponentJoinedGame) {
                    expect(event).toEqual(WaitingRoomEvents.OpponentJoinedGame);
                    expect(objAnswer.gameRoomName).toEqual(gameRoomNameTest);
                    expect(objAnswer.opponentUsername).toEqual(USERNAME);
                } else expect(event).toEqual(WaitingRoomEvents.GiveCreatorUsername);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.opponentJoinedGame(socket, { roomName: ROOM_NAME, username: USERNAME });
    });

    it('responseOfCreator() should call waitingRoomService, emit and leave the room if creatorAnswer is true', () => {
        const creatorAnswerTest = true;
        const gameId = '1';
        const gameRoomNameTest = 'gameRoomNameTest';

        waitingRoomService.getGameIdFromRoomName.returns(gameId);
        waitingRoomService.getRoomName.returns(gameRoomNameTest);

        server.to.returns({
            emit: (event: string, { creatorAnswer, gameRoomName }: { creatorAnswer: boolean; gameRoomName: string }) => {
                expect(event).toEqual(WaitingRoomEvents.ResponseOfCreator);
                expect(creatorAnswer).toEqual(creatorAnswerTest);
                expect(gameRoomName).toEqual(gameRoomNameTest);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.responseOfCreator(socket, { creatorAnswer: creatorAnswerTest, roomName: ROOM_NAME });

        expect(waitingRoomService.getGameIdFromRoomName.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.getRoomName.calledWith(socket.id, Number(gameId))).toBeTruthy();
        expect(socket.leave.calledWith(ROOM_NAME)).toBeTruthy();
        expect(waitingRoomService.updateQueueRoom.calledWith(server, ROOM_NAME));
        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server));
    });

    it('responseOfCreator() should emit the room and waitingRoomService.broadcastAllGameRooms if creatorAnswer is false', () => {
        const creatorAnswerTest = false;

        socket.to.returns({
            emit: (event: string, { creatorAnswer, roomName }: { creatorAnswer: boolean; roomName: string }) => {
                expect(event).toEqual(WaitingRoomEvents.ResponseOfCreator);
                expect(creatorAnswer).toEqual(creatorAnswerTest);
                expect(roomName).toEqual('');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.responseOfCreator(socket, { creatorAnswer: creatorAnswerTest, roomName: ROOM_NAME });

        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server));
    });

    it('creatorUsername() should emit the room with its creatorUsername argument', () => {
        socket.to.returns({
            emit: (event: string, creatorUsername: string) => {
                expect(event).toEqual(WaitingRoomEvents.GetCreatorUsername);
                expect(creatorUsername).toEqual(USERNAME);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.creatorUsername(socket, { roomName: ROOM_NAME, creatorUsername: USERNAME });
    });

    it('disconnectAll() should disconnectAll socket from gameType not multiplayer and with the proper gameId', () => {
        const gameRoomName = 'singleplayer-gameId-1-group-1';
        const allGameRooms = [gameRoomName];
        const gameId = 1;

        waitingRoomService.getAllGameRooms.returns(allGameRooms);
        waitingRoomService.getGameIdFromRoomName.returns(gameId.toString());
        waitingRoomService.getGameTypeFromRoomName.returns('singleplayer');

        const adapterStub = {
            rooms: new Map([[gameRoomName, new Set<string>()]]),
        };

        server.of.returns({ adapter: adapterStub } as Namespace);

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.DeleteGame);
            },
        } as BroadcastOperator<unknown, unknown>);

        server.in.returns({
            socketsLeave: (room: string) => {
                expect(room).toEqual(allGameRooms[0]);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.disconnectAll(gameId);

        expect(waitingRoomService.getGameIdFromRoomName.calledWith(allGameRooms[0]));
        expect(waitingRoomService.getGameTypeFromRoomName.calledWith(allGameRooms[0]));
    });

    it('handleDisconnect() should waitingRoomService.broadcastAllGameRooms', () => {
        gateway.handleDisconnect();

        expect(waitingRoomService.broadcastAllGameRooms.calledWith(server));
    });
});
