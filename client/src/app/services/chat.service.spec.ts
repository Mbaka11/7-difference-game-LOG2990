/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameType } from '@common/gametype';
import { Socket } from 'socket.io-client';
import { ChatEvents } from '../../../../server/app/gateways/chat/chat.gateway.events';
import { ChatService } from './chat.service';
import { SocketClientService } from './socket-client.service';

describe('ChatService', () => {
    let service: ChatService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ChatService, SocketClientService, { provide: 'Window', useValue: window }],
        });
        socketTestHelper = new SocketTestHelper() as unknown as SocketTestHelper;
        service = new ChatService({ socket: socketTestHelper } as any);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a user message', () => {
        const message = 'Hello world';
        const color = 'black';
        const spy = spyOn(service.messageSource, 'next');

        service.sendUserMessage(message, color);

        expect(spy).toHaveBeenCalledWith({ message, color, isSystem: false });
    });

    it('should send a system message', () => {
        const message = 'Hello world';
        const color = 'black';
        const spy = spyOn(service.messageSource, 'next');

        service.sendSystemMessage(message, color);

        expect(spy).toHaveBeenCalledWith({ message, color, isSystem: true });
    });

    it('should send the roomName on removeHint', () => {
        const roomName = 'roomTest';
        const spy = spyOn(service.socket, 'emit');

        service.sendRemoveHint(roomName);

        expect(spy).toHaveBeenCalledWith('removeHint', roomName);
    });

    it('should call next on useHint with an empty object', () => {
        const spy = spyOn(service.useHint, 'next');
        service.removeHint();
        expect(spy).toHaveBeenCalledWith({});
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a user message', () => {
        const message = 'Hello world';
        const color = 'black';
        const spy = spyOn(service.messageSource, 'next');

        service.sendUserMessage(message, color);

        expect(spy).toHaveBeenCalledWith({ message, color, isSystem: false });
    });

    it('should send a system message', () => {
        const message = 'Hello world';
        const color = 'black';
        const spy = spyOn(service.messageSource, 'next');

        service.sendSystemMessage(message, color);

        expect(spy).toHaveBeenCalledWith({ message, color, isSystem: true });
    });

    it('should join a room', () => {
        const roomName = 'room1';
        const spy = spyOn(service.socket, 'emit');

        service.joinRoom(roomName);

        expect(spy).toHaveBeenCalledWith('joinRoom', roomName);
    });

    it('should send a room message', () => {
        const roomName = 'room1';
        const message = 'Hello world';
        const senderType = 'user';
        const spy = spyOn(service.socket, 'emit');

        service.sendRoomMessage(roomName, message, senderType);

        expect(spy).toHaveBeenCalledWith('roomMessage', { roomName, message, senderType });
    });

    it('should send a remove hint message', () => {
        const roomName = 'room1';
        const spy = spyOn(service.socket, 'emit');

        service.sendRemoveHint(roomName);

        expect(spy).toHaveBeenCalledWith('removeHint', roomName);
    });

    it('should remove a hint', () => {
        const spy = spyOn(service.useHint, 'next');

        service.removeHint();

        expect(spy).toHaveBeenCalledWith({});
    });

    it('should call sendSystemMessage() when the RoomMessage with specific senderType event is emitted', () => {
        const senderType = 'onPlayerJoin';
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.RoomMessage, { senderType, message });
        expect(service.sendSystemMessage).toHaveBeenCalledWith(message, 'green');
    });

    it('should call sendSystemMessage() when the RoomMessage with specific senderType event is emitted', () => {
        const senderType = 'onHint';
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.RoomMessage, { senderType, message });
        expect(service.sendSystemMessage).toHaveBeenCalledWith(message, 'violet');
    });

    it('should call sendSystemMessage() when the RoomMessage with specific senderType event is emitted', () => {
        const senderType = 'onPlayerLeave';
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.RoomMessage, { senderType, message });
        expect(service.sendSystemMessage).toHaveBeenCalledWith(message, 'grey');
    });

    it('should call sendSystemMessage() when the RoomMessage with specific senderType event is emitted', () => {
        const senderType = 'onPlayerError';
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.RoomMessage, { senderType, message });
        expect(service.sendSystemMessage).toHaveBeenCalledWith(message, 'red');
    });

    it('should call sendSystemMessage() when the RoomMessage with specific senderType event is emitted', () => {
        const senderType = 'onPlayerFoundDifference';
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.RoomMessage, { senderType, message });
        expect(service.sendSystemMessage).toHaveBeenCalledWith(message, 'blue');
    });

    it('should call sendSystemMessage() when the RoomMessage with specific senderType event is emitted', () => {
        const senderType = 'TEST';
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.RoomMessage, { senderType, message });
    });

    it('should call removeHint() when the RemoveHint event is emitted', () => {
        spyOn(service, 'removeHint');
        socketTestHelper.peerSideEmit(ChatEvents.RemoveHint);
        expect(service.removeHint).toHaveBeenCalled();
    });

    it('should call sendSystemMessage() when the UpdatePodium event is emitted', () => {
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.UpdatePodium, message);
        expect(service.sendSystemMessage).toHaveBeenCalledOnceWith(message, 'orange');
    });

    it('should call sendSystemMessage() when the MassMessage event is emitted', () => {
        const message = 'messageTest';
        spyOn(service, 'sendSystemMessage');
        socketTestHelper.peerSideEmit(ChatEvents.MassMessage, message);
        expect(service.sendSystemMessage).toHaveBeenCalledOnceWith(message, 'brown');
    });

    it('should send a message to UpdatePodium event', () => {
        const message = 'Hello world';
        const spy = spyOn(service.socket, 'emit');

        service.sendUpdatePodium(message);

        expect(spy).toHaveBeenCalledWith(ChatEvents.UpdatePodium, message);
    });

    it('should send an error message true to the room when called', () => {
        const gameType = GameType.MultiplayerClassic;
        const username = 'player1';
        const roomName = 'room1';

        spyOn(service, 'formatTime').and.returnValue('12:00:00');
        const sendRoomMessageSpy = spyOn(service, 'sendRoomMessage').and.stub();

        service.errorAction(gameType, username, roomName);

        expect(sendRoomMessageSpy).toHaveBeenCalledWith(roomName, '12:00:00 Erreur par player1.', 'onPlayerError');
    });

    it('should send an error message false to the room when called', () => {
        const gameType = GameType.SoloClassic;
        const username = 'player1';
        const roomName = 'room1';

        spyOn(service, 'formatTime').and.returnValue('12:00:00');
        const sendRoomMessageSpy = spyOn(service, 'sendRoomMessage').and.stub();

        service.errorAction(gameType, username, roomName);

        expect(sendRoomMessageSpy).toHaveBeenCalledWith(roomName, '12:00:00 Erreur.', 'onPlayerError');
    });

    it('should send a "difference found" true message to the room when called', () => {
        const gameType = GameType.MultiplayerClassic;
        const username = 'player1';
        const roomName = 'room1';

        spyOn(service, 'formatTime').and.returnValue('12:00:00');
        const sendRoomMessageSpy = spyOn(service, 'sendRoomMessage').and.stub();

        service.foundDifferenceAction(gameType, username, roomName);

        expect(sendRoomMessageSpy).toHaveBeenCalledWith(roomName, '12:00:00 Difference trouvée par player1.', 'onPlayerFoundDifference');
    });

    it('should send a "difference found" false message to the room when called', () => {
        const gameType = GameType.SoloClassic;
        const username = 'player1';
        const roomName = 'room1';

        spyOn(service, 'formatTime').and.returnValue('12:00:00');
        const sendRoomMessageSpy = spyOn(service, 'sendRoomMessage').and.stub();

        service.foundDifferenceAction(gameType, username, roomName);

        expect(sendRoomMessageSpy).toHaveBeenCalledWith(roomName, '12:00:00 Difference trouvée.', 'onPlayerFoundDifference');
    });
});
