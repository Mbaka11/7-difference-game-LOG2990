/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, GameType, NO_TIME } from '@app/common/constants';
import { GameInProgress } from '@app/common/game-interface';
import { HintsDisplayComponent } from '@app/components/hints-display/hints-display.component';
import { AudioClickService } from '@app/services/audio-click.service';
import { Coordinate } from '@common/coordinate';
import { EndgameService } from './endgame.service';
import { GeneralGameService } from './general-game.service';
import { MultiplayerService } from './multiplayer.service';
import { TimeGameSocketService } from './time-game-socket.service';

const canvasStub1: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub1.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const canvasStub2: ElementRef<HTMLCanvasElement> = jasmine.createSpyObj('ElementRef', ['nativeElement']);
canvasStub2.nativeElement = jasmine.createSpyObj('HTMLCanvasElement', ['getContext']);

const differences: Coordinate[][] = [
    [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
    ],
    [{ row: 2, col: 1 }],
];

describe('GameSetupService', () => {
    let service: GeneralGameService;
    let gameInProgress: GameInProgress;
    let ctxStub: CanvasRenderingContext2D;
    let fixture: ComponentFixture<HintsDisplayComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HintsDisplayComponent],
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            providers: [EndgameService, MultiplayerService, TimeGameSocketService, AudioClickService, MatDialog],
        }).compileComponents();
        service = TestBed.inject(GeneralGameService);
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        fixture = TestBed.createComponent(HintsDisplayComponent);
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

    it('should return a new GameInProgress object with the correct properties', () => {
        const gameType = GameType.SoloClassic;
        const canvas1 = new ElementRef(document.createElement('canvas'));
        const canvas2 = new ElementRef(document.createElement('canvas'));

        spyOn(service.interpretRouteService, 'getGameUsername').and.returnValue('testuser1');
        spyOn(service.interpretRouteService, 'getGameOpponentUsername').and.returnValue('testuser2');
        spyOn(service.interpretRouteService, 'getRoomName').and.returnValue('testroom');

        const result = service.initializeGameInProgress(gameType, canvas1, canvas2);

        expect(result.username).toBe('testuser1');
        expect(result.opponentUsername).toBe('testuser2');
        expect(result.roomName).toBe('testroom');
        expect(result.timeGameDifferences).toEqual([]);
        expect(result.timeGameInfo).toEqual([]);
        expect(result.timeGameModified).toEqual([]);
        expect(result.timeGameOriginal).toEqual([]);
        expect(result.gameType).toBe(GameType.SoloClassic);
        expect(result.leftCanvas).toBe(canvas1);
        expect(result.rightCanvas).toBe(canvas2);
        expect(result.numberOfPlayer).toBe(0);
        expect(result.leftImagePixels).toEqual([]);
        expect(result.rightImagePixels).toEqual([]);
        expect(result.differences).toEqual([]);
        expect(result.startTime).toBe(NO_TIME);
        expect(result.penaltyTime).toBe(NO_TIME);
        expect(result.bonusTime).toBe(NO_TIME);
        expect(result.gameCard).toEqual({ gameId: 0, gameName: '', gameDifficulty: '', numberOfDiff: 0 });
    });

    it('should return the correct coordinate array if the given row and column is in one of the differences', () => {
        const result = service.isDifferentPixel(differences, 1, 1);
        expect(result).toEqual({ coords: differences[0], index: 0 });
    });

    it('should return an empty array if the given row and column is not in any of the differences', () => {
        const result = service.isDifferentPixel(differences, 2, 2);
        expect(result).toEqual({ coords: [], index: 0 });
    });

    it('leftAndRightPixelsAreDifferent should return true if pixels are different', () => {
        const leftImagePixels = [[[0, 0, 0, 255]]];
        const rightImagePixels = [[[0, 1, 1, 255]]];
        expect(service.leftAndRightPixelsAreDifferent(leftImagePixels, rightImagePixels, { x: 0, y: 0 })).toBeTruthy();
    });

    it('leftAndRightPixelsAreDifferent should return false if pixels are the same', () => {
        const leftImagePixels = [[[0, 0, 0, 255]]];
        const rightImagePixels = [[[0, 0, 0, 255]]];
        expect(service.leftAndRightPixelsAreDifferent(leftImagePixels, rightImagePixels, { x: 0, y: 0 })).toBeFalsy();
    });

    describe('getMistake', () => {
        const differences: Coordinate[][] = [
            [
                { row: 1, col: 1 },
                { row: 1, col: 2 },
            ],
            [{ row: 2, col: 1 }],
        ];
        const values = { xCoord: 2, yCoord: 1, gameName: 'game' };

        it('should return the correct coordinate array', () => {
            const result = service.getMistake(differences, values);
            expect(result).toEqual({ coords: differences[0], index: 0 });
        });
    });

    it('differenceRandomizer should return a valid number', () => {
        gameInProgress.differences = [[{ row: 1, col: 1 }], [{ row: 2, col: 2 }], [{ row: 3, col: 3 }]];
        const result = service.differenceRandomizer(gameInProgress);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(gameInProgress.differences.length);
    });
});
