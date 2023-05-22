/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;
    let socketSpy: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['disconnect', 'removeAllListeners']);

        service = TestBed.inject(SocketClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('disconnect should call disconnect from the socket', () => {
        service.socket = socketSpy;
        service.disconnect();
        expect(socketSpy.disconnect).toHaveBeenCalled();
    });

    it('removeAllListeners should call removeAllListeners from the socket', () => {
        service.socket = socketSpy;
        service.removeAllListeners();
        expect(socketSpy.removeAllListeners).toHaveBeenCalled();
    });
});
