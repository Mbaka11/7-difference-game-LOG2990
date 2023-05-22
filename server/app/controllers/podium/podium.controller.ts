import { GamesService } from '@app/services/database/games.service';
import { PodiumService } from '@app/services/podium/podium.service';
import { Podium } from '@common/podium';
import { UpdatePodiumInformation } from '@common/update-podium-information';
import { Body, Controller, Delete, Get, Param, Patch, Put } from '@nestjs/common';

@Controller('podium')
export class PodiumController {
    constructor(private gamesService: GamesService, private podiumService: PodiumService) {}

    @Get('/:id')
    async getPodiumById(@Param('id') id: string): Promise<Podium> {
        return await this.gamesService.getPodiumByGameId(parseInt(id, 10));
    }

    @Delete('/all')
    async deleteAllPodiums(): Promise<void> {
        await this.gamesService.deleteAllPodiums();
    }

    @Delete('/:id')
    async deletePodiumById(@Param('id') id: string): Promise<void> {
        await this.gamesService.deletePodiumByGameId(parseInt(id, 10));
    }

    @Patch('/all')
    async resetAllPodiums(): Promise<void> {
        await this.gamesService.updateAllPodiums();
    }

    @Patch('/:id')
    async resetPodiumById(@Param('id') id: string): Promise<void> {
        const numberId = parseInt(id, 10);
        await this.gamesService.resetPodiumById(numberId);
    }

    @Put('')
    async updatePodium(@Body() body: UpdatePodiumInformation): Promise<number> {
        const podiumPlace = await this.podiumService.updatePodium(body);
        return podiumPlace;
    }
}
