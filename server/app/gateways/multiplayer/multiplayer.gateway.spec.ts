/* eslint-disable */
import { MultiplayerGateway } from '@app/gateways/multiplayer/multiplayer.gateway';
import { TimerFactoryService } from '@app/services/timer-factory/timer-factory.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, spy, stub } from 'sinon';
import { BroadcastOperator, Namespace, Server, Socket } from 'socket.io';
import { MultiplayerEvents } from './multiplayer.events';

describe('MultiplayerGateway', () => {
    let gateway: MultiplayerGateway;
    let timerFactoryService: TimerFactoryService;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MultiplayerGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                { provide: TimerFactoryService, useValue: { deleteTimer: () => {} } },
            ],
        }).compile();

        gateway = module.get<MultiplayerGateway>(MultiplayerGateway);
        timerFactoryService = module.get<TimerFactoryService>(TimerFactoryService);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('removeDifference() should not send message if socket not in the room', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.removeDifference(socket, { roomName: 'allo', data: [{ row: 0, col: 0 }] });
        expect(server.to.called).toBeFalsy();
    });

    it('removeDifferences() should send message if socket in the room', () => {
        stub(socket, 'rooms').value(new Set(['servRoom']));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MultiplayerEvents.FoundDifference);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.removeDifference(socket, { roomName: 'allo', data: [{ row: 0, col: 0 }] });
    });

    it('surender() should not send message if socket not in the room', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.surender(socket, { roomName: 'allo' });
        expect(server.to.called).toBeFalsy();
    });

    it('surender() should send message if socket in the room', () => {
        stub(socket, 'rooms').value(new Set(['servRoom']));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MultiplayerEvents.Surender);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.surender(socket, { roomName: 'allo' });
    });

    it('removeHint() should not send message if socket not in the room', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.removeHint(socket, '');
        expect(server.to.called).toBeFalsy();
    });

    it('removeHint() should check if socket is joined to the room', () => {
        stub(socket, 'rooms').value(new Set(['roomName']));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MultiplayerEvents.RemoveHint);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.removeHint(socket, 'roomName');
        expect(socket.to.calledWith('roomName')).toBeFalsy();
    });

    it('removeDifference() should not send message if socket is not in the room', () => {
        server.to.reset();
        const roomName = 'testRoom';
        const data = [{ row: 1, col: 2 }];
        const socketMock = { rooms: new Set() } as Socket;

        gateway.removeDifference(socketMock, { roomName, data });

        expect(server.to.called).toBeFalsy();
    });

    it('removeDifference() should send message to other sockets in the room', () => {
        server.to.reset();
        const roomName = 'testRoom';
        const data = [{ row: 1, col: 2 }];
        const socketMock = {
            emit: () => {},
            rooms: new Set([roomName]),
            broadcast: {
                to: () => {
                    return {
                        emit: () => {},
                    };
                },
            },
        } as unknown as Socket;
        const emitSpy = spy(socketMock, 'emit');

        gateway.removeDifference(socketMock, { roomName, data });

        expect(server.to.calledWith(roomName)).toBeFalsy();
        expect(emitSpy.calledWith(MultiplayerEvents.FoundDifference, { data })).toBeFalsy();
    });

    it('surender() should not send message if socket is not in the room', () => {
        server.to.reset();
        const roomName = 'testRoom';
        const socketMock = { rooms: new Set() } as Socket;

        gateway.surender(socketMock, { roomName });

        expect(server.to.called).toBeFalsy();
    });

    it('surender() should send message to other sockets in the room', () => {
        server.to.reset();
        const roomName = 'testRoom';
        const socketMock = {
            emit: () => {},
            rooms: new Set([roomName]),
            broadcast: {
                to: () => {
                    return {
                        emit: () => {},
                    };
                },
            },
        } as unknown as Socket;
        const emitSpy = spy(socketMock, 'emit');

        gateway.surender(socketMock, { roomName });

        expect(server.to.calledWith(roomName)).toBeFalsy();
        expect(emitSpy.calledWith(MultiplayerEvents.Surender)).toBeFalsy();
    });

    it('victoryDeclaration() should send message to other sockets in the room', () => {
        server.to.reset();
        const roomName = 'testRoom';
        const socketMock = {
            emit: () => {},
            rooms: new Set([roomName]),
            broadcast: {
                to: () => {
                    return {
                        emit: () => {},
                    };
                },
            },
        } as unknown as Socket;
        const emitSpy = spy(socketMock, 'emit');

        gateway.victoryDeclaration(socketMock, { roomName });

        expect(server.to.calledWith(roomName)).toBeFalsy();
        expect(emitSpy.calledWith('lost')).toBeFalsy();
    });

    it('removeSocket() should check if socket is joined to the room and deleteTimer', () => {
        jest.spyOn(timerFactoryService, 'deleteTimer');
        jest.spyOn(socket, 'leave');
        const roomName = 'roomNameTest';
        const roomTest = new Set<string>();
        roomTest.add(roomName);

        stub(socket, 'rooms').value(roomTest);

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MultiplayerEvents.RemoveHint);
            },
        } as BroadcastOperator<unknown, unknown>);

        const adapterStub = {
            rooms: {
                get: () => {
                    return roomTest;
                },
            },
        };

        server.of.returns({ adapter: adapterStub } as unknown as Namespace);

        gateway.removeSocket(socket, roomName);
        expect(socket.leave).toHaveBeenCalledWith(roomName);
        expect(timerFactoryService.deleteTimer).toHaveBeenCalledWith(roomName, roomTest);
    });
});
