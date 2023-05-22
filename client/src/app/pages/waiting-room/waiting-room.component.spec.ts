/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '@app/app.module';
import { QUEUE_ROOM_NAME, WAITING_ROOM_NAME } from '@app/constants/waiting-room.constants';
import { CommunicationService } from '@app/services/communication.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import { of } from 'rxjs';
import { WaitingRoomComponent } from './waiting-room.component';

const GAME_CARD = {
    gameId: 1,
    gameName: 'gameNameTest',
    gameDifficulty: 'easy',
    numberOfDiff: 2,
};

const USERNAME = 'usernameTest';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let waitingRoomService: WaitingRoomService;
    let comService: CommunicationService;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [RouterTestingModule.withRoutes([]), HttpClientModule, AppModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { queryParamMap: convertToParamMap({ gameId: GAME_CARD.gameId, username: USERNAME }) } },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        comService = TestBed.inject(CommunicationService);

        spyOn(comService, 'getGameCard').and.returnValue(of(GAME_CARD));

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        waitingRoomService = TestBed.inject(WaitingRoomService);
        router = TestBed.inject(Router);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set gameId, username and gameCard when component initialized', () => {
        expect(component.gameId).toBe(GAME_CARD.gameId);
        expect(component.username).toBe(USERNAME);
        expect(component.gameCard).toBe(GAME_CARD);
    });

    it('callbackOnDeleteRoom should call router.navigate to home', () => {
        const route = 'home';

        spyOn(router, 'navigate');

        component.callbackOnDeleteRoom();

        expect(router.navigate).toHaveBeenCalledWith([route]);
    });

    it('should call initializeWaitingRoom when isRoomFull is false', () => {
        spyOn(component, 'initializeWaitingRoom');

        component.callbackOnIsRoomFull(false);

        expect(component.isRoomFull).toBe(false);
        expect(component.initializeWaitingRoom).toHaveBeenCalled();
    });

    it('should call waitingRoomService.joinGameRoom with the good arguments when isRoomFull is true', () => {
        spyOn(waitingRoomService, 'joinGameRoom');

        component.callbackOnIsRoomFull(true);

        expect(component.isRoomFull).toBe(true);
        expect(waitingRoomService.joinGameRoom).toHaveBeenCalledWith(QUEUE_ROOM_NAME + GAME_CARD.gameId);
    });

    it('initializeWaitingRoom should call joinGameRoom and onIsGameCreator of the waitingRoomService with the good arguments', () => {
        spyOn(waitingRoomService, 'joinGameRoom');
        spyOn(waitingRoomService, 'onIsGameCreator');

        component.initializeWaitingRoom();

        expect(waitingRoomService.joinGameRoom).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(waitingRoomService.onIsGameCreator).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId, component.callbackOnIsGameCreator);
    });

    it('acceptOpponent should call responseOfCreator and onResponseOfCreator from the waitingRoomService with the good arguments', () => {
        spyOn(waitingRoomService, 'responseOfCreator');
        spyOn(waitingRoomService, 'onResponseOfCreator');

        component.acceptOpponent();

        expect(waitingRoomService.responseOfCreator).toHaveBeenCalledWith(true, WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(waitingRoomService.onResponseOfCreator).toHaveBeenCalledWith(component.callbackResponseOfCreator);
    });

    it('refuseOpponent should call waitingRoomService.responseOfCreator and resetOpponentUsername with the good arguments', () => {
        spyOn(waitingRoomService, 'responseOfCreator');
        spyOn(component, 'resetOpponentUsername');

        component.refuseOpponent();

        expect(waitingRoomService.responseOfCreator).toHaveBeenCalledWith(false, WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(component.resetOpponentUsername).toHaveBeenCalledWith();
    });

    it('resetOpponentUsername should set the value of opponentUsername to an empty string', () => {
        component.opponentUsername = 'opponentTest';

        component.resetOpponentUsername();

        expect(component.opponentUsername).toBe('');
    });

    it('leaveGame should call waitingRoomService.leaveQueueRoom when isRoomFull is true', () => {
        spyOn(waitingRoomService, 'leaveQueueRoom');

        component.isRoomFull = true;
        component.leaveGame();

        expect(waitingRoomService.leaveQueueRoom).toHaveBeenCalledWith(QUEUE_ROOM_NAME + GAME_CARD.gameId);
    });

    it('leaveGame should call creatorLeaveGame when isRoomFull is false and isGameCreator is true', () => {
        spyOn(component, 'creatorLeaveGame');

        component.isRoomFull = false;
        component.isGameCreator = true;
        component.leaveGame();

        expect(component.creatorLeaveGame).toHaveBeenCalledWith();
    });

    it('leaveGame should call opponentLeaveGame when isRoomFull is false and isGameCreator is false', () => {
        spyOn(component, 'opponentLeaveGame');

        component.isRoomFull = false;
        component.isGameCreator = false;
        component.leaveGame();

        expect(component.opponentLeaveGame).toHaveBeenCalledWith();
    });

    it('creatorLeaveGame should call waitingRoomService.creatorLeftGame with the good arguments', () => {
        spyOn(waitingRoomService, 'creatorLeftGame');

        component.creatorLeaveGame();

        expect(waitingRoomService.creatorLeftGame).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
    });

    it('opponentLeaveGame should call opponentLeftGame and leaveGameRoom from waitingRoomService with the good arguments', () => {
        spyOn(waitingRoomService, 'opponentLeftGame');
        spyOn(waitingRoomService, 'leaveGameRoom');

        component.opponentLeaveGame();

        expect(waitingRoomService.opponentLeftGame).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(waitingRoomService.leaveGameRoom).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
    });

    it('gameCreatorActions should call the good functions from waitingRoomService with the good callback', () => {
        spyOn(waitingRoomService, 'onOpponentJoinedGame');
        spyOn(waitingRoomService, 'onOpponentLeftGame');
        spyOn(waitingRoomService, 'onGiveCreatorUsername');

        component.gameCreatorActions();

        expect(waitingRoomService.onOpponentJoinedGame).toHaveBeenCalledWith(component.callbackOnOpponentJoinedGame);
        expect(waitingRoomService.onOpponentLeftGame).toHaveBeenCalledWith(component.callbackOnOpponentLeftGame);
        expect(waitingRoomService.onGiveCreatorUsername).toHaveBeenCalledWith(component.callbackOnGiveCreatorUsername);
    });

    it('gameJoinerActions should call the good functions from waitingRoomService with the good callback', () => {
        spyOn(waitingRoomService, 'opponentJoinedGame');
        spyOn(waitingRoomService, 'onResponseOfCreator');
        spyOn(waitingRoomService, 'onCreatorLeftGame');
        spyOn(waitingRoomService, 'onGetCreatorUsername');

        component.gameJoinerActions();

        expect(waitingRoomService.opponentJoinedGame).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId, component.username);
        expect(waitingRoomService.onResponseOfCreator).toHaveBeenCalledWith(component.callbackOnResponseOfCreator);
        expect(waitingRoomService.onCreatorLeftGame).toHaveBeenCalledWith(component.callbackOnCreatorLeftGame);
        expect(waitingRoomService.onGetCreatorUsername).toHaveBeenCalledWith(component.callbackOnGetCreatorUsername);
    });

    it('callbackOnIsGameCreator called with true should store true in isGameCreator and call gameCreatorActions', () => {
        spyOn(component, 'gameCreatorActions');

        component.callbackOnIsGameCreator(true);

        expect(component.isGameCreator).toBe(true);
        expect(component.gameCreatorActions).toHaveBeenCalledWith();
    });

    it('callbackOnIsGameCreator called with false should store false in isGameCreator and call gameJoinerActions', () => {
        spyOn(component, 'gameJoinerActions');

        component.callbackOnIsGameCreator(false);

        expect(component.isGameCreator).toBe(false);
        expect(component.gameJoinerActions).toHaveBeenCalledWith();
    });

    it('callbackResponseOfCreator called with creatorAnswer as true should navigate to gamemultiplayer with the good queryParams', () => {
        const creatorAnswer = true;
        const gameRoomName = 'gameRoomNameTest';
        const route = '/gamemultiplayer';
        const queryParams = {
            gameId: GAME_CARD.gameId,
            username: component.username,
            opponentUsername: component.opponentUsername,
            roomGameName: gameRoomName,
        };

        spyOn(router, 'navigate');

        component.callbackResponseOfCreator({ creatorAnswer, gameRoomName });

        expect(router.navigate).toHaveBeenCalledWith([route], { queryParams });
    });

    it('timeGameRouteCreator called with creatorAnswer as true should navigate to gamemultiplayer with the good queryParams', () => {
        const gameRoomName = 'gameRoomNameTest';
        const route = '/time-gamemultiplayer';
        const queryParams = {
            gameId: GAME_CARD.gameId,
            username: component.username,
            opponentUsername: component.opponentUsername,
            roomGameName: gameRoomName,
            userType: 'creator',
        };

        spyOn(router, 'navigate');

        component.timeGameRouteCreator(gameRoomName);

        expect(router.navigate).toHaveBeenCalledWith([route], { queryParams });
    });

    it('timeGameRouteOpponent called with creatorAnswer as true should navigate to gamemultiplayer with the good queryParams', () => {
        const gameRoomName = 'gameRoomNameTest';
        const route = '/time-gamemultiplayer';
        const queryParams = {
            gameId: GAME_CARD.gameId,
            username: component.username,
            opponentUsername: component.opponentUsername,
            roomGameName: gameRoomName,
            userType: 'joiner',
        };

        spyOn(router, 'navigate');

        component.timeGameRouteOpponent(gameRoomName);

        expect(router.navigate).toHaveBeenCalledWith([route], { queryParams });
    });

    it('callbackOnOpponentJoinedGame should set opponentUsername with its argument ', () => {
        const opponentUsername = 'opponentUsernameTest';
        const gameRoomName = 'gameRoomName';
        component.gameType = 'time';

        component.callbackOnOpponentJoinedGame({ gameRoomName, opponentUsername });

        expect(component.opponentUsername).toBe(opponentUsername);
    });

    it('callbackOnOpponentLeftGame should call resetOpponentUsername with nothing', () => {
        spyOn(component, 'resetOpponentUsername');

        component.callbackOnOpponentLeftGame();

        expect(component.resetOpponentUsername).toHaveBeenCalledWith();
    });

    it('callbackOnGiveCreatorUsername should call waitingRoomService.giveCreatorUsername with the good arguments', () => {
        spyOn(component, 'timeGameRouteCreator');
        spyOn(waitingRoomService, 'giveCreatorUsername');
        component.gameType = 'time';

        component.callbackOnGiveCreatorUsername();

        expect(waitingRoomService.giveCreatorUsername).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId, component.username);
    });

    it('callbackOnResponseOfCreator should call proper functions with good arguments if creatorAnswer is true', () => {
        const creatorAnswer = true;
        const gameRoomName = 'gameRoomNameTest';
        const route = '/gamemultiplayer';
        const queryParams = {
            gameId: GAME_CARD.gameId,
            username: component.username,
            opponentUsername: component.opponentUsername,
            roomGameName: gameRoomName,
        };

        spyOn(waitingRoomService, 'leaveGameRoom');
        spyOn(router, 'navigate');

        component.callbackOnResponseOfCreator({ creatorAnswer, gameRoomName });

        expect(waitingRoomService.leaveGameRoom).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(router.navigate).toHaveBeenCalledWith([route], { queryParams });
    });

    it('callbackOnResponseOfCreator should call proper functions with good arguments if creatorAnswer is false', () => {
        const creatorAnswer = false;
        const gameRoomName = 'gameRoomNameTest';
        const route = 'home';

        spyOn(waitingRoomService, 'leaveGameRoom');
        spyOn(router, 'navigate');

        component.callbackOnResponseOfCreator({ creatorAnswer, gameRoomName });

        expect(waitingRoomService.leaveGameRoom).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(router.navigate).toHaveBeenCalledWith([route]);
    });

    it('callbackOnCreatorLeftGame should call waitingRoomService.leaveGameRoom and router.navigate with the good arguments', () => {
        const route = 'home';

        spyOn(waitingRoomService, 'leaveGameRoom');
        spyOn(router, 'navigate');

        component.callbackOnCreatorLeftGame();

        expect(waitingRoomService.leaveGameRoom).toHaveBeenCalledWith(WAITING_ROOM_NAME + GAME_CARD.gameId);
        expect(router.navigate).toHaveBeenCalledWith([route]);
    });

    it('callbackOnGetCreatorUsername should set creatorUsername with its argument ', () => {
        const creatorUsername = 'creatorUsernameTest';
        spyOn(component, 'timeGameRouteOpponent');

        component.gameType = 'time';

        component.callbackOnGetCreatorUsername(creatorUsername);

        expect(component.creatorUsername).toBe(creatorUsername);
    });
});
