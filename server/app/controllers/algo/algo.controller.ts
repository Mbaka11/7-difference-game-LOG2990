import { TimeGameSetting } from '@app/Common/time-game-interface';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { FileService } from '@app/services/file/file.service';
import { GameInformation } from '@common/game-information';
import { Body, Controller, Delete, Get, Param, Post, Res } from '@nestjs/common';
import { Patch } from '@nestjs/common/decorators';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { Response } from 'express';

interface ImgData {
    originalData: string;
    diffData: string;
    name: string;
    radius: number;
}

interface Coordinate {
    row: number;
    col: number;
}
@Controller('algo-controller')
export class AlgoController {
    constructor(private algoService: AlgoService, private fileService: FileService, private waitingRoomGateway: WaitingRoomGateway) {}

    @Get('/image/:name')
    async getImage(@Param('name') fileName: string, @Res() res: Response) {
        const leftImageURL = await this.fileService.readImage(`originals/${fileName}`);
        const rightImageURL = await this.fileService.readImage(`modified/${fileName}`);
        const settingsTemp: string = await this.fileService.readSettingsFile('./assets/settings.json');
        const timeGameSettingServer: TimeGameSetting = JSON.parse(settingsTemp);
        res.send({ leftData: leftImageURL, rightData: rightImageURL, timeGameSetting: timeGameSettingServer });
    }

    @Get('images')
    async getAllImages(@Res() res: Response) {
        const games: GameInformation[] = await this.fileService.getGames();
        const data: string[] = [];
        for (const game of games) {
            data.push(await this.fileService.readImage(`originals/${game.gameId.toString()}`));
        }
        res.send({ data, games });
    }

    @ApiCreatedResponse({
        description: 'Send a message',
    })
    @Delete('temp')
    async deleteTemps() {
        await this.fileService.deleteFile('assets/differences/temp/temp.json');
        await this.fileService.deleteFile('assets/images/imageTemp/diffImage.bmp');
        await this.fileService.deleteFile('assets/images/imageTemp/modified.bmp');
        await this.fileService.deleteFile('assets/images/imageTemp/original.bmp');
    }

    @Delete('real/:gameId')
    async deleteReal(@Param('gameId') gameId: string) {
        const gameIdNumber = parseInt(gameId, 10);
        this.waitingRoomGateway.disconnectAll(gameIdNumber);
        await this.fileService.deleteFile(`assets/differences/${gameId}.json`);
        await this.fileService.deleteFile(`assets/images/modified/${gameId}.bmp`);
        await this.fileService.deleteFile(`assets/images/originals/${gameId}.bmp`);
        this.fileService.deleteGameWithId(gameIdNumber);
    }

    @Patch('/save')
    async save(@Body() body: { imageName: string; difficulty: string; numberOfDiff: number }) {
        const originalImage: string = await this.fileService.readImage('imageTemp/original');
        const modifiedImage: string = await this.fileService.readImage('imageTemp/modified');
        const inputGame: GameInformation = { gameId: 0, gameName: body.imageName, gameDifficulty: body.difficulty, numberOfDiff: body.numberOfDiff };
        const gameId: number = await this.fileService.getIdAndAddGame(inputGame);
        await this.fileService.writeImage(gameId.toString(), true, originalImage);
        await this.fileService.writeImage(gameId.toString(), false, modifiedImage);
        await this.fileService.saveJSONTempToGameName(gameId.toString());
    }

    @Post('/validate')
    async validate(@Body() file: ImgData, @Res() res: Response) {
        let data: string;
        await this.fileService.extractFile('imageTemp/original', file.originalData);
        await this.fileService.extractFile('imageTemp/modified', file.diffData);
        const diffSheetAndDiffPixels: { differences: boolean[][]; nbDiffPixels: number } = await this.algoService.findDifferences(
            'assets/images/imageTemp/original.bmp',
            'assets/images/imageTemp/modified.bmp',
            file.radius,
        );
        const diffSheetCopy: boolean[][] = JSON.parse(JSON.stringify(diffSheetAndDiffPixels.differences));
        const nbDifferencesAndDifficulty: { nbDifferences: number; difficulty: string; clusters: Coordinate[][] } =
            await this.algoService.findDifferenceInformation(diffSheetAndDiffPixels);
        await this.fileService.saveClusterArrayToJSON(nbDifferencesAndDifficulty.clusters, 'temp/temp');
        this.fileService.generateDifferenceBMP(diffSheetCopy).then(async () => {
            data = await this.fileService.readImage('imageTemp/diffImage');

            res.send({
                data,
                difficulty: nbDifferencesAndDifficulty.difficulty,
                numberOfDiff: nbDifferencesAndDifficulty.nbDifferences,
            });
        });
    }

    @Get('/pixels/:gameName')
    async getModifiedPixels(@Param('gameName') gameName: string, @Res() res: Response) {
        const originalPixels: number[][][] = await this.algoService.readImage(`assets/images/originals/${gameName}.bmp`);
        const modifiedPixels: number[][][] = await this.algoService.readImage(`assets/images/modified/${gameName}.bmp`);

        res.send({ original: originalPixels, modified: modifiedPixels });
    }
}
