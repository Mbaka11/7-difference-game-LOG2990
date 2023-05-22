import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { TimerFactoryService } from '@app/services/timer-factory/timer-factory.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, match, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

const ROOMS_TEST: Map<string, Set<string>> = new Map();
const ROOM_1 = new Set(['socket1', 'socket2']);
ROOMS_TEST.set('1', ROOM_1);

describe('ChatGateway', () => {
    let gateway: ChatGateway;
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
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: TimerFactoryService, useValue: { generateTimer: () => {} } },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        timerFactoryService = module.get<TimerFactoryService>(TimerFactoryService);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('validate() message should take account word length', () => {
        const testCases = [
            { word: 'XX', isValid: false },
            { word: 'XXXXX', isValid: false },
            { word: 'XXXXXX', isValid: false },
            { word: 'XXXXXXX', isValid: true },
            { word: 'XXXXXXXX', isValid: true },
        ];
        for (const { word, isValid } of testCases) {
            gateway.validate(socket, word);
            expect(socket.emit.calledWith(ChatEvents.WordValidated, isValid)).toBeTruthy();
        }
    });

    it('broadcastAll() should send a mass message to the server', () => {
        gateway.broadcastAll(socket, 'X');
        expect(server.emit.calledWith(ChatEvents.MassMessage, match.any)).toBeTruthy();
    });

    it('joinRoom() should join the socket room and generate timer', () => {
        const mockServerTest = {
            adapter: {
                rooms: ROOMS_TEST,
            },
            of: () => {
                return mockServerTest;
            },
        } as unknown as Server;

        gateway['server'] = mockServerTest;

        jest.spyOn(timerFactoryService, 'generateTimer');

        gateway.joinRoom(socket, '1');
        expect(socket.join.calledOnce).toBeTruthy();
        expect(timerFactoryService.generateTimer).toHaveBeenCalledWith('1', ROOM_1);
    });

    it('roomMessage() should not send message if socket not in the room', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.roomMessage(socket, { roomName: 'a', message: 'b', senderType: 'c' });
        expect(server.to.called).toBeFalsy();
    });

    it('roomMessage() should send message if socket in the room', () => {
        stub(socket, 'rooms').value(new Set([PRIVATE_ROOM_ID]));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(ChatEvents.RoomMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.roomMessage(socket, { roomName: PRIVATE_ROOM_ID, message: 'b', senderType: 'c' });
    });

    it('broadcastAllNewPodiumPlayer() should emit to MassMessage event a message that has all its parameter', () => {
        const username = 'usernameTest';
        const gameName = 'gameNameTest';
        const podiumPlace = 1;

        gateway.broadcastAllNewPodiumPlayer(username, gameName, podiumPlace);
        expect(
            server.emit.calledWith(
                ChatEvents.MassMessage,
                `Félicitations à ${username} d'avoir atteint la place ${podiumPlace} dans le jeu ${gameName} !`,
            ),
        ).toBeTruthy();
    });
});
