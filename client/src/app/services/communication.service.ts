import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { TimeGameSetting } from '@app/common/time-game-interface';
import { Attempt } from '@app/interfaces/attempt';
import { Podium } from '@app/interfaces/podium';
import { GameInformation } from '@common/game-information';
import { UpdatePodiumInformation } from '@common/update-podium-information';
import { Observable, Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
interface ImgData {
    name: string;
    originalData: string;
    diffData: string;
    radius: number;
}
interface Coordinate {
    row: number;
    col: number;
}
@Injectable({
    providedIn: 'root',
})
export class CommunicationService implements OnDestroy {
    private readonly baseUrl: string = environment.serverUrl;
    private ngUnsubscribe = new Subject();

    constructor(private readonly http: HttpClient) {}

    getAllDifferences(gameIdString: string) {
        return this.http
            .get<Coordinate[][]>(`${this.baseUrl}/app-router/mistakes/${gameIdString}`)
            .pipe(catchError(this.handleError<Coordinate[][]>('imageValidate')));
    }

    imageSave(imageName: string, difficulty: string, numberOfDiff: number) {
        return this.http
            .patch(`${this.baseUrl}/algo-controller/save`, { imageName, difficulty, numberOfDiff })
            .pipe(catchError(this.handleError('imageValidate')));
    }

    imageValidate(image: ImgData) {
        return this.http
            .post<{ data: string; difficulty: string; numberOfDiff: number }>(`${this.baseUrl}/algo-controller/validate`, image)
            .pipe(catchError(this.handleError<{ data: string; difficulty: string; numberOfDiff: number }>('imageValidate')));
    }

    clickInfoGet(attempt: Attempt) {
        return this.http
            .post<Coordinate[]>(`${this.baseUrl}/app-router/mistake`, attempt)
            .pipe(catchError(this.handleError<Coordinate[]>('imageValidate')));
    }

    deleteTemps() {
        return this.http.delete(`${this.baseUrl}/algo-controller/temp`).pipe(catchError(this.handleError('imageValidate')));
    }

    deleteReal(id: number) {
        return this.http.delete(`${this.baseUrl}/algo-controller/real/${id}`).pipe(catchError(this.handleError('imageValidate')));
    }

    resetPodium(gameId: number): void {
        this.http.patch(`${this.baseUrl}/podium/${gameId}`, {}).pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }

    resetAllPodiums(): void {
        this.http.patch(`${this.baseUrl}/podium/all`, {}).pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }

    updatePodium(updatePodiumInformation: UpdatePodiumInformation) {
        return this.http.put(`${this.baseUrl}/podium`, updatePodiumInformation).pipe(takeUntil(this.ngUnsubscribe));
    }

    imageGet(fileName: string) {
        return this.http
            .get<{ leftData: string; rightData: string; timeGameSetting: TimeGameSetting }>(`${this.baseUrl}/algo-controller/image/${fileName}`)
            .pipe(catchError(this.handleError<{ leftData: string; rightData: string; timeGameSetting: TimeGameSetting }>('imageValidate')));
    }

    getPixels(gameName: string) {
        return this.http
            .get<{ original: number[][][]; modified: number[][][] }>(`${this.baseUrl}/algo-controller/pixels/${gameName}`)
            .pipe(catchError(this.handleError<{ original: number[][][]; modified: number[][][] }>('imageValidate')));
    }

    imageGetAllURLs() {
        return this.http.get<{ data: string[]; games: GameInformation[] }>(`${this.baseUrl}/algo-controller/images`);
    }

    getGameCard(gameId: number) {
        return this.http.get<GameInformation>(`${this.baseUrl}/game-card/${gameId.toString()}`);
    }

    getPodiumById(gameId: number): Observable<Podium> {
        return this.http.get<Podium>(`${this.baseUrl}/podium/${gameId}`);
    }

    deleteAllGames() {
        return this.http.delete(`${this.baseUrl}/game-card/all`).pipe(takeUntil(this.ngUnsubscribe)).subscribe();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(undefined);
        this.ngUnsubscribe.complete();
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
