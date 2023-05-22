import { ElementRef } from '@angular/core';
import { Coordinate } from '@common/coordinate';
import { GameInformation } from '@common/game-information';
import { GameType } from './constants';

export interface GameInProgress {
    gameType: GameType;
    username: string;
    opponentUsername: string;
    roomName: string;
    numberOfPlayer: number;
    gameCard: GameInformation;
    leftImagePixels: number[][][];
    rightImagePixels: number[][][];
    timeGameDifferences: Coordinate[][][];
    timeGameOriginal: string[];
    timeGameModified: string[];
    timeGameInfo: GameInformation[];
    leftCanvas: ElementRef<HTMLCanvasElement>;
    rightCanvas: ElementRef<HTMLCanvasElement>;
    differences: Coordinate[][];
    startTime: number;
    penaltyTime: number;
    bonusTime: number;
    differencesFound: number[];
}

export interface Points {
    numberOfDifferences: number;
    numberOfDifferencesAdversary: number;
}
