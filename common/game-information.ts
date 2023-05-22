export interface GameInformation {
    gameId: number;
    gameName: string;
    gameDifficulty: string;
    numberOfDiff: number;
}

export interface GameInfoHistory {
    duration: string;
    date: string;
    gameMode: string;
    players: string[];
    winner?: string;
    surrender?: string;
}
