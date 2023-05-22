/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CHEAT_FLASH_INTERVAL_MS, DEFAULT_HEIGHT, DEFAULT_WIDTH, GameType } from '@app/common/constants';
import { Points } from '@app/common/game-interface';
import { Game, TimeGameSetting } from '@app/common/time-game-interface';
import { EventType } from '@app/interfaces/game-event';
import { ChatService } from '@app/services/chat.service';
import { DrawService } from '@app/services/draw.service';
import { EndgameService } from '@app/services/endgame.service';
import { GameService } from '@app/services/game.service';
import { MultiplayerService } from '@app/services/multiplayer.service';
import { TimeGameSocketService } from '@app/services/time-game-socket.service';
import { VideoReplayService } from '@app/services/video-replay.service';
import { Coordinate } from '@common/coordinate';
import { GameInformation } from '@common/game-information';
import { of } from 'rxjs';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { HintsDisplayComponent } from '../hints-display/hints-display.component';
import { GameComponent } from './game.component';

const STATE_DATA_MOCK = { gameId: 1, username: 'usernameTest' };

const canvasStub1: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub1.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const canvasStub2: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub2.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const TEST_GAME_CARD: GameInformation = { gameId: 1, gameName: 'test', gameDifficulty: 'facile', numberOfDiff: 3 };

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    //let comService: CommunicationService;
    //let audioService: AudioClickService;
    let drawService: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameComponent, ChatBoxComponent, HintsDisplayComponent],
            imports: [HttpClientModule, MatDialogModule, NoopAnimationsModule, RouterTestingModule],
            providers: [MatDialog, DrawService, ChatService, ChatService, GameService, MultiplayerService, EndgameService, TimeGameSocketService],
        }).compileComponents();

        window.history.pushState({ data: STATE_DATA_MOCK }, '', '');
        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        drawService = TestBed.inject(DrawService);
        component.gameService.cheatStatus = false;
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        spyOn(component.comService, 'getGameCard').and.returnValue(of({ gameId: 2, gameName: 'test1', gameDifficulty: 'facile', numberOfDiff: 4 }));

        component.gameInProgress = {
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
    });
    beforeEach(() => {});

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('logCoords should call correctClick if mouse position is defined and left and right pixels are different', async () => {
        spyOn(component.mouse, 'mouseHitDetect').and.returnValue({ x: 10, y: 10 });
        spyOn(component.generalGameService, 'leftAndRightPixelsAreDifferent').and.returnValue(true);
        const points: Points = { numberOfDifferences: 0, numberOfDifferencesAdversary: 0 };
        const logEventSpy = spyOn(component.videoReplayService, 'logEvent').and.stub();
        const correctClickSpy = spyOn(component.gameService, 'correctClick').and.resolveTo({
            points,
            gameInProgress: component.gameInProgress,
        });

        await component.logCoords(new MouseEvent('click'));

        expect(logEventSpy).toHaveBeenCalled();
        expect(correctClickSpy).toHaveBeenCalled();
    });

    it('logCoords should call error if mouse position is defined and left and right pixels are not different', async () => {
        spyOn(component.mouse, 'mouseHitDetect').and.returnValue({ x: 10, y: 10 });
        spyOn(component.generalGameService, 'leftAndRightPixelsAreDifferent').and.returnValue(false);
        const logEventSpy = spyOn(component.videoReplayService, 'logEvent').and.stub();
        const errorClickSpy = spyOn(component.gameService, 'errorClick').and.stub();

        await component.logCoords(new MouseEvent('click'));

        expect(logEventSpy).toHaveBeenCalled();
        expect(errorClickSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call flashDifferencesBothScreens', () => {
        spyOn(component.comService, 'getPixels').and.returnValue(of({ original: [], modified: [] }));
        spyOn(component.comService, 'getAllDifferences').and.returnValue(of([[{ row: 0, col: 0 }]]));
        spyOn(component.draw, 'drawPixels').and.stub();
        component.gameType = GameType.SoloClassic;
        spyOn(component, 'setupSingleplayer').and.stub();
        component.gameService.cheatStatus = true;
        const flashDifferencesBothScreensSpy = spyOn(component, 'flashDifferencesBothScreens').and.stub();
        component.ngAfterViewInit();
        expect(flashDifferencesBothScreensSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call setupMultiplayer', () => {
        spyOn(component.comService, 'getPixels').and.returnValue(of({ original: [], modified: [] }));
        spyOn(component.comService, 'getAllDifferences').and.returnValue(of([[{ row: 0, col: 0 }]]));
        spyOn(component.draw, 'drawPixels').and.stub();
        component.gameType = GameType.MultiplayerClassic;
        const setupMultiplayerVueSpy = spyOn(component, 'setupMultiplayerVue').and.stub();
        component.ngAfterViewInit();
        expect(setupMultiplayerVueSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call setupMultiplayer', () => {
        spyOn(component.comService, 'getPixels').and.returnValue(of({ original: [], modified: [] }));
        spyOn(component.comService, 'getAllDifferences').and.returnValue(of([[{ row: 0, col: 0 }]]));
        spyOn(component.draw, 'drawPixels').and.stub();
        component.gameType = GameType.SoloTime;
        const setupTimeSingleplayerSpy = spyOn(component, 'setupTimeSingleplayer').and.stub();
        component.ngAfterViewInit();
        expect(setupTimeSingleplayerSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call setupMultiplayer', () => {
        spyOn(component.comService, 'getPixels').and.returnValue(of({ original: [], modified: [] }));
        spyOn(component.comService, 'getAllDifferences').and.returnValue(of([[{ row: 0, col: 0 }]]));
        spyOn(component.draw, 'drawPixels').and.stub();
        component.gameType = GameType.MultiplayerTime;
        const setupTimeMultiplayerVueSpy = spyOn(component, 'setupTimeMultiplayerVue').and.stub();
        component.ngAfterViewInit();
        expect(setupTimeMultiplayerVueSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call drawPixels and setupSinglePlayer', () => {
        spyOn(component.comService, 'getPixels').and.returnValue(of({ original: [], modified: [] }));
        spyOn(component.comService, 'getAllDifferences').and.returnValue(of([[{ row: 0, col: 0 }]]));
        spyOn(component.draw, 'drawPixels').and.stub();
        component.gameType = GameType.SoloClassic;
        const setupSingleplayerSpy = spyOn(component, 'setupSingleplayer').and.stub();
        component.ngAfterViewInit();
        expect(setupSingleplayerSpy).toHaveBeenCalled();
    });

    it('getGameCards should modify this.gameCard', () => {
        component.gameInProgress.gameCard = TEST_GAME_CARD;
        component.gameId = 2;
        component.getGameCard();
        expect(component.gameInProgress.gameCard.numberOfDiff).toEqual(4);
        expect(component.gameInProgress.gameCard.gameName).toEqual('test1');
        expect(component.gameInProgress.gameCard.gameId).toEqual(2);
    });

    it('ngOnInit should subscribe to multiplayerService.foundDifference and call subscribers', () => {
        const data: Coordinate[] = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        const subscribersSpy = spyOn(component, 'subscribers').and.stub();
        const correctClickSpy = spyOn(component.gameService, 'correctClickOpponent');
        component.ngOnInit();
        fixture.detectChanges();
        component.multiplayerService.foundDifference.next(data);
        expect(correctClickSpy).toHaveBeenCalled();
        expect(subscribersSpy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to multiplayer.surender and call oponentHasGivenUp', () => {
        const opponentHasGivenUpSpy = spyOn(component.endgameService, 'oponentHasGivenUp').and.stub();
        component.ngOnInit();
        fixture.detectChanges();
        expect(opponentHasGivenUpSpy).not.toHaveBeenCalled();
        component.multiplayerService.surender.next('surrender');
        expect(opponentHasGivenUpSpy).toHaveBeenCalled();
    });

    it('ngOnInit should call a series of functions if the page is refreshed', () => {
        component.refreshed = true;
        const testRoomName = 'test-room';
        component.gameInProgress.roomName = testRoomName;
        const refreshSpy = spyOn(component.endgameService, 'onRefreshed').and.stub();

        component.ngOnInit();
        fixture.detectChanges();

        expect(refreshSpy).toHaveBeenCalled();
    });

    it('ngOnInit should call getGameCard for classic mode', () => {
        component.gameType = GameType.SoloClassic;
        spyOn(component.chatService, 'joinRoom').and.stub();
        spyOn(component, 'getGameCard').and.stub();
        spyOn(component, 'subscribers').and.stub();
        spyOn(component.gameService, 'deactivateCheatStatus').and.stub();
        spyOn(component.endgameService, 'onRefreshed').and.stub();
        component.ngOnInit();
        expect(component.getGameCard).toHaveBeenCalled();
    });

    it('ngOnInit should not call getGameCard for time mode', () => {
        component.gameType = GameType.SoloTime;
        spyOn(component.chatService, 'joinRoom').and.stub();
        spyOn(component, 'getGameCard').and.stub();
        spyOn(component, 'subscribers').and.stub();
        spyOn(component.gameService, 'deactivateCheatStatus').and.stub();
        spyOn(component.endgameService, 'onRefreshed').and.stub();
        component.ngOnInit();
        expect(component.getGameCard).not.toHaveBeenCalled();
    });

    it('should display the cheatOnButton when cheatStatus is true', () => {
        component.gameService.cheatStatus = true;
        fixture.detectChanges();
        const buttonElement = fixture.debugElement.query(By.css('#cheatOnButton'));
        expect(buttonElement).toBeTruthy();
    });

    it('should display the cheatOffButton when cheatStatus is false', () => {
        component.gameService.cheatStatus = false;
        fixture.detectChanges();
        const buttonElement = fixture.debugElement.query(By.css('#btn-surrender'));
        expect(buttonElement).toBeTruthy();
    });

    it('flashDifferences should call drawPixels with leftImagePixels and rightImagePixels alternatively if cheatStatus is true', async () => {
        component.gameService.cheatStatus = true;
        component.gameInProgress.leftImagePixels = [[[]]];
        component.gameInProgress.rightImagePixels = [[[]]];
        const lastImage = [[[]]];
        const drawPixelsSpy = spyOn(drawService, 'drawPixels').and.stub();

        jasmine.clock().uninstall();
        jasmine.clock().install();
        component.flashAllDifferences(ctxStub, lastImage);
        jasmine.clock().tick(CHEAT_FLASH_INTERVAL_MS * 2);
        jasmine.clock().uninstall();

        expect(drawPixelsSpy).toHaveBeenCalledTimes(2);
    });

    it('flashDifferences should call drawPixels with lastImage if cheatStatus becomes false during the interval', async () => {
        component.gameService.cheatStatus = false;
        const lastImage = [[[]]];
        const drawPixelsSpy = spyOn(drawService, 'drawPixels').and.stub();

        jasmine.clock().uninstall();
        jasmine.clock().install();
        component.flashAllDifferences(ctxStub, lastImage);
        jasmine.clock().tick(CHEAT_FLASH_INTERVAL_MS * 2);
        jasmine.clock().uninstall();

        expect(drawPixelsSpy).toHaveBeenCalledTimes(1);
    });

    it('pressing the t key should call the cheatButton function if the chatbox is not the target', () => {
        VideoReplayService.isPlayingReplay = false;
        const cheatButtonSpy = spyOn(component, 'cheatButton').and.stub();
        const keyEvent = new KeyboardEvent('keydown', { key: 't' });
        Object.defineProperty(keyEvent, 'target', { value: document.createElement('div') });
        component.onKeydownT(keyEvent);
        fixture.detectChanges();
        expect(cheatButtonSpy).toHaveBeenCalled();
    });

    it('pressing the t key should not call the cheatButton function if the chatbox is the target', () => {
        VideoReplayService.isPlayingReplay = false;
        const cheatButtonSpy = spyOn(component, 'cheatButton').and.stub();
        const keyEvent = new KeyboardEvent('keydown', { key: 't' });
        Object.defineProperty(keyEvent, 'target', { value: component.chatBoxContainer.nativeElement });
        component.onKeydownT(keyEvent);
        fixture.detectChanges();
        expect(cheatButtonSpy).not.toHaveBeenCalled();
    });

    it('pressing the i key should call the hintManagement function if the chatbox is not the target', () => {
        VideoReplayService.isPlayingReplay = false;
        const hintManagementSpy = spyOn(component, 'hintManagement').and.stub();
        const keyEvent = new KeyboardEvent('keydown', { key: 't' });
        spyOn(component.generalGameService, 'differenceRandomizer').and.returnValue(0);
        Object.defineProperty(keyEvent, 'target', { value: document.createElement('div') });
        component.onKeydownI(keyEvent);
        fixture.detectChanges();
        expect(hintManagementSpy).toHaveBeenCalled();
    });

    it('onPopState should call surrenderGame() event is triggered', () => {
        const surrenderGameSpy = spyOn(component.endgameService, 'surrenderGame').and.stub();

        component.onPopState();
        fixture.detectChanges();

        expect(surrenderGameSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to multiplayerService.foundDifference', () => {
        const correctClickOpponentSpy = spyOn(component.gameService, 'correctClickOpponent').and.stub();
        component.subscribers();
        component.multiplayerService.foundDifference.next([{ row: 1, col: 1 }]);
        expect(correctClickOpponentSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to multiplayerService.surender', () => {
        const oponentHasGivenUpSpy = spyOn(component.endgameService, 'oponentHasGivenUp').and.stub();
        component.subscribers();
        component.multiplayerService.surender.next('room');
        expect(oponentHasGivenUpSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to multiplayerService.loser', () => {
        const loseGameSpy = spyOn(component.endgameService, 'loseGame').and.stub();
        component.subscribers();
        component.multiplayerService.loser.next('room');
        expect(loseGameSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to timeGameSocketService.gameData', () => {
        const timeGameOnSubscriptionSpy = spyOn(component.gameService, 'timeGameOnSubscription').and.stub();
        component.subscribers();
        const game: Game = {
            gameDifferences: [],
            gameOriginal: 'o',
            gameModified: 'm',
            gameInformation: { gameId: 1, gameName: '1', gameDifficulty: 'facile', numberOfDiff: 3 },
        };
        component.timeGameSocketService.gameData.next(game);
        expect(timeGameOnSubscriptionSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to videoReplayService.startReplaySubject', () => {
        const startReplaySpy = spyOn(component.gameService, 'startReplay').and.stub();
        component.subscribers();
        component.videoReplayService.startReplaySubject.next({ roomName: component.gameInProgress.roomName, speed: 1 });
        expect(startReplaySpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to timeGameSocketService.gameSetting', () => {
        const timeGameSettingOnSubscriptionSpy = spyOn(component.gameService, 'timeGameSettingOnSubscription').and.stub();
        const timeGameSetting: TimeGameSetting = { startTime: 60, penaltyTime: 3, bonusTime: 2 };
        component.subscribers();
        component.timeGameSocketService.gameSetting.next(timeGameSetting);
        expect(timeGameSettingOnSubscriptionSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to videoReplayService.restartReplaySubject', () => {
        const togglePlayPauseSpy = spyOn(component, 'togglePlayPause').and.stub();
        component.subscribers();
        component.videoReplayService.restartReplaySubject.next({});
        expect(togglePlayPauseSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to endgameService.timeAbandonSubject', () => {
        component.usernameRef.nativeElement.style.visibility = 'visible';
        const disableAndHideContainerSpy = spyOn(component.chatBox, 'disableAndHideContainer').and.stub();
        component.subscribers();
        component.endgameService.timeAbandonSubject.next({});
        expect(disableAndHideContainerSpy).toHaveBeenCalled();
        expect(component.gameInProgress.gameType).toEqual(GameType.SoloTime);
        expect(component.usernameRef.nativeElement.style.visibility).toEqual('hidden');
    });

    it('subscribers should subscribe to videoReplayService.logCoordsReplaySubject', () => {
        const logCoordsSpy = spyOn(component, 'logCoords').and.stub();
        const event: MouseEvent = new MouseEvent('click');
        component.subscribers();
        component.videoReplayService.logCoordsReplaySubject.next(event);
        expect(logCoordsSpy).toHaveBeenCalledWith(event);
    });

    it('subscribers should subscribe to videoReplayService.cheatModeReplaySubject', () => {
        const cheatButtonSpy = spyOn(component, 'cheatButton').and.stub();
        const event: MouseEvent = new MouseEvent('click');
        component.subscribers();
        component.videoReplayService.cheatModeReplaySubject.next(event);
        expect(cheatButtonSpy).toHaveBeenCalledWith(event);
    });

    it('subscribers should subscribe to timeGameSocketService.loseGame', () => {
        const loseGameSpy = spyOn(component.endgameService, 'loseGame').and.stub();
        component.subscribers();
        component.timeGameSocketService.loseGame.next({});
        expect(loseGameSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to endgameService.replaySubject', () => {
        const deactivateCheatStatusSpy = spyOn(component.gameService, 'deactivateCheatStatus').and.stub();
        const showReplayContainerSpy = spyOn(component, 'showReplayContainer').and.stub();
        const disableEventsSpy = spyOn(component, 'disableEvents').and.stub();

        component.subscribers();
        component.endgameService.replaySubject.next({});
        expect(deactivateCheatStatusSpy).toHaveBeenCalled();
        expect(showReplayContainerSpy).toHaveBeenCalled();
        expect(disableEventsSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to endgameService.restartSubject', () => {
        const restartWithoutDeletingTimerSpy = spyOn(component.videoReplayService, 'restartWithoutDeletingTimer').and.stub();
        component.subscribers();
        component.endgameService.restartSubject.next({});
        expect(restartWithoutDeletingTimerSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to videoReplayService.hintReplaySubject', () => {
        const hintManagementSpy = spyOn(component, 'hintManagement').and.stub();
        component.subscribers();
        component.videoReplayService.hintReplaySubject.next(0);
        expect(hintManagementSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to videoReplayService.opponentReplaySubject', () => {
        const correctClickOpponentSpy = spyOn(component.gameService, 'correctClickOpponent').and.resolveTo({
            numberOfDifferences: 0,
            numberOfDifferencesAdversary: 0,
        });
        component.subscribers();
        component.videoReplayService.opponentReplaySubject.next([{ row: 0, col: 0 }]);
        expect(correctClickOpponentSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to videoReplayService.closeThirdHintSubject', () => {
        const closeAllSpy = spyOn(component.dialog, 'closeAll').and.stub();
        component.subscribers();
        component.videoReplayService.closeThirdHintSubject.next({});
        expect(closeAllSpy).toHaveBeenCalled();
    });

    it('subscribers should subscribe to gameService.closedDialogSubject', () => {
        const logEventSpy = spyOn(component.videoReplayService, 'logEvent').and.stub();
        component.subscribers();
        component.gameService.closedDialogSubject.next({});
        expect(logEventSpy).toHaveBeenCalled();
    });

    it('setupMultiplayerVue should call a series of functions', () => {
        component.gameId = 1;
        component.gameInProgress.numberOfPlayer = 1;
        const normalGameSetupSpy = spyOn(component.gameService, 'normalGameSetup').and.stub();
        component.usernameRef.nativeElement.style.visibility = 'hidden';
        component.pointsRef.nativeElement.style.visibility = 'hidden';

        component.setupMultiplayerVue();

        expect(normalGameSetupSpy).toHaveBeenCalledWith(1, component.gameInProgress);
        expect(component.gameInProgress.numberOfPlayer).toEqual(2);
        expect(component.usernameRef.nativeElement.style.visibility).toEqual('visible');
        expect(component.pointsRef.nativeElement.style.visibility).toEqual('visible');
    });

    it('setupSingleplayer should call a series of functions', () => {
        component.gameId = 1;
        component.gameInProgress.numberOfPlayer = 2;
        const normalGameSetupSpy = spyOn(component.gameService, 'normalGameSetup').and.stub();
        const disableAndHideContainerSpy = spyOn(component.chatBox, 'disableAndHideContainer').and.stub();
        const makeButtonVisibleSpy = spyOn(component.hintComponent, 'makeButtonVisible').and.stub();
        component.usernameRef.nativeElement.style.visibility = 'visible';
        component.pointsRef.nativeElement.style.visibility = 'visible';

        component.setupSingleplayer();

        expect(normalGameSetupSpy).toHaveBeenCalledWith(1, component.gameInProgress);
        expect(disableAndHideContainerSpy).toHaveBeenCalled();
        expect(makeButtonVisibleSpy).toHaveBeenCalled();
        expect(component.gameInProgress.numberOfPlayer).toEqual(1);
        expect(component.usernameRef.nativeElement.style.visibility).toEqual('hidden');
        expect(component.pointsRef.nativeElement.style.visibility).toEqual('hidden');
    });

    it('setupTimeSingleplayer should call a series of functions', () => {
        component.gameInProgress.numberOfPlayer = 2;
        const timeGameSetupSpy = spyOn(component.gameService, 'timeGameSetup').and.stub();
        const disableAndHideContainerSpy = spyOn(component.chatBox, 'disableAndHideContainer').and.stub();
        const makeButtonVisibleSpy = spyOn(component.hintComponent, 'makeButtonVisible').and.stub();
        component.usernameRef.nativeElement.style.visibility = 'visible';
        component.pointsRef.nativeElement.style.visibility = 'visible';

        component.setupTimeSingleplayer();

        expect(timeGameSetupSpy).toHaveBeenCalledWith(component.gameInProgress);
        expect(disableAndHideContainerSpy).toHaveBeenCalled();
        expect(makeButtonVisibleSpy).toHaveBeenCalled();
        expect(component.gameInProgress.numberOfPlayer).toEqual(1);
        expect(component.usernameRef.nativeElement.style.visibility).toEqual('hidden');
        expect(component.pointsRef.nativeElement.style.visibility).toEqual('hidden');
    });

    it('setupTimeMultiplayerVue should call a series of functions', () => {
        component.gameInProgress.numberOfPlayer = 1;
        const timeGameSetupSpy = spyOn(component.gameService, 'timeGameSetup').and.stub();
        component.usernameRef.nativeElement.style.visibility = 'hidden';
        component.pointsRef.nativeElement.style.visibility = 'visible';

        component.setupTimeMultiplayerVue();

        expect(timeGameSetupSpy).toHaveBeenCalledWith(component.gameInProgress);
        expect(component.gameInProgress.numberOfPlayer).toEqual(2);
        expect(component.usernameRef.nativeElement.style.visibility).toEqual('visible');
        expect(component.pointsRef.nativeElement.style.visibility).toEqual('hidden');
    });

    it('cheatButton should call a series of functions', () => {
        const logEventSpy = spyOn(component.videoReplayService, 'logEvent').and.stub();
        const reverseCheatStatusSpy = spyOn(component.gameService, 'reverseCheatStatus').and.stub();
        const flashDifferencesBothScreensSpy = spyOn(component, 'flashDifferencesBothScreens').and.stub();
        const mouseEvent: MouseEvent = new MouseEvent('click');

        component.cheatButton(mouseEvent);

        expect(logEventSpy).toHaveBeenCalledWith(EventType.Cheat, mouseEvent);
        expect(reverseCheatStatusSpy).toHaveBeenCalled();
        expect(flashDifferencesBothScreensSpy).toHaveBeenCalled();
    });

    it('togglePlayPause should reverse the toolTip, icon and call service', () => {
        component.playBack.playPauseToolTip = 'Jouer';
        component.playBack.playPauseIcon = 'play_arrow';
        component.videoReplayService.isPaused = true;
        const togglePlayPauseSpy = spyOn(component.videoReplayService, 'togglePlayPause').and.stub();

        component.togglePlayPause();

        expect(component.playBack.playPauseToolTip).toEqual('Pause');
        expect(component.playBack.playPauseIcon).toEqual('pause');
        expect(togglePlayPauseSpy).toHaveBeenCalled();
    });

    it('togglePlayPause should reverse the toolTip, icon and call service', () => {
        component.playBack.playPauseToolTip = 'Pause';
        component.playBack.playPauseIcon = 'pause';
        component.videoReplayService.isPaused = false;
        const togglePlayPauseSpy = spyOn(component.videoReplayService, 'togglePlayPause').and.stub();

        component.togglePlayPause();

        expect(component.playBack.playPauseToolTip).toEqual('Jouer');
        expect(component.playBack.playPauseIcon).toEqual('play_arrow');
        expect(togglePlayPauseSpy).toHaveBeenCalled();
    });

    it('showReplayContainer should set the display style of the replay container element to block', () => {
        component.showReplayContainer();

        expect(component.showReplayButtons).toBeTruthy();
    });

    it('disableEvents should remove event listeners from the canvas and cheat button elements', () => {
        const canvas1Spy = spyOn(component.canvas1.nativeElement, 'removeEventListener').and.callThrough();
        const canvas2Spy = spyOn(component.canvas2.nativeElement, 'removeEventListener').and.callThrough();
        const cheatButtonContainerSpy = spyOn(component.cheatButtonContainer.nativeElement, 'removeEventListener').and.callThrough();

        component.disableEvents();

        expect(canvas1Spy).toHaveBeenCalledWith('click', component.logCoords);
        expect(canvas2Spy).toHaveBeenCalledWith('click', component.logCoords);
        expect(cheatButtonContainerSpy).toHaveBeenCalledWith('click', component.cheatButton);
    });

    it('enableEvents should add event listeners to the canvas and cheat button elements', () => {
        const canvas1Spy = spyOn(component.canvas1.nativeElement, 'addEventListener');
        const canvas2Spy = spyOn(component.canvas2.nativeElement, 'addEventListener');
        const cheatButtonContainerSpy = spyOn(component.cheatButtonContainer.nativeElement, 'addEventListener');
        const logCoordsSpy = spyOn(component, 'logCoords').and.stub();
        const cheatButtonSpy = spyOn(component, 'cheatButton').and.stub();

        component.enableEvents();

        const canvas1ClickEvent = new MouseEvent('click');
        const canvas2ClickEvent = new MouseEvent('click');
        component.canvas1.nativeElement.dispatchEvent(canvas1ClickEvent);
        component.canvas2.nativeElement.dispatchEvent(canvas2ClickEvent);

        const cheatButtonClickEvent = new MouseEvent('click');
        component.cheatButtonContainer.nativeElement.dispatchEvent(cheatButtonClickEvent);

        expect(canvas1Spy).toHaveBeenCalledWith('click', jasmine.any(Function));
        expect(canvas2Spy).toHaveBeenCalledWith('click', jasmine.any(Function));
        expect(cheatButtonContainerSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
        expect(logCoordsSpy).toHaveBeenCalledTimes(2);
        expect(cheatButtonSpy).toHaveBeenCalled();
    });
    it('should not call removeHint and drawhint if hintNumber is zero or less', () => {
        component.hintComponent.hintNumber = 0;
        const removeSpy = spyOn(component.hintComponent, 'removeHint');
        const drawSpy = spyOn(component.gameService, 'drawHint');
        component.hintManagement(0);
        expect(removeSpy).not.toHaveBeenCalled();
        expect(drawSpy).not.toHaveBeenCalled();
        component.hintComponent.hintNumber = 1;
        component.hintManagement(0);
        expect(removeSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });
});
