/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { Points } from '@app/common/game-interface';
import { TimerEvents } from '@app/constants/timer-events';
import { EventType } from '@app/interfaces/game-event';
import { Coordinate } from '@common/coordinate';
import { SocketClientService } from './socket-client.service';
import { VideoReplayService } from './video-replay.service';

describe('VideoReplayService', () => {
    let service: VideoReplayService;
    let socketClientService: SocketClientService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [SocketClientService] });
        service = TestBed.inject(VideoReplayService);
        socketClientService = TestBed.inject(SocketClientService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('logEvent should add an event to gameEvents', () => {
        VideoReplayService.gameEvents = [];
        const mouseEvent = new MouseEvent('click');
        service.timer = 10;
        VideoReplayService.isPlayingReplay = false;
        service.logEvent(EventType.UserClick, mouseEvent);
        expect(VideoReplayService.gameEvents.length).toEqual(1);
        expect(VideoReplayService.gameEvents[0]).toEqual({
            event: mouseEvent,
            timestamp: 10,
            eventType: EventType.UserClick,
            data: undefined,
            differenceNumber: undefined,
        });
    });

    it('startGame should call clearEvents and onGetTimer', () => {
        const clearEventsSpy = spyOn(service, 'clearEvents').and.stub();
        const onGetTimerSpy = spyOn(service, 'onGetTimer').and.stub();
        service.startGame();
        expect(clearEventsSpy).toHaveBeenCalled();
        expect(onGetTimerSpy).toHaveBeenCalled();
    });

    it('togglePlayPuase should call startReplaySubject.next if it isnt playing replay', () => {
        VideoReplayService.isPlayingReplay = false;
        const points: Points = { numberOfDifferences: 1, numberOfDifferencesAdversary: 1 };
        const startReplayNextSpy = spyOn(service.startReplaySubject, 'next').and.stub();
        spyOn(service, 'getReplayRoomName').and.returnValue('roomName');
        const newPoints = service.togglePlayPause(points, 1);
        expect(startReplayNextSpy).toHaveBeenCalledWith({ roomName: 'roomName', speed: 1 });
        expect(VideoReplayService.isPlayingReplay).toBeTruthy();
        expect(newPoints).toEqual({ numberOfDifferences: 0, numberOfDifferencesAdversary: 0 });
    });

    it('togglePlayPuase should replay if it is paused if it is playing replay', () => {
        VideoReplayService.isPlayingReplay = true;
        service.isPaused = true;
        const points: Points = { numberOfDifferences: 1, numberOfDifferencesAdversary: 1 };
        const replaySpy = spyOn(service, 'replay').and.stub();
        const newPoints = service.togglePlayPause(points, 1);
        expect(service.isPaused).toBeFalsy();
        expect(replaySpy).toHaveBeenCalled();
        expect(newPoints).toEqual({ numberOfDifferences: 1, numberOfDifferencesAdversary: 1 });
    });

    it('togglePlayPuase should pause if it is not paused if it is playing replay', () => {
        VideoReplayService.isPlayingReplay = true;
        service.isPaused = false;
        const points: Points = { numberOfDifferences: 1, numberOfDifferencesAdversary: 1 };
        const pauseSpy = spyOn(service, 'pause').and.stub();
        const newPoints = service.togglePlayPause(points, 1);
        expect(service.isPaused).toBeTruthy();
        expect(pauseSpy).toHaveBeenCalled();
        expect(newPoints).toEqual({ numberOfDifferences: 1, numberOfDifferencesAdversary: 1 });
    });

    it('changePlaybackSpeedX1 should call the correct emit', () => {
        const roomName = 'roomName';
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.changePlaybackSpeedX1(roomName);
        expect(emitSpy).toHaveBeenCalledWith(TimerEvents.ChangePlaybackSpeedX1, roomName);
    });

    it('changePlaybackSpeedX2 should call the correct emit', () => {
        const roomName = 'roomName';
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.changePlaybackSpeedX2(roomName);
        expect(emitSpy).toHaveBeenCalledWith(TimerEvents.ChangePlaybackSpeedX2, roomName);
    });

    it('changePlaybackSpeedX4 should call the correct emit', () => {
        const roomName = 'roomName';
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.changePlaybackSpeedX4(roomName);
        expect(emitSpy).toHaveBeenCalledWith(TimerEvents.ChangePlaybackSpeedX4, roomName);
    });

    it('onGetTimer should call socket.on', () => {
        const onSpy = spyOn(socketClientService.socket, 'on').and.stub();
        service.onGetTimer();
        expect(onSpy).toHaveBeenCalledWith(TimerEvents.GetTimer, service.callbackOnGetTimer);
    });

    it('callbackOnGetTimer should change this.timer and call verifyEvent', () => {
        const verifyEventSpy = spyOn(service, 'verifyEvent').and.stub();
        service.timer = 0;
        VideoReplayService.isPlayingReplay = true;
        service.callbackOnGetTimer(10);
        expect(verifyEventSpy).toHaveBeenCalled();
        expect(service.timer).toEqual(10);
    });

    it('verifyEvent should call chooseEvent and increment currentEventIndex', () => {
        const mouseEvent = new MouseEvent('click');
        VideoReplayService.gameEvents = [
            { event: mouseEvent, timestamp: 10, eventType: EventType.UserClick, data: undefined, differenceNumber: undefined },
        ];
        const chooseEventSpy = spyOn(service, 'chooseEvent').and.stub();
        service.timer = 10;
        service.currentEventIndex = 0;
        service.verifyEvent();
        expect(chooseEventSpy).toHaveBeenCalledWith(EventType.UserClick, mouseEvent, undefined, undefined);
        expect(service.currentEventIndex).toEqual(1);
    });

    it('getReplayRoomName should return the right room name', () => {
        service.gameId = 1;
        socketClientService.socket.id = '3';
        const roomName = service.getReplayRoomName();
        expect(roomName).toEqual('replay-gameId-1-group-3');
    });

    it('chooseEvent should call logCoordsReplaySubject.next if eventType is canvasClick', () => {
        const mouseEvent = new MouseEvent('click');
        const nextSpy = spyOn(service.logCoordsReplaySubject, 'next').and.stub();
        service.chooseEvent(EventType.UserClick, mouseEvent);
        expect(nextSpy).toHaveBeenCalledWith(mouseEvent);
    });

    it('chooseEvent should call cheatModeReplaySubject.next if eventType is Cheat', () => {
        const mouseEvent = new MouseEvent('click');
        const nextSpy = spyOn(service.cheatModeReplaySubject, 'next').and.stub();
        service.chooseEvent(EventType.Cheat, mouseEvent);
        expect(nextSpy).toHaveBeenCalledWith(mouseEvent);
    });

    it('chooseEvent should call hintReplaySubject.next if eventType is Hint', () => {
        const nextSpy = spyOn(service.hintReplaySubject, 'next').and.stub();
        service.chooseEvent(EventType.Hint, undefined, undefined, 0);
        expect(nextSpy).toHaveBeenCalledWith(0);
    });

    it('chooseEvent should call opponentReplaySubject.next if eventType is Hint', () => {
        const data: Coordinate[] = [{ row: 0, col: 0 }];
        const nextSpy = spyOn(service.opponentReplaySubject, 'next').and.stub();
        service.chooseEvent(EventType.OpponentClick, undefined, data);
        expect(nextSpy).toHaveBeenCalled();
    });

    it('chooseEvent should call closeThirdHintSubject.next if eventType is Hint', () => {
        const nextSpy = spyOn(service.closeThirdHintSubject, 'next').and.stub();
        service.chooseEvent(EventType.CloseThirdHint);
        expect(nextSpy).toHaveBeenCalled();
    });

    it('chooseEvent should call nothing if eventType is GameFinished', () => {
        const mouseEvent = new MouseEvent('click');
        const logCoordsNextSpy = spyOn(service.logCoordsReplaySubject, 'next').and.stub();
        const cheatNextSpy = spyOn(service.cheatModeReplaySubject, 'next').and.stub();
        const hintNextSpy = spyOn(service.hintReplaySubject, 'next').and.stub();
        service.chooseEvent(EventType.GameFinished, mouseEvent);
        expect(logCoordsNextSpy).not.toHaveBeenCalled();
        expect(cheatNextSpy).not.toHaveBeenCalled();
        expect(hintNextSpy).not.toHaveBeenCalled();
    });

    it('restart should set index to 0 and emit resetTimer', () => {
        service.currentEventIndex = 1;
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.restart('room');
        expect(emitSpy).toHaveBeenCalledWith(TimerEvents.ResetTimer, 'room');
        expect(service.currentEventIndex).toEqual(0);
    });

    it('restartWithoutDeletingTimer should set index to 0 and not emit resetTimer', () => {
        service.currentEventIndex = 1;
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.restartWithoutDeletingTimer();
        expect(emitSpy).not.toHaveBeenCalled();
        expect(service.currentEventIndex).toEqual(0);
    });

    it('pause should and emit stopTimer', () => {
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.pause('room');
        expect(emitSpy).toHaveBeenCalledWith(TimerEvents.StopTimer, 'room');
    });

    it('replay should and emit stopTimer', () => {
        const emitSpy = spyOn(socketClientService.socket, 'emit').and.stub();
        service.replay('room');
        expect(emitSpy).toHaveBeenCalledWith(TimerEvents.ReplayTimer, 'room');
    });
});
