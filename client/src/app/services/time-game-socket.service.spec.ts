/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Game, TimeGameSetting } from '@app/common/time-game-interface';
import { TimerEvents } from '@app/constants/timer-events';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';
import { TimeGameSocketService } from './time-game-socket.service';

describe('TimeGameSocketService', () => {
    let service: TimeGameSocketService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TimeGameSocketService, SocketClientService, { provide: 'Window', useValue: window }],
        });
        socketTestHelper = new SocketTestHelper() as unknown as SocketTestHelper;
        service = new TimeGameSocketService({ socket: socketTestHelper } as any);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit the TimerEvents.SetInvertedTimer event when startTimer is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        const startValue = 3;
        service.startTimer(roomName, startValue);
        expect(spy).toHaveBeenCalledWith(TimerEvents.SetInvertedTimer, { roomName, timerStartValue: startValue });
    });

    it('should emit the saveTimeGameSetting event when sendGameSettings is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const setting: TimeGameSetting = {
            startTime: 0,
            penaltyTime: 0,
            bonusTime: 0,
        };
        service.sendGameSettings(setting);
        expect(spy).toHaveBeenCalledWith('saveTimeGameSetting', setting);
    });

    it('should emit the TimerEvents.IncrementTimer event when incrementTimer is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        const incrementValue = 3;
        service.incrementTimer(roomName, incrementValue);
        expect(spy).toHaveBeenCalledWith(TimerEvents.IncrementTimer, { roomName, incrementValue });
    });

    it('should emit the TimerEvents.IncrementTimer event when decrementTimer is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        const decrementValue = 3;
        service.decrementTimer(roomName, decrementValue);
        expect(spy).toHaveBeenCalledWith(TimerEvents.DecrementTimer, { roomName, decrementValue });
    });

    it('should emit the getTimeGameSetting event when getGame is called', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'test-room';
        service.getGame(roomName);
        expect(spy).toHaveBeenCalledWith('getTimeGameSetting', roomName);
    });

    it('should call gameDta when the getTimeGame event is emitted', () => {
        const expectedData: Game = {
            gameDifferences: [[{ row: 2, col: 1 }]],
            gameOriginal: 'test',
            gameModified: 'test',
            gameInformation: { gameDifficulty: 'test', gameId: 1, gameName: 'test', numberOfDiff: 3 },
        };
        spyOn(service.gameData, 'next');
        socketTestHelper.peerSideEmit('getTimeGame', { data: expectedData });
        expect(service.gameData.next).toHaveBeenCalledWith(expectedData);
    });

    it('should call loseGame when the InvertedTimerEnd event is emitted', () => {
        spyOn(service.loseGame, 'next');
        socketTestHelper.peerSideEmit(TimerEvents.InvertedTimerEnd);
        expect(service.loseGame.next).toHaveBeenCalledWith({});
    });

    it('should call gameSetting when the getTimeGameSetting event is emitted', () => {
        const expectedData: TimeGameSetting = { startTime: 0, bonusTime: 0, penaltyTime: 0 };
        spyOn(service.gameSetting, 'next');
        socketTestHelper.peerSideEmit('getTimeGameSetting', { data: expectedData });
        expect(service.gameSetting.next).toHaveBeenCalledWith(expectedData);
    });
});
