import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class InterpretRouteService {
    getGameId(route: ActivatedRoute): number {
        return Number(route.snapshot.queryParamMap.get('gameId') as string);
    }

    getGameUsername(route: ActivatedRoute): string {
        return route.snapshot.queryParamMap.get('username') as string;
    }

    getGameOpponentUsername(route: ActivatedRoute): string {
        return route.snapshot.queryParamMap.get('opponentUsername') as string;
    }

    getRoomName(route: ActivatedRoute): string {
        return route.snapshot.queryParamMap.get('roomGameName') as string;
    }

    getPlayerType(route: ActivatedRoute): string {
        return route.snapshot.queryParamMap.get('userType') as string;
    }
}
