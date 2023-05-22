import { Coordinate } from '@common/coordinate';

export interface GameEvent {
    event: Event | undefined;
    timestamp: number;
    eventType: EventType;
    data: Coordinate[] | undefined;
    differenceNumber: number | undefined;
}

export enum EventType {
    UserClick,
    OpponentClick,
    Cheat,
    Hint,
    CloseThirdHint,
    GameFinished,
}
