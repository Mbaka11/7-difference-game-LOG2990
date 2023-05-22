import { Injectable } from '@nestjs/common';
import Jimp = require('jimp');

interface Coordinate {
    row: number;
    col: number;
}

const WHITE_BIT = 255;
const BLACK_PIXEL: number[] = [0, 0, 0];
const WHITE_PIXEL: number[] = [WHITE_BIT, WHITE_BIT, WHITE_BIT];
const maxHeight = 480;
const maxWidth = 640;
const MAX_PERCENTAGE = 15;
const MAX_DIFFERENCES_FOR_DIFFICULT = 7;

@Injectable()
export class AlgoService {
    async readImage(path: string): Promise<number[][][]> {
        return new Promise(async (resolve) => {
            const image = await Jimp.read(path);
            const width = image.bitmap.width;
            const height = image.bitmap.height;
            const pixels: number[][][] = [];
            for (let y = 0; y < height; y++) {
                pixels[y] = [];
                for (let x = 0; x < width; x++) {
                    const { r, g, b, a } = Jimp.intToRGBA(image.getPixelColor(x, y));
                    pixels[y][x] = [r, g, b, a];
                }
            }
            resolve(pixels);
        });
    }

    async findDifferences(pathImage1: string, pathImage2: string, radius: number): Promise<{ differences: boolean[][]; nbDiffPixels: number }> {
        const pixels1: number[][][] = await this.readImage(pathImage1);
        const pixels2: number[][][] = await this.readImage(pathImage2);
        const differences: boolean[][] = [];
        for (let i = 0; i < pixels1.length; i++) {
            differences[i] = Array(pixels1[0].length).fill(false);
            for (let j = 0; j < pixels1[0].length; j++) {
                differences[i][j] = !this.isSamePixel(pixels1[i][j], pixels2[i][j]);
            }
        }
        return await this.createDifferenceSheet(differences, radius);
    }

    async findDifferenceInformation(diffSheetAndDiffPixels: {
        differences: boolean[][];
        nbDiffPixels: number;
    }): Promise<{ nbDifferences: number; difficulty: string; clusters: Coordinate[][] }> {
        let numberOfDifferences = 0;
        let difficulty = '';
        const clusters: Coordinate[][] = [];
        for (let i = 0; i < diffSheetAndDiffPixels.differences.length; i++) {
            for (let j = 0; j < diffSheetAndDiffPixels.differences[i].length; j++) {
                if (diffSheetAndDiffPixels.differences[i][j]) {
                    clusters[numberOfDifferences] = [];
                    this.bfs(diffSheetAndDiffPixels.differences, { row: i, col: j }, clusters, numberOfDifferences++);
                }
            }
        }
        difficulty = this.getDifficulty(diffSheetAndDiffPixels.nbDiffPixels, numberOfDifferences);
        return { nbDifferences: numberOfDifferences, difficulty, clusters };
    }

    isDifferentPixel(differences: Coordinate[][], row: number, col: number): Coordinate[] | null {
        for (const coordsInDifference of differences) {
            for (const coord of coordsInDifference) {
                if (coord.row === row && coord.col === col) {
                    return coordsInDifference;
                }
            }
        }

        return null;
    }

    bfs(differenceSheet: boolean[][], start: Coordinate, clusters: Coordinate[][], diffNumber: number) {
        const coordQueue = [start];
        while (coordQueue.length > 0) {
            const currentCoord: Coordinate = coordQueue.shift();
            const currentRow = currentCoord.row;
            const currentCol = currentCoord.col;
            if (
                currentRow >= 0 &&
                currentRow < differenceSheet.length &&
                currentCol >= 0 &&
                currentCol < differenceSheet[0].length &&
                differenceSheet[currentRow][currentCol]
            ) {
                differenceSheet[currentRow][currentCol] = false;
                clusters[diffNumber].push({ row: currentRow, col: currentCol });
                coordQueue.push({ row: currentRow - 1, col: currentCol });
                coordQueue.push({ row: currentRow + 1, col: currentCol });
                coordQueue.push({ row: currentRow, col: currentCol - 1 });
                coordQueue.push({ row: currentRow, col: currentCol + 1 });
                coordQueue.push({ row: currentRow - 1, col: currentCol - 1 });
                coordQueue.push({ row: currentRow - 1, col: currentCol + 1 });
                coordQueue.push({ row: currentRow + 1, col: currentCol - 1 });
                coordQueue.push({ row: currentRow + 1, col: currentCol + 1 });
            }
        }
    }

    async createDifferenceSheet(differences: boolean[][], radius: number): Promise<{ differences: boolean[][]; nbDiffPixels: number }> {
        return new Promise((resolve) => {
            let differentPixels = 0;
            const markedPixels: boolean[][] = [];
            const width: number = differences[0].length;
            const height: number = differences.length;
            for (let i = 0; i < differences.length; i++) {
                markedPixels[i] = Array(width).fill(false);
            }
            for (let i = 0; i < differences.length; i++) {
                for (let j = 0; j < differences[0].length; j++) {
                    if (differences[i][j] && !this.isInteriorDifference(differences, i, j)) {
                        for (let r = radius; r >= 0; r--) {
                            for (let x = -r; x <= r; x++) {
                                if (i + x >= 0 && i + x < height && j + (r - Math.abs(x)) < width) {
                                    if (!markedPixels[i + x][j + (r - Math.abs(x))]) {
                                        markedPixels[i + x][j + (r - Math.abs(x))] = true;
                                        differentPixels++;
                                    }
                                }
                                if (i + x >= 0 && i + x < height && j - (r - Math.abs(x)) >= 0) {
                                    if (!markedPixels[i + x][j - (r - Math.abs(x))]) {
                                        markedPixels[i + x][j - (r - Math.abs(x))] = true;
                                        differentPixels++;
                                    }
                                }
                            }
                        }
                    } else if (differences[i][j] && this.isInteriorDifference(differences, i, j)) {
                        markedPixels[i][j] = true;
                        differentPixels++;
                    }
                }
            }
            resolve({ differences: markedPixels, nbDiffPixels: differentPixels });
        });
    }

    createPixelDifferenceSheet(diffSheet: boolean[][]): number[][][] {
        const pixelDiffSheet: number[][][] = [];
        for (let i = 0; i < diffSheet.length; i++) {
            pixelDiffSheet[i] = [];
            for (let j = 0; j < diffSheet[i].length; j++) {
                pixelDiffSheet[i][j] = diffSheet[i][j] ? BLACK_PIXEL : WHITE_PIXEL;
            }
        }
        return pixelDiffSheet;
    }

    isSamePixel(pixel1: number[], pixel2: number[]): boolean {
        for (let i = 0; i <= 2; i++) {
            if (pixel1[i] !== pixel2[i]) {
                return false;
            }
        }
        return true;
    }

    isInteriorDifference(differences: boolean[][], xCoord: number, yCoord: number): boolean {
        for (const position of this.getPositionsToCheck(differences, xCoord, yCoord)) {
            if (!differences[position[0]][position[1]]) {
                return false;
            }
        }

        return true;
    }

    getPositionsToCheck(differences: boolean[][], xCoord: number, yCoord: number): number[][] {
        const positions: number[][] = [];
        if (xCoord > 0) {
            positions.push([xCoord - 1, yCoord]);
            if (yCoord > 0) {
                positions.push([xCoord - 1, yCoord - 1]);
            }
            if (yCoord < differences[xCoord].length - 1) {
                positions.push([xCoord - 1, yCoord + 1]);
            }
        }
        if (xCoord < differences.length - 1) {
            positions.push([xCoord + 1, yCoord]);
            if (yCoord > 0) {
                positions.push([xCoord + 1, yCoord - 1]);
            }
            if (yCoord < differences[xCoord].length - 1) {
                positions.push([xCoord + 1, yCoord + 1]);
            }
        }
        if (yCoord > 0) {
            positions.push([xCoord, yCoord - 1]);
        }
        if (yCoord < differences[xCoord].length - 1) {
            positions.push([xCoord, yCoord + 1]);
        }
        return positions;
    }

    getDifferencePercentage(nbDiffPixels: number) {
        const percentFactor = 100;
        return (nbDiffPixels / (maxHeight * maxWidth)) * percentFactor;
    }

    getDifficulty(nbDiffPixels: number, numberOfDifferences: number): string {
        return this.getDifferencePercentage(nbDiffPixels) <= MAX_PERCENTAGE && numberOfDifferences >= MAX_DIFFERENCES_FOR_DIFFICULT
            ? 'difficile'
            : 'facile';
    }
}
