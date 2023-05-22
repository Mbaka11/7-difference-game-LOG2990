// eslint-disable-next-line max-classes-per-file
/* eslint-disable max-classes-per-file */
import { GameInfoHistory, GameInformation } from '@common/game-information';
import { Podium } from '@common/podium';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GamesDocument = HydratedDocument<GameInformation>;

@Schema()
export class Game {
    @Prop({ required: true })
    gameId: number;

    @Prop({ required: true })
    gameName: string;

    @Prop({ required: true })
    gameDifficulty: string;

    @Prop({ required: true })
    numberOfDiff: number;
}

export const GAME_MODEL = SchemaFactory.createForClass(Game);

//
export type GameHistoryInfoDocument = HydratedDocument<GameInfoHistory>;

@Schema()
export class GameHistoryInfo {
    @Prop({ required: true })
    duration: string;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    gameMode: string;

    @Prop({ required: true })
    players: string[];

    @Prop({ required: false })
    winner?: string;

    @Prop({ required: false })
    surrender?: string;
}

export const GAME_HISTORY_INFO_MODEL = SchemaFactory.createForClass(GameHistoryInfo);

// Podium schema
export type PodiumDocument = HydratedDocument<Podium>;

@Schema()
export class PodiumInfo {
    @Prop({ required: true })
    gameId: number;

    @Prop({ required: true })
    soloFirstTime: number;
    @Prop({ required: true })
    soloFirstName: string;

    @Prop({ required: true })
    soloSecondTime: number;
    @Prop({ required: true })
    soloSecondName: string;

    @Prop({ required: true })
    soloThirdTime: number;
    @Prop({ required: true })
    soloThirdName: string;

    @Prop({ required: true })
    multFirstTime: number;
    @Prop({ required: true })
    multFirstName: string;

    @Prop({ required: true })
    multSecondTime: number;
    @Prop({ required: true })
    multSecondName: string;

    @Prop({ required: true })
    multThirdTime: number;
    @Prop({ required: true })
    multThirdName: string;
}

export const PODIUM_MODEL = SchemaFactory.createForClass(PodiumInfo);
