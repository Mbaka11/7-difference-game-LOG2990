import { Game, TimeGame, TimeGameSetting } from '@app/Common/time-game-interface';
import { WaitingRoomGateway } from '@app/gateways/waiting-room/waiting-room.gateway';
import { AlgoService } from '@app/services/algo/detection-algo.service';
import { GamesService } from '@app/services/database/games.service';
import { GameInformation } from '@common/game-information';
import { Podium } from '@common/podium';
import { Injectable } from '@nestjs/common';
import * as cv from 'canvas';
import * as fs from 'fs';

interface Coordinate {
    row: number;
    col: number;
}

const PIXEL_DEPTH = 4;

@Injectable()
export class FileService {
    genericPath: string = './assets/images';
    constructor(public algoService: AlgoService, public gameDatabase: GamesService, public waitingRoomGateway: WaitingRoomGateway) {}
    async extractFile(path: string, file: string) {
        const imageData = file.split(',')[1];
        const buffer = Buffer.from(imageData, 'base64');
        await new Promise<void>((resolve) => {
            fs.writeFile(`${this.genericPath}/${path}.bmp`, buffer, () => {
                resolve();
            });
        });
    }

    async readImage(fileName: string): Promise<string> {
        const buffer = await new Promise<Buffer>((resolve, reject) => {
            fs.readFile(`${this.genericPath}/${fileName}.bmp`, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        return buffer.toString('base64');
    }

    async writeImage(gameName: string, isOriginal: boolean, gameDataURL: string) {
        const folder: string = isOriginal ? 'originals' : 'modified';
        await new Promise<void>((resolve) => {
            fs.writeFile(`${this.genericPath}/${folder}/${gameName}.bmp`, gameDataURL, 'base64', () => {
                resolve();
            });
        });
    }

    async saveClusterArrayToJSON(array: Coordinate[][], path: string) {
        await new Promise<void>((resolve) => {
            fs.writeFile(`./assets/differences/${path}.json`, JSON.stringify(array), () => {
                resolve();
            });
        });
    }

    async saveJSONTempToGameName(gameName: string) {
        const data: string = await new Promise<string>((resolve, reject) => {
            fs.readFile('assets/differences/temp/temp.json', 'utf8', (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        const array: Coordinate[][] = JSON.parse(data);
        await this.saveClusterArrayToJSON(array, gameName);
    }

    async getJSONDifferencesArray(gameName: string) {
        const data: string = await new Promise<string>((resolve, reject) => {
            fs.readFile(`assets/differences/${gameName}.json`, 'utf8', (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        const array: Coordinate[][] = JSON.parse(data);

        return array;
    }

    async generateDifferenceBMP(differenceSheet: boolean[][]) {
        return new Promise<void>((resolve) => {
            const pixels: number[][][] = this.algoService.createPixelDifferenceSheet(differenceSheet);

            const width = pixels[0].length;
            const height = pixels.length;
            const canvas = cv.createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            const imageData = ctx.createImageData(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * PIXEL_DEPTH;
                    const [r, g, b] = pixels[y][x];
                    imageData.data[i + 0] = r;
                    imageData.data[i + 1] = g;
                    imageData.data[i + 2] = b;
                    imageData.data[i + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            const buffer = canvas.toBuffer();
            new Promise<void>((res) => {
                fs.writeFile(`${this.genericPath}/imageTemp/diffImage.bmp`, buffer, () => {
                    res();
                });
            }).then(() => {
                resolve();
            });
        });
    }

    async deleteFile(path: string) {
        await new Promise<void>((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async getGames(): Promise<GameInformation[]> {
        return await this.gameDatabase.getGames();
    }

    async getGamesById(id: number): Promise<GameInformation> {
        return (await this.getGames()).find((games) => games.gameId === id);
    }
    async deleteGameWithId(id: number) {
        await this.gameDatabase.deleteGame(id);
        await this.gameDatabase.deletePodiumByGameId(id);
    }

    async deleteAllGames(): Promise<void> {
        const allIds: string[] = await this.gameDatabase.getAllIds();
        for (const id of allIds) {
            this.waitingRoomGateway.disconnectAll(Number(id));
            this.deleteGameWithId(parseInt(id, 10));
        }
    }

    async getIdAndAddGame(inputGame: GameInformation): Promise<number> {
        const highestId = await this.gameDatabase.getHighestId();
        const lastItemId: number = highestId > 0 ? highestId : 0;
        const thisGameId = lastItemId + 1;
        const newGame = {
            gameId: thisGameId,
            gameName: inputGame.gameName,
            gameDifficulty: inputGame.gameDifficulty,
            numberOfDiff: inputGame.numberOfDiff,
        };

        const newPodium: Podium = await this.gameDatabase.createFakePodium(thisGameId);
        await this.gameDatabase.createGame(newGame);
        await this.gameDatabase.createPodium(newPodium);
        return thisGameId;
    }

    async saveTimeGameSetting(path: string, settings: TimeGameSetting) {
        await new Promise<void>((resolve) => {
            fs.writeFile(path, JSON.stringify(settings), () => {
                resolve();
            });
        });
    }

    async getTimeGame(pathSetting: string) {
        const settingsTemp: string = await this.readSettingsFile(pathSetting);
        const timeGameSettings: TimeGameSetting = JSON.parse(settingsTemp);
        const games: Game[] = await this.getShuffledGames();
        const randomizedGameAndSettings: TimeGame = {
            timeGames: games,
            settings: timeGameSettings,
        };
        return randomizedGameAndSettings;
    }

    async readSettingsFile(pathSetting: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(pathSetting, 'utf8', (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    async getShuffledGames(): Promise<Game[]> {
        const gamesInformation: GameInformation[] = await this.getGames();
        const shuffledGames = this.shuffle(gamesInformation);
        const games: Game[] = [];
        for (const game of shuffledGames) {
            const nextGame: Game = {
                gameOriginal: await this.readImage(`originals/${game.gameId}`),
                gameModified: await this.readImage(`modified/${game.gameId}`),
                gameDifferences: await this.getJSONDifferencesArray(game.gameId.toString()),
                gameInformation: game,
            };
            games.push(nextGame);
        }
        return games;
    }

    shuffle(array: GameInformation[]): GameInformation[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
