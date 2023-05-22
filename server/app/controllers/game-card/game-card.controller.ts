import { FileService } from '@app/services/file/file.service';
import { Controller, Delete, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('game-card')
export class GameCardController {
    constructor(private fileService: FileService) {}

    @Get('/:id')
    async getGameCardTest(@Param('id') id: string, @Res() res: Response) {
        const game = await this.fileService.getGamesById(parseInt(id, 10));
        res.send(game);
    }

    @Delete('/all')
    async deleteAllGames(): Promise<void> {
        await this.fileService.deleteAllGames();
    }
}
