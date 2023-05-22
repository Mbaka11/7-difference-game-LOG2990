import { GameInformation } from '@common/game-information';
import { Coordinate } from './coordinate';

export interface TimeGameSetting {
    startTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface TimeGame {
    settings: TimeGameSetting;
    timeGames: Game[];
}

export interface Game {
    gameDifferences: Coordinate[][];
    gameOriginal: string;
    gameModified: string;
    gameInformation: GameInformation;
}
