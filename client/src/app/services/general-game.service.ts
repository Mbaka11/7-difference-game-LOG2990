import { ElementRef, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GameType, NO_TIME } from '@app/common/constants';
import { GameInProgress } from '@app/common/game-interface';
import { GameConstantsComponent } from '@app/components/game-constants/game-constants.component';
import { Coords } from '@app/interfaces/attempt';
import { Vec2 } from '@app/interfaces/vec2';
import { AudioClickService } from '@app/services/audio-click.service';
import { TimerService } from '@app/services/timer.service';
import { VideoReplayService } from '@app/services/video-replay.service';
import { Coordinate } from '@common/coordinate';
import { ChatService } from './chat.service';
import { CommunicationService } from './communication.service';
import { DrawService } from './draw.service';
import { EndgameService } from './endgame.service';
import { InterpretRouteService } from './interpret-route.service';
import { MultiplayerService } from './multiplayer.service';
import { RectangleService } from './rectangle.service';
import { TimeGameSocketService } from './time-game-socket.service';

@Injectable({
    providedIn: 'root',
})
export class GeneralGameService {
    tempRightImagePixels: number[][][];
    initialLeftPixels: number[][][];
    initialRightPixels: number[][][];
    cheatStatus: boolean;
    cheatStatusString: string;
    differences: Coordinate[][];
    gameConstants: GameConstantsComponent;

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
    ) {}
    initializeGameInProgress(gameType: GameType, canvas1: ElementRef<HTMLCanvasElement>, canvas2: ElementRef<HTMLCanvasElement>): GameInProgress {
        return {
            username: this.interpretRouteService.getGameUsername(this.route),
            opponentUsername: this.interpretRouteService.getGameOpponentUsername(this.route),
            roomName: this.interpretRouteService.getRoomName(this.route),
            timeGameDifferences: [],
            timeGameInfo: [],
            timeGameModified: [],
            timeGameOriginal: [],
            gameType,
            leftCanvas: canvas1,
            rightCanvas: canvas2,
            numberOfPlayer: 0,
            leftImagePixels: [],
            rightImagePixels: [],
            differences: [],
            startTime: NO_TIME,
            penaltyTime: NO_TIME,
            bonusTime: NO_TIME,
            gameCard: { gameId: 0, gameName: '', gameDifficulty: '', numberOfDiff: 0 },
            differencesFound: [],
        };
    }

    isDifferentPixel(differences: Coordinate[][], row: number, col: number): { coords: Coordinate[]; index: number } {
        for (let i = 0; i < differences.length; i++) {
            for (const coord of differences[i]) {
                if (coord.row === row && coord.col === col) return { coords: differences[i], index: i };
            }
        }
        return { coords: [], index: 0 };
    }

    getMistake(differences: Coordinate[][], values: Coords) {
        const xCoord = values.xCoord as number;
        const yCoord = values.yCoord as number;
        const answer: { coords: Coordinate[]; index: number } = this.isDifferentPixel(differences, yCoord, xCoord);
        return answer;
    }

    leftAndRightPixelsAreDifferent(leftImagePixels: number[][][], rightImagePixels: number[][][], coords: Vec2): boolean {
        return (
            rightImagePixels[coords.y][coords.x][0] !== leftImagePixels[coords.y][coords.x][0] ||
            rightImagePixels[coords.y][coords.x][1] !== leftImagePixels[coords.y][coords.x][1] ||
            rightImagePixels[coords.y][coords.x][2] !== leftImagePixels[coords.y][coords.x][2]
        );
    }

    differenceRandomizer(gameInProgress: GameInProgress): number {
        let differenceNumberIsFound = false;
        let differenceNumber = 0;
        while (!differenceNumberIsFound) {
            differenceNumber = Math.floor(Math.random() * gameInProgress.differences.length);
            differenceNumberIsFound = this.checkValidDifferenceNumber(gameInProgress.differencesFound, differenceNumber);
        }
        return differenceNumber;
    }

    checkValidDifferenceNumber(differencesFound: number[], newDifference: number): boolean {
        return !differencesFound.includes(newDifference);
    }
}
