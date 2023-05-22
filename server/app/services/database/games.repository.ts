import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Game, GameHistoryInfo, GameHistoryInfoDocument, GamesDocument, PodiumDocument, PodiumInfo } from './schemas/games.schema';

@Injectable()
export class GamesRepository {
    constructor(
        @InjectModel(Game.name) private gameModel: Model<GamesDocument>,
        @InjectModel(PodiumInfo.name) private podiumModel: Model<PodiumDocument>,
        @InjectModel(GameHistoryInfo.name) private gameHistoryInfoModel: Model<GameHistoryInfoDocument>,
    ) {}

    async findOnePodium(podiumFilterQuery: FilterQuery<PodiumInfo>): Promise<PodiumInfo> {
        return this.podiumModel.findOne(podiumFilterQuery);
    }

    async findOne(gameFilterQuery: FilterQuery<Game>): Promise<Game> {
        return this.gameModel.findOne(gameFilterQuery);
    }

    async findPodium(): Promise<PodiumInfo[]> {
        return this.podiumModel.find({});
    }

    async find(): Promise<Game[]> {
        return this.gameModel.find({});
    }

    async findGameHistory(): Promise<GameHistoryInfo[]> {
        const gameHistories = await this.gameHistoryInfoModel.find({});
        return gameHistories;
    }

    async createPodium(podium: PodiumInfo): Promise<PodiumInfo> {
        const newPodium = new this.podiumModel(podium);
        await newPodium.save();
        return newPodium.toObject();
    }

    async create(game: Game): Promise<Game> {
        const newGame = new this.gameModel(game);
        await newGame.save();
        return newGame;
    }

    async createGameHistory(gameHistoryInfo: GameHistoryInfo): Promise<GameHistoryInfo> {
        const newGameHistory = new this.gameHistoryInfoModel(gameHistoryInfo);
        await newGameHistory.save();
        return newGameHistory.toObject();
    }

    async findOneAndUpdatePodium(podiumFilterQuery: FilterQuery<PodiumInfo>, podium: Partial<PodiumInfo>): Promise<PodiumInfo> {
        return this.podiumModel.findOneAndUpdate(podiumFilterQuery, podium);
    }

    async getAllIds(): Promise<string[]> {
        return this.podiumModel.distinct('gameId');
    }

    async findOneAndUpdate(gameFilterQuery: FilterQuery<Game>, game: Partial<Game>): Promise<Game> {
        return this.gameModel.findOneAndUpdate(gameFilterQuery, game);
    }

    async deletePodiumPerGameId(gameId: number): Promise<boolean> {
        const result = await this.podiumModel.deleteOne({ gameId });
        return result.deletedCount > 0;
    }

    async deleteGameById(gameId: number): Promise<boolean> {
        const result = await this.gameModel.deleteOne({ gameId });
        return result.deletedCount > 0;
    }

    async deleteAllPodiums(): Promise<void> {
        await this.podiumModel.deleteMany({});
    }

    async deleteAllGames(): Promise<void> {
        this.gameModel.deleteMany({});
    }

    async deleteAllHistory(): Promise<void> {
        await this.gameHistoryInfoModel.deleteMany({});
    }

    async getLength(): Promise<number> {
        return this.gameModel.countDocuments();
    }

    async findHighestGameId(): Promise<number> {
        const allIds = await this.getAllIds();
        if (allIds.length === 0) {
            return 0;
        }
        const highestId = allIds.reduce((maxId, currentId) => {
            return currentId > maxId ? currentId : maxId;
        });
        return parseInt(highestId, 10);
    }
}
