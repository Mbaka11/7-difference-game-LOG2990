import { PodiumGateway } from '@app/gateways/podium/podium.gateway';
import { GameInformation } from '@common/game-information';
import { Podium } from '@common/podium';
import { Injectable } from '@nestjs/common';
import { FakeInformation } from './fake-info.service';
import { GamesRepository } from './games.repository';
import { Game, PodiumInfo } from './schemas/games.schema';

@Injectable()
export class GamesService {
    fake = new FakeInformation();
    constructor(private readonly gamesRepository: GamesRepository, private podiumGateway: PodiumGateway) {}
    transformGameType(game: Game): GameInformation {
        const transformedGame: GameInformation = {
            gameId: game.gameId,
            gameName: game.gameName,
            gameDifficulty: game.gameDifficulty,
            numberOfDiff: game.numberOfDiff,
        };
        return transformedGame;
    }

    transformPodiumType(podium: PodiumInfo): Podium {
        const transformedPodium: Podium = {
            gameId: podium.gameId,
            solo: {
                first: { time: podium.soloFirstTime, name: podium.soloFirstName },
                second: { time: podium.soloSecondTime, name: podium.soloSecondName },
                third: { time: podium.soloThirdTime, name: podium.soloThirdName },
            },
            multiplayer: {
                first: { time: podium.multFirstTime, name: podium.multFirstName },
                second: { time: podium.multSecondTime, name: podium.multSecondName },
                third: { time: podium.multThirdTime, name: podium.multThirdName },
            },
        };
        return transformedPodium;
    }

    transformPodiumInfo(podium: Podium): PodiumInfo {
        const transformedPodium: PodiumInfo = {
            gameId: podium.gameId,
            soloFirstTime: podium.solo.first.time,
            soloSecondTime: podium.solo.second.time,
            soloThirdTime: podium.solo.third.time,
            soloFirstName: podium.solo.first.name,
            soloSecondName: podium.solo.second.name,
            soloThirdName: podium.solo.third.name,
            multFirstTime: podium.multiplayer.first.time,
            multSecondTime: podium.multiplayer.second.time,
            multThirdTime: podium.multiplayer.third.time,
            multFirstName: podium.multiplayer.first.name,
            multSecondName: podium.multiplayer.second.name,
            multThirdName: podium.multiplayer.third.name,
        };

        return transformedPodium;
    }

    async getGameByID(gameId: number): Promise<GameInformation> {
        const game = await this.gamesRepository.findOne({ gameId });
        return this.transformGameType(game);
    }

    async getPodiumByGameId(gameId: number): Promise<Podium> {
        const podium = await this.gamesRepository.findOnePodium({ gameId });
        return this.transformPodiumType(podium);
    }

    async getGames(): Promise<GameInformation[]> {
        const games = await this.gamesRepository.find();
        return games.map(this.transformGameType);
    }

    async getPodiums(): Promise<Podium[]> {
        const podiums = await this.gamesRepository.findPodium();
        return podiums.map(this.transformPodiumType);
    }

    async createGame(newGame: GameInformation): Promise<Game> {
        return await this.gamesRepository.create(this.transformGameType(newGame));
    }

    async createPodium(newPodium: Podium): Promise<PodiumInfo> {
        return await this.gamesRepository.createPodium(this.transformPodiumInfo(newPodium));
    }

    async updateGame(gameId: number, newInfo: GameInformation): Promise<GameInformation> {
        const updatedGame = await this.gamesRepository.findOneAndUpdate({ gameId }, newInfo);
        return this.transformGameType(updatedGame);
    }

    async resetPodiumById(podiumId: number): Promise<void> {
        const newPodium = await this.createFakePodium(podiumId);
        this.updatePodium(newPodium);
    }
    async updatePodium(podium: Podium): Promise<void> {
        const podiumInfo = this.transformPodiumInfo(podium);
        await this.gamesRepository.findOneAndUpdatePodium({ gameId: podium.gameId }, podiumInfo);
        this.podiumGateway.broadcastPodium(await this.getPodiumByGameId(podium.gameId));
    }

    async updateAllPodiums(): Promise<void> {
        const allIds: string[] = await this.gamesRepository.getAllIds();
        for (const podiumId of allIds) {
            const newPodium: PodiumInfo = this.transformPodiumInfo(await this.createFakePodium(parseInt(podiumId, 10)));
            await this.gamesRepository.findOneAndUpdatePodium({ gameId: parseInt(podiumId, 10) }, newPodium);
            this.podiumGateway.broadcastPodium(await this.getPodiumByGameId(parseInt(podiumId, 10)));
        }
    }

    async deleteGame(gameId: number): Promise<void> {
        await this.gamesRepository.deleteGameById(gameId);
    }

    async deleteAllGames(): Promise<void> {
        await this.gamesRepository.deleteAllGames();
    }

    async deletePodiumByGameId(gameId: number): Promise<void> {
        await this.gamesRepository.deletePodiumPerGameId(gameId);
    }

    async deleteAllPodiums(): Promise<void> {
        await this.gamesRepository.deleteAllPodiums();
    }

    async getLength(): Promise<number> {
        return await this.gamesRepository.getLength();
    }

    async getHighestId(): Promise<number> {
        return await this.gamesRepository.findHighestGameId();
    }

    async createFakePodium(thisGameId: number): Promise<Podium> {
        return this.fake.createFakePodium(thisGameId);
    }

    async getAllIds(): Promise<string[]> {
        return await this.gamesRepository.getAllIds();
    }
}
