export interface Podium {
    gameId: number;
    solo: {
        first: { time: number; name: string };
        second: { time: number; name: string };
        third: { time: number; name: string };
    };
    multiplayer: {
        first: { time: number; name: string };
        second: { time: number; name: string };
        third: { time: number; name: string };
    };
}
