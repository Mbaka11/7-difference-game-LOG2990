/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { GameType } from '@common/gametype';
import { UpdatePodiumInformation } from '@common/update-podium-information';

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    interface ImgData {
        name: string;
        originalData: string;
        diffData: string;
        radius: number;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    it('should make a GET request to the correct URL with the provided game ID', () => {
        const gameIdString = '123';
        const expectedUrl = `${baseUrl}/app-router/mistakes/${gameIdString}`;

        service.getAllDifferences(gameIdString).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toEqual('GET');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('imageValidate should return expected data (HttpClient called once)', () => {
        const image: ImgData = {
            name: 'nData',
            originalData: 'oData',
            diffData: 'dData',
            radius: 3,
        };
        const expectedData = {
            data: 'data',
            difficulty: 'easy',
            numberOfDiff: 2,
        };

        service.imageValidate(image).subscribe({
            next: (response) => {
                expect(response).toEqual(expectedData);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/validate`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedData);
    });

    it('imageValidate post should handle http error safely', () => {
        const image: ImgData = {
            name: 'nData',
            originalData: 'oData',
            diffData: 'dData',
            radius: 3,
        };

        service.imageValidate(image).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/validate`);
        expect(req.request.method).toBe('POST');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('imageSave should return expected response on successful image save (HttpClient called once)', () => {
        const imageName = 'TestImage';
        const difficulty = 'Easy';
        const numberOfDiff = 5;

        service.imageSave(imageName, difficulty, numberOfDiff).subscribe({
            next: () => {
                expect().nothing();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/save`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({ imageName, difficulty, numberOfDiff });
        req.flush({});
    });

    it('imageSave should handle http error safely on unsuccessful image save', () => {
        service.imageSave('TestImage', 'Easy', 5).subscribe({
            next: () => {
                expect().nothing();
            },
            error: (error) => {
                expect(error).toBeDefined();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/save`);
        expect(req.request.method).toBe('PATCH');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('deleteTemps should return an empty response (HttpClient called once)', () => {
        service.deleteTemps().subscribe({
            next: (response) => {
                expect(response).toBeNull();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/temp`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('deleteTemps should handle http error safely', () => {
        service.deleteTemps().subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: (error) => {
                expect(error).toBeDefined();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/temp`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('deleteTemps should return an empty response (HttpClient called once)', () => {
        service.deleteReal(1).subscribe({
            next: (response) => {
                expect(response).toBeNull();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/real/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('deleteTemps should handle http error safely', () => {
        service.deleteReal(1).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: (error) => {
                expect(error).toBeDefined();
            },
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/real/1`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('imageGet should handle http error safely', () => {
        const fileName = 'testFile';

        service.imageGet(fileName).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/image/${fileName}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('getPixels should return expected pixels data (HttpClient called once)', () => {
        const gameName = 'testGame';
        const expectedPixelsData = {
            original: [
                [
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                [
                    [0, 0, 0],
                    [0, 0, 0],
                ],
            ],
            modified: [
                [
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                [
                    [0, 0, 0],
                    [0, 0, 0],
                ],
            ],
        };

        service.getPixels(gameName).subscribe({
            next: (response) => {
                expect(response.original).toEqual(expectedPixelsData.original);
                expect(response.modified).toEqual(expectedPixelsData.modified);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/algo-controller/pixels/${gameName}`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedPixelsData);
    });

    it('clickInfoGet should return expected click info data (HttpClient called once)', () => {
        const testAttempt = { gameName: 'testGame', xCoord: 0, yCoord: 0 };
        const expectedClickInfoData = [{ col: 1, row: 1 }];

        service.clickInfoGet(testAttempt).subscribe({
            next: (response) => {
                expect(response).toEqual(expectedClickInfoData);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/app-router/mistake`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(testAttempt);
        req.flush(expectedClickInfoData);
    });

    it('clickInfoGet should handle http error safely', () => {
        const testAttempt = { gameName: 'testGame', xCoord: 0, yCoord: 0 };

        service.clickInfoGet(testAttempt).subscribe({
            next: (response) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/app-router/mistake`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(testAttempt);
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should reset a podium', () => {
        const gameId = 123;

        service.resetPodium(gameId);

        const req = httpMock.expectOne(`${baseUrl}/podium/${gameId}`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual({});

        req.flush({});
    });

    it('should reset all podiums', () => {
        service.resetAllPodiums();

        const req = httpMock.expectOne(`${baseUrl}/podium/all`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual({});

        req.flush({});
    });

    it('should updat podiums', () => {
        const podium: UpdatePodiumInformation = {
            username: 'test',
            time: 2,
            gameId: 3,
            gameType: GameType.SoloClassic,
            gameName: 'tra',
        };
        service.updatePodium(podium).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/podium`);
        expect(req.request.method).toEqual('PUT');
        expect(req.request.body).toEqual(podium);

        req.flush({});
    });

    it('should get a game card', () => {
        const gameId = 123;

        service.getGameCard(gameId).subscribe((gameCard) => {
            expect(gameCard).toEqual({
                gameId,
                gameName: 'test',
                gameDifficulty: 'test',
                numberOfDiff: 3,
            });
        });

        const req = httpMock.expectOne(`${baseUrl}/game-card/${gameId}`);
        expect(req.request.method).toEqual('GET');

        const expectedGameCard = {
            gameId,
            gameName: 'test',
            gameDifficulty: 'test',
            numberOfDiff: 3,
        };
        req.flush(expectedGameCard);
    });

    it('should get a podium', () => {
        const gameId = 123;

        service.getPodiumById(gameId).subscribe((podium) => {
            expect(podium).toEqual({
                gameId,
                solo: {
                    first: { time: 10, name: 'Player 1' },
                    second: { time: 20, name: 'Player 2' },
                    third: { time: 30, name: 'Player 3' },
                },
                multiplayer: {
                    first: { time: 10, name: 'Player 4' },
                    second: { time: 20, name: 'Player 5' },
                    third: { time: 30, name: 'Player 6' },
                },
            });
        });

        const req = httpMock.expectOne(`${baseUrl}/podium/${gameId}`);
        expect(req.request.method).toEqual('GET');

        const expectedPodium = {
            gameId,
            solo: {
                first: { time: 10, name: 'Player 1' },
                second: { time: 20, name: 'Player 2' },
                third: { time: 30, name: 'Player 3' },
            },
            multiplayer: {
                first: { time: 10, name: 'Player 4' },
                second: { time: 20, name: 'Player 5' },
                third: { time: 30, name: 'Player 6' },
            },
        };
        req.flush(expectedPodium);
    });

    it('should delete all games', () => {
        service.deleteAllGames();

        const req = httpMock.expectOne(`${baseUrl}/game-card/all`);
        expect(req.request.method).toEqual('DELETE');

        req.flush({});
    });
});
