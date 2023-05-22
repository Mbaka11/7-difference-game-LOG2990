import { GameType } from './gametype';

export interface UpdatePodiumInformation {
    username: string;
    time: number;
    gameId: number;
    gameType: GameType;
    gameName: string;
}
