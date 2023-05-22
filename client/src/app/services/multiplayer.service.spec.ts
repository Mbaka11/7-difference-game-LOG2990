/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { MultiplayerEvents } from '../../../../server/app/gateways/multiplayer/multiplayer.events';
import { MultiplayerService } from './multiplayer.service';
import { SocketClientService } from './socket-client.service';

describe('MultiplayerService', () => {
    let service: MultiplayerService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MultiplayerService, SocketClientService, { provide: 'Window', useValue: window }],
        });
        socketTestHelper = new SocketTestHelper() as unknown as SocketTestHelper;
        service = new MultiplayerService({ socket: socketTestHelper } as any);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit the removeHint event when removeHint is called', () => {
        const spy = spyOn(service.useHint, 'next');
        service.removeHint();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit the surender event when sendSurender is called', () => {
        const roomName = 'test-room';
        service.sendSurender(roomName);
    });

    it('should emit the FoundDifference event when sendRemoveData is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        const coordinates = [
            { row: 10, col: 20 },
            { row: 30, col: 40 },
        ];
        service.sendRemoveData(roomName, coordinates);
        expect(spy).toHaveBeenCalledWith('foundDifference', { roomName, data: coordinates });
    });

    it('should emit the RemoveHint event when sendRemoveHint is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        service.sendRemoveHint(roomName);
        expect(spy).toHaveBeenCalledWith('removeHint', roomName);
    });

    it('should emit the unsubscribe event when leaveRoom is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        service.leaveRoom(roomName);
        expect(spy).toHaveBeenCalledWith('unsubscribe', roomName);
    });

    it('should emit the victory event when sendVictoryDeclaration is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        service.sendVictoryDeclaration(roomName);
        expect(spy).toHaveBeenCalledWith('victory', { roomName: roomName });
    });

    it('should call removeDifference() when the FoundDifference event is emitted', () => {
        const expectedData = [{ row: 1, col: 2 }];
        spyOn(service.foundDifference, 'next');
        socketTestHelper.peerSideEmit(MultiplayerEvents.FoundDifference, { data: expectedData });
        expect(service.foundDifference.next).toHaveBeenCalledWith(expectedData);
    });

    it('should call removeHint() when the RemoveHint event is emitted', () => {
        spyOn(service, 'removeHint');
        socketTestHelper.peerSideEmit(MultiplayerEvents.RemoveHint);
        expect(service.removeHint).toHaveBeenCalled();
    });

    it('should call surender.next() when the Surender event is emitted', () => {
        const expectedSurender = 'room1';
        spyOn(service.surender, 'next');
        socketTestHelper.peerSideEmit(MultiplayerEvents.Surender, { surenderRoom: expectedSurender });
        expect(service.surender.next).toHaveBeenCalledWith(expectedSurender);
    });

    it('should call loser.next() when the lost event is emitted', () => {
        const expectedLost = 'room1';
        spyOn(service.loser, 'next');
        socketTestHelper.peerSideEmit('victory', { loserRoom: expectedLost });
        expect(service.loser.next).toHaveBeenCalledWith(expectedLost);
    });
});
