import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
    FIRST_HINT_COUNT,
    FIRST_HINT_PIXEL_X,
    FIRST_HINT_PIXEL_Y,
    FLASH_INTERVAL_MS,
    GameType,
    MAX_FLASH_ITERATIONS,
    PLAYBACK_SPEED_X1,
    PLAYBACK_SPEED_X2,
    PLAYBACK_SPEED_X4,
    SECOND_HINT_COUNT,
    SECOND_HINT_PIXEL_X,
    SECOND_HINT_PIXEL_Y,
    THIRD_HINT_COUNT,
    TIME_MULTIPLIER,
} from '@app/common/constants';
import { GameInProgress, Points } from '@app/common/game-interface';
import { Game, TimeGameSetting } from '@app/common/time-game-interface';
import { GameConstantsComponent } from '@app/components/game-constants/game-constants.component';
import { HintsDisplayComponent } from '@app/components/hints-display/hints-display.component';
import { ThirdHintComponent } from '@app/components/third-hint/third-hint.component';
import { Coords } from '@app/interfaces/attempt';
import { Vec2 } from '@app/interfaces/vec2';
import { AudioClickService } from '@app/services/audio-click.service';
import { TimerService } from '@app/services/timer.service';
import { VideoReplayService } from '@app/services/video-replay.service';
import { Coordinate } from '@common/coordinate';
import { Subject } from 'rxjs';
import { ChatService } from './chat.service';
import { CommunicationService } from './communication.service';
import { DrawService } from './draw.service';
import { EndgameService } from './endgame.service';
import { GeneralGameService } from './general-game.service';
import { InterpretRouteService } from './interpret-route.service';
import { MultiplayerService } from './multiplayer.service';
import { RectangleService } from './rectangle.service';
import { TimeGameSocketService } from './time-game-socket.service';
@Injectable({
    providedIn: 'root',
})
export class GameService {
    tempRightImagePixels: number[][][];
    initialLeftPixels: number[][][];
    initialRightPixels: number[][][];
    cheatStatus: boolean;
    cheatStatusString: string;
    differences: Coordinate[][];
    gameConstants: GameConstantsComponent;
    dialogRef: MatDialogRef<ThirdHintComponent>;
    closedDialogSubject = new Subject<unknown>();

    constructor(
        public audio: AudioClickService,
        public draw: DrawService,
        public chatService: ChatService,
        public multiplayerService: MultiplayerService,
        public endgameService: EndgameService,
        public timeGameSocketService: TimeGameSocketService,
        public timerService: TimerService,
        public videoReplayService: VideoReplayService,
        public comService: CommunicationService,
        public interpretRouteService: InterpretRouteService,
        public dialog: MatDialog,
        public rectangleService: RectangleService,
        private route: ActivatedRoute,
        public generalGameService: GeneralGameService,
    ) {}

    flashDifference(ctx2: CanvasRenderingContext2D, rightImagePixels: number[][][]): void {
        this.draw.drawPixels(rightImagePixels, ctx2);
        setTimeout(() => {
            this.draw.drawPixels(this.tempRightImagePixels, ctx2);
        }, FLASH_INTERVAL_MS);
        setTimeout(() => {
            this.draw.drawPixels(rightImagePixels, ctx2);
        }, 2 * FLASH_INTERVAL_MS);
        setTimeout(() => {
            this.draw.drawPixels(this.tempRightImagePixels, ctx2);
        }, 3 * FLASH_INTERVAL_MS);
        setTimeout(() => {
            this.draw.drawPixels(rightImagePixels, ctx2);
            this.tempRightImagePixels = JSON.parse(JSON.stringify(rightImagePixels));
        }, MAX_FLASH_ITERATIONS * FLASH_INTERVAL_MS);
    }

    async correctClick(
        clickCoord: Vec2,
        gameInProgress: GameInProgress,
        points: Points,
    ): Promise<{ points: Points; gameInProgress: GameInProgress }> {
        this.audio.playRight();
        const body: Coords = { xCoord: clickCoord.x, yCoord: clickCoord.y };
        if (this.endgameService.isClassicGame(gameInProgress.gameType)) {
            const res: { points: Points; gameInProgress: GameInProgress } = this.correctClickClassic(
                this.generalGameService.getMistake(gameInProgress.differences, body),
                true,
                gameInProgress,
                points,
            );
            points = res.points;
            gameInProgress = res.gameInProgress;
        } else {
            points = await this.correctClickTime(this.generalGameService.getMistake(gameInProgress.differences, body), true, gameInProgress, points);
        }
        return { points, gameInProgress };
    }

    async correctClickOpponent(data: { coords: Coordinate[]; index: number }, gameInProgress: GameInProgress, points: Points): Promise<Points> {
        this.audio.playRight();
        if (this.endgameService.isClassicGame(gameInProgress.gameType)) {
            const res: { points: Points; gameInProgress: GameInProgress } = this.correctClickClassic(data, false, gameInProgress, points);
            points = res.points;
            gameInProgress = res.gameInProgress;
        } else {
            points = await this.correctClickTime(data, false, gameInProgress, points);
        }
        return points;
    }

    correctClickClassic(
        data: { coords: Coordinate[]; index: number },
        isCurrentPlayer: boolean,
        gameInProgress: GameInProgress,
        points: Points,
    ): { points: Points; gameInProgress: GameInProgress } {
        if (isCurrentPlayer) {
            if (!VideoReplayService.isPlayingReplay)
                this.chatService.foundDifferenceAction(gameInProgress.gameType, gameInProgress.username, gameInProgress.roomName);
            this.multiplayerService.sendRemoveData(gameInProgress.roomName, data.coords);
            points.numberOfDifferences++;
        } else {
            points.numberOfDifferencesAdversary++;
        }
        gameInProgress.differencesFound.push(data.index);
        const ctx2 = gameInProgress.rightCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.removeDifferenceFromRightPixels(data.coords, gameInProgress.rightImagePixels, gameInProgress.leftImagePixels);
        this.flashDifference(ctx2, gameInProgress.rightImagePixels);
        if (points.numberOfDifferences === this.maxDifferencesToFind(gameInProgress.numberOfPlayer, gameInProgress.gameCard.numberOfDiff)) {
            this.multiplayerService.sendVictoryDeclaration(gameInProgress.roomName);
            this.endgameService.endGame(gameInProgress);
        } else if (
            VideoReplayService.isPlayingReplay &&
            points.numberOfDifferencesAdversary === this.maxDifferencesToFind(gameInProgress.numberOfPlayer, gameInProgress.gameCard.numberOfDiff)
        ) {
            this.endgameService.openLoseAndReplayMessage(gameInProgress.opponentUsername);
        }
        return { points, gameInProgress };
    }

    async correctClickTime(
        data: { coords: Coordinate[]; index: number },
        isCurrentPlayer: boolean,
        gameInProgress: GameInProgress,
        points: Points,
    ): Promise<Points> {
        if (isCurrentPlayer) {
            this.chatService.foundDifferenceAction(gameInProgress.gameType, gameInProgress.username, gameInProgress.roomName);
            this.multiplayerService.sendRemoveData(gameInProgress.roomName, data.coords);
        }
        points.numberOfDifferences++;
        if (points.numberOfDifferences === gameInProgress.timeGameOriginal.length) {
            this.endgameService.endGame(gameInProgress);
        } else {
            gameInProgress.leftImagePixels = await this.draw.drawImgUrl(
                gameInProgress.leftCanvas,
                `data:image/bmp;base64,${gameInProgress.timeGameOriginal[points.numberOfDifferences]}`,
            );
            gameInProgress.rightImagePixels = await this.draw.drawImgUrl(
                gameInProgress.rightCanvas,
                `data:image/bmp;base64,${gameInProgress.timeGameModified[points.numberOfDifferences]}`,
            );
            gameInProgress.differences = gameInProgress.timeGameDifferences[points.numberOfDifferences];
            gameInProgress.gameCard = gameInProgress.timeGameInfo[points.numberOfDifferences];
        }
        this.timeGameSocketService.incrementTimer(gameInProgress.roomName, gameInProgress.bonusTime * TIME_MULTIPLIER);
        return points;
    }

    removeDifferenceFromRightPixels(coordsToRemove: Coordinate[], rightImagePixels: number[][][], leftImagePixels: number[][][]) {
        for (const coord of coordsToRemove) {
            const row = coord.row;
            const col = coord.col;
            rightImagePixels[row][col][0] = leftImagePixels[row][col][0];
            rightImagePixels[row][col][1] = leftImagePixels[row][col][1];
            rightImagePixels[row][col][2] = leftImagePixels[row][col][2];
            rightImagePixels[row][col][3] = leftImagePixels[row][col][3];
        }
        return rightImagePixels;
    }

    errorClick(event: Event, gameInProgress: GameInProgress, clickCoord: Vec2) {
        this.audio.playWrong();
        if (!VideoReplayService.isPlayingReplay)
            this.chatService.errorAction(gameInProgress.gameType, gameInProgress.username, gameInProgress.roomName);
        if (!this.endgameService.isClassicGame(gameInProgress.gameType))
            this.timeGameSocketService.decrementTimer(gameInProgress.roomName, gameInProgress.penaltyTime * TIME_MULTIPLIER);
        const canvas: HTMLCanvasElement = event.target as HTMLCanvasElement;
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (context) {
            this.draw.drawWord(context, 'ERREUR', clickCoord);
        }
    }

    openThirdHint(difference: Coordinate[], hintsComponent: HintsDisplayComponent) {
        hintsComponent.hintNumber--;
        this.dialogRef = this.dialog.open(ThirdHintComponent, {
            data: { difference },
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.closedDialogSubject.next({});
        });
    }

    drawHint(difference: Coordinate[], gameInProgress: GameInProgress, hintsComponent: HintsDisplayComponent) {
        const ctx2 = gameInProgress.rightCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const pos = Math.round(difference.length / 2);
        const middle = difference[pos];
        const y = middle.row;
        const x = middle.col;
        let intervalX = 0;
        let intervalY = 0;
        switch (hintsComponent.hintNumber) {
            case FIRST_HINT_COUNT:
                intervalX = FIRST_HINT_PIXEL_X;
                intervalY = FIRST_HINT_PIXEL_Y;
                break;
            case SECOND_HINT_COUNT:
                intervalY = SECOND_HINT_PIXEL_Y;
                intervalX = SECOND_HINT_PIXEL_X;
                break;
            case THIRD_HINT_COUNT:
                this.openThirdHint(difference, hintsComponent);
                break;
        }
        const vec1: Vec2 = { x: x - intervalX, y: y - intervalY };
        const vec2: Vec2 = { x: x + intervalX, y: y + intervalY };
        this.rectangleService.drawRectangle(ctx2, vec1, vec2);
        this.hintPenalty(gameInProgress);
    }

    deactivateCheatStatus() {
        this.cheatStatus = false;
        this.cheatStatusString = 'désactivé';
    }

    reverseCheatStatus() {
        this.cheatStatus = !this.cheatStatus;
        this.cheatStatusString = this.cheatStatus ? 'activé' : 'désactivé';
    }

    // hintManagement(hintsComponent: HintsDisplayComponent, gameInProgress: GameInProgress) {
    //     hintsComponent.removeHint();
    //     const diffNumber = this.generalGameService.differenceRandomizer(gameInProgress);
    //     console.log('diffNumber: ', diffNumber);
    //     this.drawHint(gameInProgress.differences[diffNumber], gameInProgress, hintsComponent);
    // }

    hintPenalty(gameInProgress: GameInProgress) {
        this.timerService.decrementTimer(gameInProgress.roomName, gameInProgress.penaltyTime);
    }

    async timeGameOnSubscription(data: Game, gameInProgress: GameInProgress): Promise<GameInProgress> {
        gameInProgress.timeGameDifferences.push(data.gameDifferences);
        gameInProgress.timeGameModified.push(data.gameModified);
        gameInProgress.timeGameOriginal.push(data.gameOriginal);
        gameInProgress.timeGameInfo.push(data.gameInformation);
        if (gameInProgress.timeGameOriginal.length === 1) {
            gameInProgress.leftImagePixels = await this.draw.drawImgUrl(gameInProgress.leftCanvas, `data:image/bmp;base64,${data.gameOriginal}`);
            gameInProgress.rightImagePixels = await this.draw.drawImgUrl(gameInProgress.rightCanvas, `data:image/bmp;base64,${data.gameModified}`);
            this.tempRightImagePixels = JSON.parse(JSON.stringify(gameInProgress.rightImagePixels));
            gameInProgress.differences = data.gameDifferences;
            gameInProgress.gameCard = data.gameInformation;
        }
        return gameInProgress;
    }

    timeGameSettingOnSubscription(data: TimeGameSetting, gameInProgress: GameInProgress): GameInProgress {
        gameInProgress.startTime = data.startTime;
        this.timeGameSocketService.startTimer(gameInProgress.roomName, gameInProgress.startTime);
        gameInProgress.bonusTime = data.bonusTime;
        gameInProgress.penaltyTime = data.penaltyTime;
        return gameInProgress;
    }

    normalGameSetup(gameId: number, gameInProgress: GameInProgress) {
        this.comService.imageGet(gameId.toString()).subscribe(async (data) => {
            gameInProgress.leftImagePixels = await this.draw.drawImgUrl(gameInProgress.leftCanvas, `data:image/bmp;base64,${data.leftData}`);
            gameInProgress.rightImagePixels = await this.draw.drawImgUrl(gameInProgress.rightCanvas, `data:image/bmp;base64,${data.rightData}`);
            this.initialLeftPixels = JSON.parse(JSON.stringify(gameInProgress.leftImagePixels));
            this.initialRightPixels = JSON.parse(JSON.stringify(gameInProgress.rightImagePixels));
            this.tempRightImagePixels = JSON.parse(JSON.stringify(gameInProgress.rightImagePixels));
            if (gameInProgress.gameType === GameType.SoloClassic) gameInProgress.penaltyTime = data.timeGameSetting.penaltyTime;
        });

        this.comService.getAllDifferences(gameId.toString()).subscribe((data) => {
            gameInProgress.differences = data;
        });
    }

    timeGameSetup(gameInProgress: GameInProgress) {
        if (this.interpretRouteService.getPlayerType(this.route) === 'creator') this.timeGameSocketService.getGame(gameInProgress.roomName);
    }

    drawInitialImages(gameInProgress: GameInProgress): GameInProgress {
        const leftCtx: CanvasRenderingContext2D = gameInProgress.leftCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const rightCtx: CanvasRenderingContext2D = gameInProgress.rightCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.draw.drawPixels(this.initialLeftPixels, leftCtx);
        this.draw.drawPixels(this.initialRightPixels, rightCtx);
        gameInProgress.leftImagePixels = JSON.parse(JSON.stringify(this.initialLeftPixels));
        gameInProgress.rightImagePixels = JSON.parse(JSON.stringify(this.initialRightPixels));
        this.tempRightImagePixels = JSON.parse(JSON.stringify(this.initialRightPixels));
        return gameInProgress;
    }

    startReplay(roomName: string, gameInProgress: GameInProgress, speed: number): GameInProgress {
        gameInProgress = this.drawInitialImages(gameInProgress);
        this.timerService.onGetTimer();
        this.videoReplayService.onGetTimer();
        gameInProgress.roomName = roomName;
        this.chatService.joinRoom(roomName);
        this.emitCorrectSpeed(speed, roomName);
        return gameInProgress;
    }

    emitCorrectSpeed(speed: number, roomName: string) {
        if (VideoReplayService.isPlayingReplay) {
            switch (speed) {
                case PLAYBACK_SPEED_X1:
                    this.videoReplayService.changePlaybackSpeedX1(roomName);
                    break;
                case PLAYBACK_SPEED_X2:
                    this.videoReplayService.changePlaybackSpeedX2(roomName);
                    break;
                case PLAYBACK_SPEED_X4:
                    this.videoReplayService.changePlaybackSpeedX4(roomName);
                    break;
                default:
                    break;
            }
        }
    }

    maxDifferencesToFind(numberOfPlayers: number, numberOfDiff: number): number {
        return (numberOfDiff % numberOfPlayers) + Math.floor(numberOfDiff / numberOfPlayers);
    }
}
