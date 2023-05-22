import { Attempt } from '@app/gateways/chat/attempt';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { FileService } from '@app/services/file/file.service';
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

interface Coordinate {
    row: number;
    col: number;
}
@Controller('app-router')
export class AppRouterController {
    constructor(private algo: AlgoService, private fileService: FileService) {}

    @Post('mistake')
    async getMistake(@Body() values: Attempt) {
        const differences: Coordinate[][] = await this.fileService.getJSONDifferencesArray(values.gameName);
        const xCoord = values.xCoord;
        const yCoord = values.yCoord;
        const answer: Coordinate[] | null = this.algo.isDifferentPixel(differences, yCoord, xCoord);
        return answer;
    }

    @Get('mistakes/:id')
    async getMistakes(@Param('id') id: string, @Res() res: Response) {
        const differences: Coordinate[][] = await this.fileService.getJSONDifferencesArray(id);
        res.send(differences);
    }
}
