import { Coordinate } from '@common/coordinate';
import { GameInformation } from '@common/game-information';

export interface TimeGameSetting {
    startTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface Game {
    gameDifferences: Coordinate[][];
    gameOriginal: string;
    gameModified: string;
    gameInformation: GameInformation;
}
