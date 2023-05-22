import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { InterpretRouteService } from './interpret-route.service';

describe('InterpretRouteService', () => {
    let service: InterpretRouteService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [InterpretRouteService],
        });
        service = TestBed.inject(InterpretRouteService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getGameId should return the username query parameter from the route', () => {
        const id = '3';
        const paramMap = new Map<string, string>();
        paramMap.set('gameId', id);

        const activatedRoute = TestBed.inject(ActivatedRoute);
        const getSpy = spyOn(activatedRoute.snapshot.queryParamMap, 'get').and.returnValue(id);

        const result = service.getGameId(activatedRoute);

        expect(result).toBe(Number(id));
        expect(getSpy).toHaveBeenCalledWith('gameId');
    });

    it('getGameUsername should return the username query parameter from the route', () => {
        const username = 'test';
        const paramMap = new Map<string, string>();
        paramMap.set('username', username);

        const activatedRoute = TestBed.inject(ActivatedRoute);
        const getSpy = spyOn(activatedRoute.snapshot.queryParamMap, 'get').and.returnValue(username);

        const result = service.getGameUsername(activatedRoute);

        expect(result).toBe(username);
        expect(getSpy).toHaveBeenCalledWith('username');
    });

    it('getGameOpponentUsername should return the username query parameter from the route', () => {
        const username = 'test';
        const paramMap = new Map<string, string>();
        paramMap.set('opponentUsername', username);

        const activatedRoute = TestBed.inject(ActivatedRoute);
        const getSpy = spyOn(activatedRoute.snapshot.queryParamMap, 'get').and.returnValue(username);

        const result = service.getGameOpponentUsername(activatedRoute);

        expect(result).toBe(username);
        expect(getSpy).toHaveBeenCalledWith('opponentUsername');
    });

    it('getRoomName should return the username query parameter from the route', () => {
        const roomName = 'test';
        const paramMap = new Map<string, string>();
        paramMap.set('roomGameName', roomName);

        const activatedRoute = TestBed.inject(ActivatedRoute);
        const getSpy = spyOn(activatedRoute.snapshot.queryParamMap, 'get').and.returnValue(roomName);

        const result = service.getRoomName(activatedRoute);

        expect(result).toBe(roomName);
        expect(getSpy).toHaveBeenCalledWith('roomGameName');
    });
});
