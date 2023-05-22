/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/common/constants';
import { GameInProgress } from '@app/common/game-interface';
import { DialogMessageComponent } from '@app/components/dialog-message/dialog-message.component';
import { ReplayDialogMessageComponent } from '@app/components/replay-dialog-message/replay-dialog-message.component';
import { INVALID_PODIUM_PLACE } from '@app/constants/invalid-podium-place';
import { EndgameService } from '@app/services/endgame.service';
import { of } from 'rxjs';
import { CommunicationService } from './communication.service';
import { TimerService } from './timer.service';
import { VideoReplayService } from './video-replay.service';

const canvasStub1: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub1.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const canvasStub2: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub2.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

describe('DialogService', () => {
    let service: EndgameService;
    let router: Router;
    let gameInProgress: GameInProgress;
    let communicationService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule, BrowserAnimationsModule],
            providers: [
                CommunicationService,
                {
                    provide: TimerService,
                    useValue: {
                        getTimer: () => {
                            return 10;
                        },
                        getTotalGameTimer: () => {
                            return 10;
                        },
                    },
                },
            ],
        });
        service = TestBed.inject(EndgameService);
        service.dialog = TestBed.inject(MatDialog);
        router = TestBed.inject(Router);
        communicationService = TestBed.inject(CommunicationService);
        gameInProgress = {
            username: 'test1',
            opponentUsername: 'test2',
            roomName: 'room',
            timeGameDifferences: [],
            timeGameInfo: [],
            timeGameModified: [],
            timeGameOriginal: [],
            gameType: GameType.SoloClassic,
            leftCanvas: canvasStub1,
            rightCanvas: canvasStub2,
            numberOfPlayer: 2,
            leftImagePixels: [],
            rightImagePixels: [],
            differences: [],
            startTime: 0,
            penaltyTime: 0,
            bonusTime: 0,
            gameCard: { gameId: 1, gameName: 'test', gameDifficulty: 'facile', numberOfDiff: 3 },
            differencesFound: [],
        };
        VideoReplayService.isPlayingReplay = false;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onAbandon should open dialog and surrender if event is confirm', () => {
        const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of({ event: 'confirm' }));
        const openSpy = spyOn(service.dialog, 'open').and.returnValue(dialogRef);
        const surrenderGameSpy = spyOn(service, 'surrenderGame');
        service.onAbandon(GameType.SoloClassic, gameInProgress);
        expect(openSpy).toHaveBeenCalled();
        expect(surrenderGameSpy).toHaveBeenCalledWith(GameType.SoloClassic, gameInProgress);
    });

    it('surrenderGame should alert opponent if in multiplayer', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(service, 'deleteTimer').and.stub();
        const gameType = GameType.MultiplayerClassic;
        const sendRoomMessageSpy = spyOn(service.chatService, 'sendRoomMessage').and.stub();
        const sendSurrenderSpy = spyOn(service.multiplayerService, 'sendSurender').and.stub();
        const historyServiceSpy = spyOn(service.historyService, 'addGameToHistory').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        service.surrenderGame(gameType, gameInProgress);
        expect(sendRoomMessageSpy).toHaveBeenCalled();
        expect(sendSurrenderSpy).toHaveBeenCalledWith('room');
        expect(historyServiceSpy).toHaveBeenCalled();
        expect(leaveRoomSpy).toHaveBeenCalledWith('room');
    });

    it('surrenderGame should add game to history in any case', () => {
        spyOn(service, 'deleteTimer').and.stub();
        const gameType = GameType.SoloClassic;
        const historyServiceSpy = spyOn(service.historyService, 'addGameToHistory').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        service.surrenderGame(gameType, gameInProgress);
        expect(historyServiceSpy).toHaveBeenCalled();
        expect(leaveRoomSpy).toHaveBeenCalledWith('room');
    });

    it('endGame should openWinAndReplay message if game is classic', () => {
        spyOn(service, 'deleteTimer').and.stub();
        spyOn(communicationService, 'updatePodium').and.callFake(() => {
            return of(1);
        });
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openWinAndReplayMessageSpy = spyOn(service, 'openWinAndReplayMessage').and.stub();
        service.endGame(gameInProgress);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(openWinAndReplayMessageSpy).toHaveBeenCalled();
    });

    it('endGame should openWinAndReplay message if game is classic', () => {
        VideoReplayService.isPlayingReplay = true;
        spyOn(service, 'deleteTimer').and.stub();
        spyOn(communicationService, 'updatePodium').and.callFake(() => {
            return of(1);
        });
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openWinAndReplayMessageSpy = spyOn(service, 'openWinAndReplayMessage').and.stub();
        service.endGame(gameInProgress);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(openWinAndReplayMessageSpy).toHaveBeenCalled();
    });

    it('endGame should openWinAndReplay message if game is classic without parameters if podium place is invalid', () => {
        spyOn(service, 'deleteTimer').and.stub();
        spyOn(communicationService, 'updatePodium').and.callFake(() => {
            return of(INVALID_PODIUM_PLACE);
        });
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openWinAndReplayMessageSpy = spyOn(service, 'openWinAndReplayMessage').and.stub();
        service.endGame(gameInProgress);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(openWinAndReplayMessageSpy).toHaveBeenCalledWith();
    });

    it('endGame should openWinAndReplay message if game is classic without parameters if podium place is invalid and call addGameToHistory', () => {
        VideoReplayService.isPlayingReplay = true;
        spyOn(service, 'deleteTimer').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openCongratsMessageSpy = spyOn(service, 'openCongratsMessage').and.stub();
        const addGameToHistorySpy = spyOn(service.historyService, 'addGameToHistory').and.stub();
        gameInProgress.gameType = GameType.MultiplayerTime;
        spyOn(service.interpretRouteService, 'getPlayerType').and.returnValue('creator');
        service.endGame(gameInProgress);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(openCongratsMessageSpy).toHaveBeenCalled();
        expect(addGameToHistorySpy).toHaveBeenCalled();
    });

    it('endGame should openCongrats message if game is not classic', () => {
        spyOn(service, 'deleteTimer').and.stub();
        gameInProgress.gameType = GameType.MultiplayerTime;
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openCongratsMessageSpy = spyOn(service, 'openCongratsMessage').and.stub();
        spyOn(service.historyService, 'addGameToHistory').and.stub();
        service.endGame(gameInProgress);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(openCongratsMessageSpy).toHaveBeenCalled();
    });

    it('loseGame should openLoseAndReplayMessage message if game is classic', () => {
        spyOn(service, 'deleteTimer').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openLoseAndReplayMessageSpy = spyOn(service, 'openLoseAndReplayMessage').and.stub();
        service.loseGame(gameInProgress, 'room', 'opponent');
        expect(leaveRoomSpy).toHaveBeenCalledWith('room');
        expect(openLoseAndReplayMessageSpy).toHaveBeenCalledWith('opponent');
    });

    it('loseGame should openTimeLoserMessage message if game is not classic', () => {
        spyOn(service, 'deleteTimer').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const gameType = GameType.SoloTime;
        gameInProgress.gameType = gameType;
        const openLoserMessageSpy = spyOn(service, 'openTimeLoserMessage').and.stub();
        const addGameToHistorySpy = spyOn(service.historyService, 'addGameToHistory').and.stub();
        spyOn(service.interpretRouteService, 'getPlayerType').and.returnValue('creator');
        service.loseGame(gameInProgress, 'room', 'opponent');
        expect(leaveRoomSpy).toHaveBeenCalledWith('room');
        expect(openLoserMessageSpy).toHaveBeenCalled();
        expect(addGameToHistorySpy).toHaveBeenCalled();
    });

    it('loseGame should openTimeLoserMessage message if game is not classic', () => {
        spyOn(service, 'deleteTimer').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const gameType = GameType.SoloTime;
        gameInProgress.gameType = gameType;
        const openLoserMessageSpy = spyOn(service, 'openTimeLoserMessage').and.stub();
        service.loseGame(gameInProgress, 'room', 'opponent');
        expect(leaveRoomSpy).toHaveBeenCalledWith('room');
        expect(openLoserMessageSpy).toHaveBeenCalled();
    });

    it('opponentHasGivenUp should call a series of functions', () => {
        const deleteTimerSpy = spyOn(service, 'deleteTimer').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const openGiveUpMessageSpy = spyOn(service, 'openGiveUpMessage').and.stub();

        service.oponentHasGivenUp('room', GameType.MultiplayerClassic);
        expect(leaveRoomSpy).toHaveBeenCalledWith('room');
        expect(deleteTimerSpy).toHaveBeenCalled();
        expect(openGiveUpMessageSpy).toHaveBeenCalled();
    });

    it('opponentHasGivenUp should call timeAbandonSubject.next if gameType is multiplayer time', () => {
        const nextSpy = spyOn(service.timeAbandonSubject, 'next').and.stub();

        service.oponentHasGivenUp('room', GameType.MultiplayerTime);
        expect(nextSpy).toHaveBeenCalledWith({});
    });

    it('openCongratsMessage should open dialog', () => {
        const message = 'Bravo tu as gagné!';
        const openSpy = spyOn(service.dialog, 'open').and.stub();
        service.openCongratsMessage();
        expect(openSpy).toHaveBeenCalledWith(DialogMessageComponent, { disableClose: true, data: { message } });
    });

    it('openWinAndReplayMessage should open dialog and call replaySubject.next if replay selected', () => {
        VideoReplayService.isPlayingReplay = false;
        const message = 'Bravo tu as gagné!';
        const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of({ event: 'replay' }));
        const openSpy = spyOn(service.dialog, 'open').and.returnValue(dialogRef);
        const nextSpy = spyOn(service.replaySubject, 'next').and.stub();
        service.openWinAndReplayMessage();
        expect(openSpy).toHaveBeenCalledWith(ReplayDialogMessageComponent, { disableClose: true, data: { message } });
        expect(nextSpy).toHaveBeenCalledWith({});
    });

    it('openWinAndReplayMessage should open dialog and call restartSubject.next if replay selected and isPlayingReplay is true', () => {
        VideoReplayService.isPlayingReplay = true;
        const username = 'username';
        const podiumPlace = 1;
        const message = `Bravo tu as gagné et en plus ${username}, votre pseudo, été ajouté à la place ${podiumPlace} du podium de ce jeu !`;
        const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of({ event: 'replay' }));
        const openSpy = spyOn(service.dialog, 'open').and.returnValue(dialogRef);
        const nextSpy = spyOn(service.restartSubject, 'next').and.stub();
        service.openWinAndReplayMessage(podiumPlace, username);
        expect(openSpy).toHaveBeenCalledWith(ReplayDialogMessageComponent, { disableClose: true, data: { message } });
        expect(nextSpy).toHaveBeenCalledWith({});
    });

    it('openLoserMessage should open dialog', () => {
        const opponentUsername = 'opponent';
        const message = `Bravo, vous avez perdu!\n${opponentUsername} vous a ouvert!`;
        const openSpy = spyOn(service.dialog, 'open').and.stub();
        service.openLoserMessage(opponentUsername);
        expect(openSpy).toHaveBeenCalledWith(DialogMessageComponent, { disableClose: true, data: { message } });
    });

    it('openTimeLoserMessage should open dialog', () => {
        const message = 'Bravo, vous avez perdu!\nLa minuterie vous a ouvert!';
        const openSpy = spyOn(service.dialog, 'open').and.stub();
        service.openTimeLoserMessage();
        expect(openSpy).toHaveBeenCalledWith(DialogMessageComponent, { disableClose: true, data: { message } });
    });

    it('openLoseAndReplayMessage should open dialog and call replaySubject.next if replay selected', () => {
        VideoReplayService.isPlayingReplay = false;
        const opponentUsername = 'opponent';
        const message = `Bravo, vous avez perdu!\n${opponentUsername} vous a ouvert!`;
        const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of({ event: 'replay' }));
        const openSpy = spyOn(service.dialog, 'open').and.returnValue(dialogRef);
        const nextSpy = spyOn(service.replaySubject, 'next').and.stub();
        service.openLoseAndReplayMessage(opponentUsername);
        expect(openSpy).toHaveBeenCalledWith(ReplayDialogMessageComponent, { disableClose: true, data: { message } });
        expect(nextSpy).toHaveBeenCalledWith({});
    });

    it('openLoseAndReplayMessage should open dialog and call restartSubject.next if replay selected and isPlayingReplay is true', () => {
        VideoReplayService.isPlayingReplay = true;
        const opponentUsername = 'opponent';
        const message = `Bravo, vous avez perdu!\n${opponentUsername} vous a ouvert!`;
        const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRef.afterClosed.and.returnValue(of({ event: 'replay' }));
        const openSpy = spyOn(service.dialog, 'open').and.returnValue(dialogRef);
        const nextSpy = spyOn(service.restartSubject, 'next').and.stub();
        service.openLoseAndReplayMessage(opponentUsername);
        expect(openSpy).toHaveBeenCalledWith(ReplayDialogMessageComponent, { disableClose: true, data: { message } });
        expect(nextSpy).toHaveBeenCalledWith({});
    });

    it('openGiveUpMessage should open dialog', () => {
        const message = 'Bravo votre adversaire est parti en courant comme un joueur de league!';
        const openSpy = spyOn(service.dialog, 'open').and.stub();
        service.openGiveUpMessage();
        expect(openSpy).toHaveBeenCalledWith(DialogMessageComponent, { disableClose: true, data: { message } });
    });

    it('onRefreshed should call a series of functions', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(service.chatService, 'formatTime').and.returnValue('time');
        const sendRoomMessageSpy = spyOn(service.chatService, 'sendRoomMessage').and.stub();
        const sendSurenderSpy = spyOn(service.multiplayerService, 'sendSurender').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const deleteTimerSpy = spyOn(service, 'deleteTimer').and.stub();
        const addGameToHistorySpy = spyOn(service.historyService, 'addGameToHistory').and.stub();
        const navigateSpy = spyOn(router, 'navigate').and.stub();
        service.onRefreshed(gameInProgress);

        expect(navigateSpy).toHaveBeenCalled();
        expect(sendRoomMessageSpy).toHaveBeenCalled();
        expect(sendSurenderSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(deleteTimerSpy).toHaveBeenCalled();
        expect(addGameToHistorySpy).toHaveBeenCalled();
    });

    it('onRefreshed should call a series of functions', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(service.chatService, 'formatTime').and.returnValue('time');
        gameInProgress.gameType = GameType.MultiplayerClassic;
        const sendRoomMessageSpy = spyOn(service.chatService, 'sendRoomMessage').and.stub();
        const sendSurenderSpy = spyOn(service.multiplayerService, 'sendSurender').and.stub();
        const leaveRoomSpy = spyOn(service.multiplayerService, 'leaveRoom').and.stub();
        const deleteTimerSpy = spyOn(service, 'deleteTimer').and.stub();
        const addGameToHistorySpy = spyOn(service.historyService, 'addGameToHistory').and.stub();
        const navigateSpy = spyOn(router, 'navigate').and.stub();
        service.onRefreshed(gameInProgress);

        expect(navigateSpy).toHaveBeenCalled();
        expect(sendRoomMessageSpy).toHaveBeenCalled();
        expect(sendSurenderSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(leaveRoomSpy).toHaveBeenCalledWith(gameInProgress.roomName);
        expect(deleteTimerSpy).toHaveBeenCalled();
        expect(addGameToHistorySpy).toHaveBeenCalled();
    });

    it('getGameTypeName should return correct gameType for solo classic', () => {
        const gameType = GameType.SoloClassic;
        const result = service.getGameTypeName(gameType);
        expect(result).toEqual('Solo Classic');
    });

    it('getGameTypeName should return correct gameType for multiplayer classic', () => {
        const gameType = GameType.MultiplayerClassic;
        const result = service.getGameTypeName(gameType);
        expect(result).toEqual('Multiplayer Classic');
    });

    it('getGameTypeName should return correct gameType for solo time', () => {
        const gameType = GameType.SoloTime;
        const result = service.getGameTypeName(gameType);
        expect(result).toEqual('Solo Time');
    });

    it('getGameTypeName should return correct gameType for multiplayer time', () => {
        const gameType = GameType.MultiplayerTime;
        const result = service.getGameTypeName(gameType);
        expect(result).toEqual('Multiplayer Time');
    });

    it('should return "Unknown game type" for an unknown game type', () => {
        const gameType = 'invalid' as unknown;
        expect(() => service.getGameTypeName(gameType as GameType)).toThrowError(`Unknown game type: ${gameType}`);
    });
});
