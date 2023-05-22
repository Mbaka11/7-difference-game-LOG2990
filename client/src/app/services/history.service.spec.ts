/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, waitForAsync } from '@angular/core/testing';

import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { HistoryService } from './history.service';
import { SocketClientService } from './socket-client.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [HistoryService, SocketClientService, { provide: 'Window', useValue: window }] });

        socketTestHelper = new SocketTestHelper() as unknown as SocketTestHelper;
        service = new HistoryService({ socket: socketTestHelper } as any);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit the getHistory event when getHistory is called', waitForAsync(async () => {
        const spy = spyOn(service.socket, 'emit').and.callThrough();
        const gameInfo = {
            duration: '',
            date: '',
            gameMode: '',
            players: ['', ''],
            winner: '',
            surrender: '',
        };

        const result = await service.getHistory();
        socketTestHelper.peerSideEmit('getHistory', [gameInfo]);

        expect(spy).toHaveBeenCalledWith('getHistory', {});
        expect(result).toEqual([gameInfo]);
    }));

    it('should emit the addGameToHistory event when addGameToHistory is called', () => {
        const spy = spyOn(service.socket, 'emit');
        service.addGameToHistory('', '', ['', ''], '', '');
        const now = new Date();

        const date = now.toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
        const gameInfo = {
            duration: '',
            date,
            gameMode: '',
            players: ['', ''],
            winner: '',
            surrender: '',
        };
        expect(spy).toHaveBeenCalledWith('addGameToHistory', gameInfo);
    });

    it('should emit the deleteAllHistory event when clearHistory is called', () => {
        const spy = spyOn(service.socket, 'emit');
        service.clearHistory();

        expect(spy).toHaveBeenCalledWith('deleteAllHistory');
    });

    it('should return true if the game history is empty', async () => {
        spyOn(service, 'getHistory').and.returnValue(Promise.resolve([]));
        const result = await service.isEmpty();
        expect(result).toBeTrue();
    });

    it('should return false if the game history is not empty', async () => {
        const gameInfo = {
            duration: '',
            date: '',
            gameMode: '',
            players: ['', ''],
            winner: '',
            surrender: '',
        };
        spyOn(service, 'getHistory').and.returnValue(Promise.resolve([gameInfo]));
        const result = await service.isEmpty();
        expect(result).toBeFalse();
    });
});
