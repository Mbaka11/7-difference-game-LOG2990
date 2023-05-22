import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QUEUE_ROOM_NAME, WAITING_ROOM_NAME } from '@app/constants/waiting-room.constants';
import { CommunicationService } from '@app/services/communication.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import { GameInformation } from '@common/game-information';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnDestroy {
    gameId: number;
    username: string;
    opponentUsername: string;
    creatorUsername: string;
    gameCard: GameInformation;
    gameCardLoaded: boolean = false;
    gameMode: string = '1 vs 1';
    isGameCreator: boolean;
    isRoomFull: boolean = true;
    gameType: string;
    roomName: string;

    constructor(
        private route: ActivatedRoute,
        public comService: CommunicationService,
        private waitingRoomService: WaitingRoomService,
        private router: Router,
    ) {
        this.gameId = this.getGameId();
        this.username = this.getGameUsername();
        this.gameType = this.getGameType();
        this.roomName = this.getRoomGameName();
        if (this.gameType !== 'time') this.getGameCard();

        this.waitingRoomService.onDeleteRoom(this.callbackOnDeleteRoom);
        this.waitingRoomService.onIsRoomFull(WAITING_ROOM_NAME + this.gameId, this.callbackOnIsRoomFull);
    }

    initializeWaitingRoom(): void {
        this.waitingRoomService.joinGameRoom(WAITING_ROOM_NAME + this.gameId);
        this.waitingRoomService.onIsGameCreator(WAITING_ROOM_NAME + this.gameId, this.callbackOnIsGameCreator);
    }

    getGameId(): number {
        return Number(this.route.snapshot.queryParamMap.get('gameId') as string);
    }

    getGameUsername(): string {
        return this.route.snapshot.queryParamMap.get('username') as string;
    }

    getGameType(): string {
        return this.route.snapshot.queryParamMap.get('gameType') as string;
    }

    getRoomGameName(): string {
        return this.route.snapshot.queryParamMap.get('roomGameName') as string;
    }

    getGameCard(): void {
        this.comService.getGameCard(this.gameId).subscribe((data) => {
            this.gameCard = data;
            this.gameCardLoaded = true;
        });
    }

    acceptOpponent(): void {
        this.waitingRoomService.responseOfCreator(true, WAITING_ROOM_NAME + this.gameId);
        this.waitingRoomService.onResponseOfCreator(this.callbackResponseOfCreator);
    }

    refuseOpponent(): void {
        this.waitingRoomService.responseOfCreator(false, WAITING_ROOM_NAME + this.gameId);
        this.resetOpponentUsername();
    }

    resetOpponentUsername(): void {
        this.opponentUsername = '';
    }

    leaveGame(): void {
        if (this.isRoomFull) this.waitingRoomService.leaveQueueRoom(QUEUE_ROOM_NAME + this.gameId);
        else if (this.isGameCreator) this.creatorLeaveGame();
        else this.opponentLeaveGame();
    }

    creatorLeaveGame(): void {
        this.waitingRoomService.creatorLeftGame(WAITING_ROOM_NAME + this.gameId);
    }

    opponentLeaveGame(): void {
        this.waitingRoomService.opponentLeftGame(WAITING_ROOM_NAME + this.gameId);
        this.waitingRoomService.leaveGameRoom(WAITING_ROOM_NAME + this.gameId);
    }

    gameCreatorActions(): void {
        this.waitingRoomService.onOpponentJoinedGame(this.callbackOnOpponentJoinedGame);
        this.waitingRoomService.onOpponentLeftGame(this.callbackOnOpponentLeftGame);
        this.waitingRoomService.onGiveCreatorUsername(this.callbackOnGiveCreatorUsername);
    }

    gameJoinerActions(): void {
        this.waitingRoomService.opponentJoinedGame(WAITING_ROOM_NAME + this.gameId, this.username);
        this.waitingRoomService.onResponseOfCreator(this.callbackOnResponseOfCreator);
        this.waitingRoomService.onCreatorLeftGame(this.callbackOnCreatorLeftGame);
        this.waitingRoomService.onGetCreatorUsername(this.callbackOnGetCreatorUsername);
    }

    callbackOnDeleteRoom = (): void => {
        this.router.navigate(['home']);
    };

    callbackOnIsRoomFull = (answer: boolean): void => {
        this.isRoomFull = answer;
        if (!answer) this.initializeWaitingRoom();
        else this.waitingRoomService.joinGameRoom(QUEUE_ROOM_NAME + this.gameId);
    };

    callbackOnIsGameCreator = (answer: boolean): void => {
        this.isGameCreator = answer;
        if (answer) this.gameCreatorActions();
        else this.gameJoinerActions();
    };

    callbackResponseOfCreator = ({ creatorAnswer, gameRoomName }: { creatorAnswer: boolean; gameRoomName: string }): void => {
        if (creatorAnswer)
            this.router.navigate(['/gamemultiplayer'], {
                queryParams: {
                    gameId: this.gameId,
                    username: this.username,
                    opponentUsername: this.opponentUsername,
                    roomGameName: gameRoomName,
                },
            });
    };

    timeGameRouteOpponent = (gameRoomName: string): void => {
        this.waitingRoomService.leaveGameRoom(WAITING_ROOM_NAME + this.gameId);
        this.router.navigate(['/time-gamemultiplayer'], {
            queryParams: {
                gameId: this.gameId,
                username: this.username,
                opponentUsername: this.creatorUsername,
                roomGameName: gameRoomName,
                userType: 'joiner',
            },
        });
    };

    timeGameRouteCreator = (gameRoomName: string): void => {
        this.waitingRoomService.leaveGameRoom(WAITING_ROOM_NAME + this.gameId);
        this.router.navigate(['/time-gamemultiplayer'], {
            queryParams: {
                gameId: this.gameId,
                username: this.username,
                opponentUsername: this.opponentUsername,
                roomGameName: gameRoomName,
                userType: 'creator',
            },
        });
    };

    callbackOnOpponentJoinedGame = ({ gameRoomName, opponentUsername }: { gameRoomName: string; opponentUsername: string }): void => {
        this.opponentUsername = opponentUsername;
        if (this.gameType === 'time') this.roomName = gameRoomName;
    };

    callbackOnOpponentLeftGame = (): void => {
        this.resetOpponentUsername();
    };

    callbackOnGiveCreatorUsername = (): void => {
        this.waitingRoomService.giveCreatorUsername(WAITING_ROOM_NAME + this.gameId, this.username);
        if (this.gameType === 'time') this.timeGameRouteCreator(this.roomName);
    };

    callbackOnResponseOfCreator = ({ creatorAnswer, gameRoomName }: { creatorAnswer: boolean; gameRoomName: string }): void => {
        if (creatorAnswer) {
            this.waitingRoomService.leaveGameRoom(WAITING_ROOM_NAME + this.gameId);
            this.router.navigate(['/gamemultiplayer'], {
                queryParams: {
                    gameId: this.gameId,
                    username: this.username,
                    opponentUsername: this.creatorUsername,
                    roomGameName: gameRoomName,
                },
            });
        } else {
            this.waitingRoomService.leaveGameRoom(WAITING_ROOM_NAME + this.gameId);
            this.router.navigate(['home']);
        }
    };

    callbackOnCreatorLeftGame = (): void => {
        this.waitingRoomService.leaveGameRoom(WAITING_ROOM_NAME + this.gameId);
        this.router.navigate(['home']);
    };

    callbackOnGetCreatorUsername = (creatorUsername: string): void => {
        this.creatorUsername = creatorUsername;
        if (this.gameType === 'time') this.timeGameRouteOpponent(this.roomName);
    };

    ngOnDestroy(): void {
        this.waitingRoomService.removeWaitingRoomListeners();
    }
}
