/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, GameType } from '@app/common/constants';
import { GameInProgress, Points } from '@app/common/game-interface';
import { TimeGameSetting } from '@app/common/time-game-interface';
import { HintsDisplayComponent } from '@app/components/hints-display/hints-display.component';
import { ThirdHintComponent } from '@app/components/third-hint/third-hint.component';
import { Vec2 } from '@app/interfaces/vec2';
import { AudioClickService } from '@app/services/audio-click.service';
import { Coordinate } from '@common/coordinate';
import { of } from 'rxjs';
import { ChatService } from './chat.service';
import { DrawService } from './draw.service';
import { EndgameService } from './endgame.service';
import { GameService } from './game.service';
import { MultiplayerService } from './multiplayer.service';
import { TimeGameSocketService } from './time-game-socket.service';
import { VideoReplayService } from './video-replay.service';

const canvasStub1: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub1.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const canvasStub2: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub2.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const pointsTest: Points = { numberOfDifferences: 0, numberOfDifferencesAdversary: 0 };

describe('GameService', () => {
    let service: GameService;
    let audioClickService: AudioClickService;
    let chatService: ChatService;
    let timeGameSocketService: TimeGameSocketService;
    let drawService: DrawService;
    let gameInProgress: GameInProgress;
    let ctxStub: CanvasRenderingContext2D;
    let hintsComponent: HintsDisplayComponent;
    let fixture: ComponentFixture<HintsDisplayComponent>;

    const LEFT_IMAGE_PIXELS_MOCK = [
        [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
        ],
        [
            [11, 12, 13, 14],
            [15, 16, 17, 18],
        ],
    ];
    const RIGHT_IMAGE_PIXELS_MOCK = [
        [
            [21, 22, 23, 24],
            [25, 26, 27, 28],
        ],
        [
            [31, 32, 33, 34],
            [35, 36, 37, 38],
        ],
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HintsDisplayComponent],
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            providers: [EndgameService, ChatService, DrawService, MultiplayerService, TimeGameSocketService, AudioClickService, MatDialog],
        }).compileComponents();
        service = TestBed.inject(GameService);
        audioClickService = TestBed.inject(AudioClickService);
        chatService = TestBed.inject(ChatService);
        timeGameSocketService = TestBed.inject(TimeGameSocketService);
        drawService = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        fixture = TestBed.createComponent(HintsDisplayComponent);

        hintsComponent = fixture.componentInstance;
        fixture.detectChanges();

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

        gameInProgress.gameCard = { gameId: 1, gameName: 'test', gameDifficulty: 'facile', numberOfDiff: 3 };
        (canvasStub1.nativeElement.getContext as jasmine.Spy).and.returnValue(ctxStub);
        (canvasStub2.nativeElement.getContext as jasmine.Spy).and.returnValue(ctxStub);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isDifferentPixel', () => {
        it('removeDifferenceFromRightPixels should modify rightImagePixels', () => {
            const pixelsToModify: Coordinate[] = [
                { row: 0, col: 0 },
                { row: 1, col: 1 },
            ];
            const res = service.removeDifferenceFromRightPixels(pixelsToModify, RIGHT_IMAGE_PIXELS_MOCK, LEFT_IMAGE_PIXELS_MOCK);
            expect(res).not.toEqual([
                [
                    [21, 22, 23, 24],
                    [25, 26, 27, 28],
                ],
                [
                    [31, 32, 33, 34],
                    [35, 36, 37, 38],
                ],
            ]);
            expect(res).toEqual([
                [
                    [1, 2, 3, 4],
                    [25, 26, 27, 28],
                ],
                [
                    [31, 32, 33, 34],
                    [15, 16, 17, 18],
                ],
            ]);
        });
    });

    it('correctClickClassic should call functions... if mouse position is defined and left and right pixels are different', () => {
        pointsTest.numberOfDifferences = 2;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        spyOn(service.endgameService, 'endGame').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        const removeDifferenceFromRightPixelsSpy = spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        const flashDifferenceSpy = spyOn(service, 'flashDifference').and.stub();
        service.correctClickClassic({ coords: data, index: 0 }, true, gameInProgress, pointsTest);
        expect(removeDifferenceFromRightPixelsSpy).toHaveBeenCalled();
        expect(flashDifferenceSpy).toHaveBeenCalled();
    });

    it('correctClickClassic should not call endGame if number of differences is not reached', () => {
        pointsTest.numberOfDifferences = 0;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        spyOn(service, 'flashDifference').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        const endGameSpy = spyOn(service.endgameService, 'endGame').and.stub();
        service.correctClickClassic({ coords: data, index: 0 }, true, gameInProgress, pointsTest);
        expect(endGameSpy).not.toHaveBeenCalled();
    });

    it('correctClickClassic should send a room message with the correct format when isCurrentPlayer is true in multiplayer mode', () => {
        pointsTest.numberOfDifferences = 0;
        VideoReplayService.isPlayingReplay = false;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        gameInProgress.gameType = GameType.MultiplayerClassic;
        gameInProgress.username = 'John';
        spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        spyOn(service, 'flashDifference').and.stub();
        spyOn(service.chatService, 'formatTime').and.returnValue('12:00');
        spyOn(service.chatService, 'foundDifferenceAction').and.stub();
        spyOn(service.endgameService, 'endGame').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        service.correctClickClassic({ coords: data, index: 0 }, true, gameInProgress, pointsTest);
        expect(service.chatService.foundDifferenceAction).toHaveBeenCalledWith(
            gameInProgress.gameType,
            gameInProgress.username,
            gameInProgress.roomName,
        );
    });

    it('correctClickClassic should send a room message with the correct format when isCurrentPlayer is true in singleplayer mode', () => {
        pointsTest.numberOfDifferences = 0;
        VideoReplayService.isPlayingReplay = false;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        gameInProgress.gameType = GameType.SoloClassic;
        spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        spyOn(service, 'flashDifference').and.stub();
        spyOn(service.chatService, 'formatTime').and.returnValue('12:00');
        spyOn(service.chatService, 'foundDifferenceAction').and.stub();
        spyOn(service.endgameService, 'endGame').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        service.correctClickClassic({ coords: data, index: 0 }, true, gameInProgress, pointsTest);
        expect(service.chatService.foundDifferenceAction).toHaveBeenCalledWith(
            gameInProgress.gameType,
            gameInProgress.username,
            gameInProgress.roomName,
        );
    });

    it('correctClickClassic should call endGame when numberOfDifferences equals the calculated value', () => {
        gameInProgress.numberOfPlayer = 1;
        pointsTest.numberOfDifferences = 2;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        spyOn(service, 'flashDifference').and.stub();
        spyOn(service.endgameService, 'endGame').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        service.correctClickClassic({ coords: data, index: 0 }, true, gameInProgress, pointsTest);
        expect(service.endgameService.endGame).toHaveBeenCalled();
    });

    it('correctClickClassic should increment numberOfDifferencesAdversary if isCurrentPlayer is false', () => {
        pointsTest.numberOfDifferences = 2;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        pointsTest.numberOfDifferencesAdversary = 2;
        spyOn(service.endgameService, 'endGame').and.stub();
        const removeDifferenceFromRightPixelsSpy = spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        const flashDifferenceSpy = spyOn(service, 'flashDifference').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        const points: Points = service.correctClickClassic({ coords: data, index: 0 }, false, gameInProgress, pointsTest).points;
        expect(removeDifferenceFromRightPixelsSpy).toHaveBeenCalled();
        expect(flashDifferenceSpy).toHaveBeenCalled();
        expect(points.numberOfDifferencesAdversary).toEqual(3);
    });

    it('correctClickClassic should increment numberOfDifferencesAdversary if isCurrentPlayer is false', () => {
        pointsTest.numberOfDifferences = 2;
        const data = [
            { row: 10, col: 10 },
            { row: 11, col: 10 },
        ];
        pointsTest.numberOfDifferencesAdversary = 2;
        gameInProgress.gameCard.numberOfDiff = 5;
        VideoReplayService.isPlayingReplay = true;
        const openLoseAndReplayMessageSpy = spyOn(service.endgameService, 'openLoseAndReplayMessage').and.stub();
        const removeDifferenceFromRightPixelsSpy = spyOn(service, 'removeDifferenceFromRightPixels').and.stub();
        const flashDifferenceSpy = spyOn(service, 'flashDifference').and.stub();
        spyOn(service.audio, 'playRight').and.stub();
        const points: Points = service.correctClickClassic({ coords: data, index: 0 }, false, gameInProgress, pointsTest).points;
        expect(removeDifferenceFromRightPixelsSpy).toHaveBeenCalled();
        expect(flashDifferenceSpy).toHaveBeenCalled();
        expect(points.numberOfDifferencesAdversary).toEqual(3);
        expect(openLoseAndReplayMessageSpy).toHaveBeenCalled();
    });

    it('correctClick should play audio when called', () => {
        spyOn(service.audio, 'playRight').and.stub();
        spyOn(service, 'correctClickClassic').and.returnValue({
            points: { numberOfDifferences: 1, numberOfDifferencesAdversary: 0 },
            gameInProgress,
        });
        const clickCoord = { x: 0, y: 0 };
        service.correctClick(clickCoord, gameInProgress, pointsTest);
        expect(service.audio.playRight).toHaveBeenCalled();
    });

    it('correctClick should call correctClickClassic if the game type is classic', () => {
        spyOn(service.audio, 'playRight').and.stub();
        spyOn(service, 'correctClickClassic').and.returnValue({
            points: { numberOfDifferences: 1, numberOfDifferencesAdversary: 0 },
            gameInProgress,
        });
        const clickCoord = { x: 0, y: 0 };
        gameInProgress.gameType = GameType.SoloClassic;
        service.correctClick(clickCoord, gameInProgress, pointsTest);
        expect(service.correctClickClassic).toHaveBeenCalled();
    });

    it('correctClick should call correctClickTime if the game type is not classic', async () => {
        spyOn(service.audio, 'playRight').and.stub();
        spyOn(service, 'correctClickTime').and.resolveTo({ numberOfDifferences: 1, numberOfDifferencesAdversary: 0 });
        const clickCoord = { x: 0, y: 0 };
        gameInProgress.gameType = GameType.MultiplayerTime;
        await service.correctClick(clickCoord, gameInProgress, pointsTest);
        expect(service.correctClickTime).toHaveBeenCalled();
    });

    it('correctClick should return the updated points', async () => {
        spyOn(service.audio, 'playRight').and.stub();
        spyOn(service, 'correctClickClassic').and.returnValue({
            points: { numberOfDifferences: 1, numberOfDifferencesAdversary: 0 },
            gameInProgress,
        });
        const clickCoord = { x: 0, y: 0 };
        gameInProgress.gameType = GameType.SoloClassic;
        const updatedPoints = await service.correctClick(clickCoord, gameInProgress, pointsTest);
        expect(updatedPoints.points.numberOfDifferences).toBe(1);
    });

    it('correctClickOpponent should call correctClickClassic if gameType is SoloClassic', () => {
        const points: Points = { numberOfDifferences: 0, numberOfDifferencesAdversary: 0 };
        const spyCorrectClickClassic = spyOn(service, 'correctClickClassic').and.returnValue({ points, gameInProgress });
        spyOn(service, 'correctClickTime');
        const playRightSpy = spyOn(service.audio, 'playRight').and.stub();
        const data: Coordinate[] = [{ row: 0, col: 0 }];

        gameInProgress.gameType = GameType.SoloClassic;

        service.correctClickOpponent({ coords: data, index: 0 }, gameInProgress, pointsTest);

        expect(spyCorrectClickClassic).toHaveBeenCalledWith({ coords: data, index: 0 }, false, gameInProgress, pointsTest);
        expect(playRightSpy).toHaveBeenCalled();
    });

    it('correctClickOpponent should call correctClickTime if gameType is not SoloClassic', async () => {
        spyOn(service, 'correctClickClassic');
        const spyCorrectClickTime = spyOn(service, 'correctClickTime');
        const playRightSpy = spyOn(service.audio, 'playRight').and.stub();
        const data: Coordinate[] = [{ row: 0, col: 0 }];
        gameInProgress.gameType = GameType.MultiplayerTime;

        await service.correctClickOpponent({ coords: data, index: 0 }, gameInProgress, pointsTest);

        expect(spyCorrectClickTime).toHaveBeenCalledWith({ coords: data, index: 0 }, false, gameInProgress, pointsTest);
        expect(playRightSpy).toHaveBeenCalled();
    });

    it('errorClick should play the wrong audio', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(audioClickService, 'playWrong');
        spyOn(chatService, 'errorAction');
        spyOn(timeGameSocketService, 'decrementTimer');
        spyOn(drawService, 'drawWord');
        const clickCoord: Vec2 = { x: 0, y: 0 };
        const canvas = document.createElement('canvas');
        const mockEvent = { target: canvas } as unknown as Event;
        service.errorClick(mockEvent, gameInProgress, clickCoord);
        expect(audioClickService.playWrong).toHaveBeenCalled();
    });

    it('errorClick should call errorAction on the chat service', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(audioClickService, 'playWrong');
        spyOn(chatService, 'errorAction');
        spyOn(timeGameSocketService, 'decrementTimer');
        spyOn(drawService, 'drawWord');
        const clickCoord: Vec2 = { x: 0, y: 0 };
        const canvas = document.createElement('canvas');
        const mockEvent = { target: canvas } as unknown as Event;
        service.errorClick(mockEvent, gameInProgress, clickCoord);
        expect(chatService.errorAction).toHaveBeenCalledWith(gameInProgress.gameType, gameInProgress.username, gameInProgress.roomName);
    });

    it('errorClick should call decrementTimer if timeGame on the chat service', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(audioClickService, 'playWrong');
        spyOn(chatService, 'errorAction');
        spyOn(timeGameSocketService, 'decrementTimer');
        spyOn(drawService, 'drawWord');
        gameInProgress.gameType = GameType.SoloTime;
        const clickCoord: Vec2 = { x: 0, y: 0 };
        const canvas = document.createElement('canvas');
        const mockEvent = { target: canvas } as unknown as Event;
        service.errorClick(mockEvent, gameInProgress, clickCoord);
        expect(timeGameSocketService.decrementTimer).toHaveBeenCalledWith(gameInProgress.roomName, gameInProgress.penaltyTime);
    });

    it('errorClick should not call decrementTimer if not timeGame on the chat service', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(audioClickService, 'playWrong');
        spyOn(chatService, 'errorAction');
        spyOn(timeGameSocketService, 'decrementTimer');
        spyOn(drawService, 'drawWord');
        gameInProgress.gameType = GameType.SoloClassic;
        const clickCoord: Vec2 = { x: 0, y: 0 };
        const canvas = document.createElement('canvas');
        const mockEvent = { target: canvas } as unknown as Event;
        service.errorClick(mockEvent, gameInProgress, clickCoord);
        expect(timeGameSocketService.decrementTimer).not.toHaveBeenCalled();
    });

    it('errorClick should call errorAction on the chat service', () => {
        VideoReplayService.isPlayingReplay = false;
        spyOn(audioClickService, 'playWrong');
        spyOn(chatService, 'errorAction');
        spyOn(timeGameSocketService, 'decrementTimer');
        spyOn(drawService, 'drawWord');
        const clickCoord: Vec2 = { x: 0, y: 0 };
        const canvas = document.createElement('canvas');
        const mockEvent = { target: canvas } as unknown as Event;
        service.errorClick(mockEvent, gameInProgress, clickCoord);
        expect(drawService.drawWord).toHaveBeenCalled();
    });

    it('should increase the number of differences and call removeData if isCurrentPlayer is true', async () => {
        const data: Coordinate[] = [{ row: 1, col: 2 }];
        let points: Points = { numberOfDifferences: 0, numberOfDifferencesAdversary: 3 };
        const expectedPoints: Points = { numberOfDifferences: 1, numberOfDifferencesAdversary: 3 };
        gameInProgress.timeGameOriginal = ['1', '2', '3', '4', '5', '6', '7'];

        const foundDifferenceActionSpy = spyOn(service.chatService, 'foundDifferenceAction').and.stub();
        const sendRemoveDataSpy = spyOn(service.multiplayerService, 'sendRemoveData').and.stub();
        const drawImgUrlSpy = spyOn(service.draw, 'drawImgUrl').and.stub();
        const incrementTimerSpy = spyOn(service.timeGameSocketService, 'incrementTimer').and.stub();

        points = await service.correctClickTime({ coords: data, index: 0 }, true, gameInProgress, points);

        expect(incrementTimerSpy).toHaveBeenCalledWith(gameInProgress.roomName, gameInProgress.bonusTime);
        expect(foundDifferenceActionSpy).toHaveBeenCalledWith(gameInProgress.gameType, gameInProgress.username, gameInProgress.roomName);
        expect(sendRemoveDataSpy).toHaveBeenCalledWith(gameInProgress.roomName, data);
        expect(points.numberOfDifferences).toEqual(expectedPoints.numberOfDifferences);
        expect(drawImgUrlSpy).toHaveBeenCalledTimes(2);
    });

    it('should endGame if max number of points is equal to numberOfPoints', async () => {
        const data: Coordinate[] = [{ row: 1, col: 2 }];
        let points: Points = { numberOfDifferences: 1, numberOfDifferencesAdversary: 3 };
        gameInProgress.timeGameOriginal = ['1', '2'];

        spyOn(service.timeGameSocketService, 'incrementTimer').and.stub();
        const foundDifferenceActionSpy = spyOn(service.chatService, 'foundDifferenceAction').and.stub();
        const sendRemoveDataSpy = spyOn(service.multiplayerService, 'sendRemoveData').and.stub();
        spyOn(service.draw, 'drawImgUrl').and.stub();
        const endGameSpy = spyOn(service.endgameService, 'endGame').and.stub();
        spyOn(JSON, 'stringify').and.returnValue('test');
        spyOn(JSON, 'parse').and.stub();

        points = await service.correctClickTime({ coords: data, index: 0 }, false, gameInProgress, points);

        expect(foundDifferenceActionSpy).not.toHaveBeenCalled();
        expect(sendRemoveDataSpy).not.toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalledWith(gameInProgress);
    });

    it('flashDifference should call drawPixels 5 times and change rightImagePixels', async () => {
        jasmine.clock().install();
        const updateRightCanvasSpy = spyOn(service.draw, 'drawPixels').and.callFake(() => {
            return;
        });

        const rightImagePixels = RIGHT_IMAGE_PIXELS_MOCK;
        service.tempRightImagePixels = LEFT_IMAGE_PIXELS_MOCK;

        service.flashDifference(ctxStub, rightImagePixels);
        jasmine.clock().tick(250);
        jasmine.clock().tick(250);
        jasmine.clock().tick(250);
        jasmine.clock().tick(250);
        jasmine.clock().tick(250);
        jasmine.clock().tick(250);
        jasmine.clock().uninstall();
        expect(updateRightCanvasSpy).toHaveBeenCalledTimes(5);
        expect(service.tempRightImagePixels).toEqual(rightImagePixels);
    });

    it('openThirdHint should open Dialog with thirdHintComponent', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of({}));
        const openSpy = spyOn(service.dialog, 'open').and.returnValue(dialogRefSpy);
        spyOn(service.generalGameService, 'differenceRandomizer').and.returnValue(0);
        service.openThirdHint([{ row: 1, col: 1 }], hintsComponent);
        expect(openSpy).toHaveBeenCalledWith(ThirdHintComponent, { data: { difference: [{ row: 1, col: 1 }] } });
    });

    it('drawHint should call drawRectangle if 3 hints remain', () => {
        const difference: Coordinate[] = [
            { row: 200, col: 200 },
            { row: 201, col: 200 },
        ];
        hintsComponent.hintNumber = 2;
        const drawRectangleSpy = spyOn(service.rectangleService, 'drawRectangle').and.stub();

        service.drawHint(difference, gameInProgress, hintsComponent);

        expect(drawRectangleSpy).toHaveBeenCalledWith(ctxStub, { x: 40, y: 81 }, { x: 360, y: 321 });
    });

    it('drawHint should call drawRectangle if 2 hints remain', () => {
        const difference: Coordinate[] = [
            { row: 200, col: 200 },
            { row: 201, col: 200 },
        ];
        hintsComponent.hintNumber = 1;
        const drawRectangleSpy = spyOn(service.rectangleService, 'drawRectangle').and.stub();

        service.drawHint(difference, gameInProgress, hintsComponent);

        expect(drawRectangleSpy).toHaveBeenCalledWith(ctxStub, { x: 160, y: 171 }, { x: 240, y: 231 });
    });

    it('drawHint should open dialog if 1 hint remains', () => {
        const difference: Coordinate[] = [
            { row: 200, col: 200 },
            { row: 201, col: 200 },
        ];
        hintsComponent.hintNumber = 0;
        const openSpy = spyOn(service, 'openThirdHint').and.stub();

        service.drawHint(difference, gameInProgress, hintsComponent);

        expect(openSpy).toHaveBeenCalled();
    });

    it('reverseCheatStatus should reverse should set it to false if it was true', () => {
        service.cheatStatus = true;
        service.cheatStatusString = 'activé';

        service.reverseCheatStatus();

        expect(service.cheatStatus).toBeFalsy();
        expect(service.cheatStatusString).toEqual('désactivé');
    });

    it('reverseCheatStatus should reverse should set it to true if it was false', () => {
        service.cheatStatus = false;
        service.cheatStatusString = 'désactivé';

        service.reverseCheatStatus();

        expect(service.cheatStatus).toBeTruthy();
        expect(service.cheatStatusString).toEqual('activé');
    });

    it('deactivateCheatStatus should change cheatStatus and cheatStatusString', () => {
        service.cheatStatus = true;
        service.cheatStatusString = 'activé';
        service.deactivateCheatStatus();
        expect(service.cheatStatus).toBeFalsy();
        expect(service.cheatStatusString).toEqual('désactivé');
    });
    it('timeGameOnSubscription should update gameInProgress on subscription', async () => {
        const game: any = {
            gameDifferences: [],
            gameModified: '',
            gameOriginal: '',
            gameInformation: null,
        };
        spyOn(drawService, 'drawImgUrl').and.returnValue(Promise.resolve([]));

        const result = await service.timeGameOnSubscription(game, gameInProgress);

        expect(result.timeGameDifferences).toEqual([game.gameDifferences]);
        expect(result.timeGameModified).toEqual([game.gameModified]);
        expect(result.timeGameOriginal).toEqual([game.gameOriginal]);
        expect(result.timeGameInfo).toEqual([game.gameInformation]);
        expect(result.leftImagePixels).toEqual([]);
        expect(result.rightImagePixels).toEqual([]);
        expect(result.differences).toEqual(game.gameDifferences);
        expect(result.gameCard).toEqual(game.gameInformation);
    });

    it('timeGameSettingOnSubscription should update gameInProgress properties and start timer', () => {
        const data: TimeGameSetting = {
            startTime: 10,
            bonusTime: 5,
            penaltyTime: 3,
        };

        const timeGameSocketService = TestBed.inject(TimeGameSocketService);
        spyOn(timeGameSocketService, 'startTimer');

        const updatedGameInProgress = service.timeGameSettingOnSubscription(data, gameInProgress);

        expect(updatedGameInProgress.startTime).toBe(10);
        expect(updatedGameInProgress.bonusTime).toBe(5);
        expect(updatedGameInProgress.penaltyTime).toBe(3);
        expect(timeGameSocketService.startTimer).toHaveBeenCalledWith('room', 10);
    });

    it('normalGameSetup should call server', (done) => {
        spyOn(service.comService, 'imageGet').and.returnValue(
            of({ leftData: 'leftTest', rightData: 'rightTest', timeGameSetting: { startTime: 0, penaltyTime: 0, bonusTime: 0 } }),
        );
        spyOn(service.comService, 'getAllDifferences').and.returnValue(of([[{ row: 1, col: 2 }]]));
        service.initialLeftPixels = [];
        service.initialRightPixels = [];

        const drawServiceSpy = spyOn(service.draw, 'drawImgUrl').and.returnValue(Promise.resolve([[[1]]]));
        service.normalGameSetup(1, gameInProgress);
        setTimeout(() => {
            expect(drawServiceSpy).toHaveBeenCalled();
            expect(service.initialLeftPixels).toEqual([[[1]]]);
            expect(service.initialRightPixels).toEqual([[[1]]]);
            expect(service.tempRightImagePixels).toEqual([[[1]]]);
            done();
        }, 0);
    });

    it('timeGameSetup should call timeGameSocketService.getGame when the player is a creator', () => {
        spyOn(service.interpretRouteService, 'getPlayerType').and.returnValue('creator');
        const getGameSpy = spyOn(service.timeGameSocketService, 'getGame').and.stub();

        service.timeGameSetup(gameInProgress);

        expect(getGameSpy).toHaveBeenCalledWith(gameInProgress.roomName);
    });

    it('timeGameSetup should not call timeGameSocketService.getGame when the player is not a creator', () => {
        spyOn(service.interpretRouteService, 'getPlayerType').and.returnValue('opponent');
        const getGameSpy = spyOn(service.timeGameSocketService, 'getGame').and.stub();

        service.timeGameSetup(gameInProgress);

        expect(getGameSpy).not.toHaveBeenCalled();
    });

    it('drawInitialImages should draw intial images to context', () => {
        const drawPixelsSpy = spyOn(service.draw, 'drawPixels').and.stub();
        service.initialLeftPixels = [[[1]]];
        service.initialRightPixels = [[[1]]];
        service.tempRightImagePixels = [];

        service.drawInitialImages(gameInProgress);

        expect(drawPixelsSpy).toHaveBeenCalledTimes(2);
        expect(gameInProgress.leftImagePixels).toEqual([[[1]]]);
        expect(gameInProgress.rightImagePixels).toEqual([[[1]]]);
        expect(service.tempRightImagePixels).toEqual([[[1]]]);
    });

    it('startReplay should start timer and video replay and join chat room', () => {
        spyOn(chatService, 'joinRoom').and.stub();
        spyOn(service.timerService, 'onGetTimer').and.stub();
        spyOn(service.videoReplayService, 'onGetTimer').and.stub();
        const drawInitialImagesSpy = spyOn(service, 'drawInitialImages').and.returnValue(gameInProgress);
        const emitCorrectSpeedSpy = spyOn(service, 'emitCorrectSpeed').and.stub();

        const result = service.startReplay('replayRoom', gameInProgress, 1);

        expect(chatService.joinRoom).toHaveBeenCalledWith('replayRoom');
        expect(result.roomName).toBe('replayRoom');
        expect(result).toEqual(gameInProgress);
        expect(drawInitialImagesSpy).toHaveBeenCalledWith(gameInProgress);
        expect(emitCorrectSpeedSpy).toHaveBeenCalledWith(1, 'replayRoom');
    });

    it('emitCorrectSpeed should changePlaybackSpeed to 1 if speed is 1', () => {
        VideoReplayService.isPlayingReplay = true;
        const changePlaybackSpeedX1Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX1').and.stub();
        const changePlaybackSpeedX2Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX2').and.stub();
        const changePlaybackSpeedX4Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX4').and.stub();

        service.emitCorrectSpeed(1, 'room');
        expect(changePlaybackSpeedX1Spy).toHaveBeenCalledWith('room');
        expect(changePlaybackSpeedX2Spy).not.toHaveBeenCalled();
        expect(changePlaybackSpeedX4Spy).not.toHaveBeenCalled();
    });

    it('emitCorrectSpeed should changePlaybackSpeed to 2 if speed is 2', () => {
        VideoReplayService.isPlayingReplay = true;
        const changePlaybackSpeedX1Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX1').and.stub();
        const changePlaybackSpeedX2Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX2').and.stub();
        const changePlaybackSpeedX4Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX4').and.stub();

        service.emitCorrectSpeed(2, 'room');
        expect(changePlaybackSpeedX1Spy).not.toHaveBeenCalled();
        expect(changePlaybackSpeedX2Spy).toHaveBeenCalledWith('room');
        expect(changePlaybackSpeedX4Spy).not.toHaveBeenCalled();
    });

    it('emitCorrectSpeed should changePlaybackSpeed to 4 if speed is 4', () => {
        VideoReplayService.isPlayingReplay = true;
        const changePlaybackSpeedX1Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX1').and.stub();
        const changePlaybackSpeedX2Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX2').and.stub();
        const changePlaybackSpeedX4Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX4').and.stub();

        service.emitCorrectSpeed(4, 'room');
        expect(changePlaybackSpeedX1Spy).not.toHaveBeenCalled();
        expect(changePlaybackSpeedX2Spy).not.toHaveBeenCalled();
        expect(changePlaybackSpeedX4Spy).toHaveBeenCalledWith('room');
    });

    it('emitCorrectSpeed should not changePlaybackSpeed if speed is other than 1,2,4', () => {
        VideoReplayService.isPlayingReplay = true;
        const changePlaybackSpeedX1Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX1').and.stub();
        const changePlaybackSpeedX2Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX2').and.stub();
        const changePlaybackSpeedX4Spy = spyOn(service.videoReplayService, 'changePlaybackSpeedX4').and.stub();

        service.emitCorrectSpeed(6, 'room');
        expect(changePlaybackSpeedX1Spy).not.toHaveBeenCalled();
        expect(changePlaybackSpeedX2Spy).not.toHaveBeenCalled();
        expect(changePlaybackSpeedX4Spy).not.toHaveBeenCalled();
    });
});
