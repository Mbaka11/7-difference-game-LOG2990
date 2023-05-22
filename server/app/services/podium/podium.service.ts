import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GamesService } from '@app/services/database/games.service';
import { GameType } from '@common/gametype';
import { Podium } from '@common/podium';
import { UpdatePodiumInformation } from '@common/update-podium-information';
import { Injectable } from '@nestjs/common';

const INVALID_PODIUM_PLACE = -1;

@Injectable()
export class PodiumService {
    constructor(private gamesService: GamesService, private chatGateway: ChatGateway) {}

    async updatePodium(updatePodiumInformation: UpdatePodiumInformation): Promise<number> {
        let podiumPlace: number = INVALID_PODIUM_PLACE;
        if (updatePodiumInformation.gameType === GameType.SoloClassic) podiumPlace = await this.updateSoloPodium(updatePodiumInformation);
        else if (updatePodiumInformation.gameType === GameType.MultiplayerClassic)
            podiumPlace = await this.updateMultiplayerPodium(updatePodiumInformation);
        return podiumPlace;
    }

    async updateSoloPodium(updatePodiumInformation: UpdatePodiumInformation): Promise<number> {
        const podium = await this.gamesService.getPodiumByGameId(updatePodiumInformation.gameId);
        const podiumToSort = this.getSoloPodiumToSort(podium);
        const podiumPlace = this.getPodiumPlace(podiumToSort, updatePodiumInformation.time);
        if (podiumPlace !== INVALID_PODIUM_PLACE) {
            const newPodium = this.getSoloPodiumUpdated(podium, updatePodiumInformation, podiumPlace);
            this.gamesService.updatePodium(newPodium);
            this.chatGateway.broadcastAllNewPodiumPlayer(updatePodiumInformation.username, updatePodiumInformation.gameName, podiumPlace);
        }
        return podiumPlace;
    }

    async updateMultiplayerPodium(updatePodiumInformation): Promise<number> {
        const podium = await this.gamesService.getPodiumByGameId(updatePodiumInformation.gameId);
        const podiumToSort = this.getMultiplayerPodiumToSort(podium);
        const podiumPlace = this.getPodiumPlace(podiumToSort, updatePodiumInformation.time);
        if (podiumPlace !== INVALID_PODIUM_PLACE) {
            const newPodium = this.getMultiplayerPodiumUpdated(podium, updatePodiumInformation, podiumPlace);
            this.gamesService.updatePodium(newPodium);
            this.chatGateway.broadcastAllNewPodiumPlayer(updatePodiumInformation.username, updatePodiumInformation.gameName, podiumPlace);
        }
        return podiumPlace;
    }

    getPodiumPlace(podium: number[], time: number): number {
        podium.push(time);
        podium.sort((a, b) => a - b);

        const index = podium.findIndex((timeFiltered) => timeFiltered === time);

        switch (index) {
            case 0: {
                return 1;
            }
            case 1: {
                return 2;
            }
            case 2: {
                return 3;
            }
            default: {
                return INVALID_PODIUM_PLACE;
            }
        }
    }

    getSoloPodiumToSort(podium: Podium): number[] {
        return [podium.solo.first.time, podium.solo.second.time, podium.solo.third.time];
    }

    getMultiplayerPodiumToSort(podium: Podium): number[] {
        return [podium.multiplayer.first.time, podium.multiplayer.second.time, podium.multiplayer.third.time];
    }

    getSoloPodiumUpdated(podium: Podium, updatePodiumInformation: UpdatePodiumInformation, podiumPlace: number): Podium {
        const updatedSolo = podium.solo;
        const updatedRank = { time: updatePodiumInformation.time, name: updatePodiumInformation.username };
        const tempSecondRank = podium.solo.first;
        const tempThirdRank = podium.solo.second;

        switch (podiumPlace) {
            case 1:
                updatedSolo.first = updatedRank;
                updatedSolo.second = tempSecondRank;
                updatedSolo.third = tempThirdRank;
                break;
            case 2:
                updatedSolo.second = updatedRank;
                updatedSolo.third = tempThirdRank;
                break;
            case 3:
                updatedSolo.third = updatedRank;
                break;
        }

        podium.solo = updatedSolo;
        return podium;
    }

    getMultiplayerPodiumUpdated(podium: Podium, updatePodiumInformation: UpdatePodiumInformation, podiumPlace: number): Podium {
        const updatedMultiplayer = podium.multiplayer;
        const updatedRank = { time: updatePodiumInformation.time, name: updatePodiumInformation.username };
        const tempSecondRank = podium.multiplayer.first;
        const tempThirdRank = podium.multiplayer.second;

        switch (podiumPlace) {
            case 1:
                updatedMultiplayer.first = updatedRank;
                updatedMultiplayer.second = tempSecondRank;
                updatedMultiplayer.third = tempThirdRank;
                break;
            case 2:
                updatedMultiplayer.second = updatedRank;
                updatedMultiplayer.third = tempThirdRank;
                break;
            case 3:
                updatedMultiplayer.third = updatedRank;
                break;
        }

        podium.multiplayer = updatedMultiplayer;
        return podium;
    }
}
