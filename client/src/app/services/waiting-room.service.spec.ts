import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { WaitingRoomEvents } from '@app/constants/waiting-room.events';
import { SocketClientService } from './socket-client.service';
import { WaitingRoomService } from './waiting-room.service';

const ROOM_NAME = 'roomNameTest';
const CREATOR_ANSWER = true;
const USERNAME = 'usernameTest';
const CREATOR_USERNAME = 'creatorUsernameTest';
const GAME_ROOMS = ['gameRoom-1', 'gameRoom-2', 'gameRoom-3'];

describe('WaitingRoomService', () => {
    let service: WaitingRoomService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketClientService],
        });
        socketTestHelper = new SocketTestHelper() as unknown as SocketTestHelper;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service = new WaitingRoomService({ socket: socketTestHelper } as any);

        spyOn(service.socket, 'emit');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onIsGameCreator should call socket.emit and socket.on with WaitingRoomEvents.IsGameCreator and roomName and execute callback', () => {
        let answerTest = false;
        const answerChange = true;
        const callback = (answer: boolean): void => {
            answerTest = answer;
        };

        service.onIsGameCreator(ROOM_NAME, callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.IsGameCreator, answerChange);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.IsGameCreator, ROOM_NAME);
        expect(answerTest).toBe(answerChange);
    });

    it('onIsRoomFull should call socket.emit and socket.on with WaitingRoomEvents.IsRoomFull and roomName and execute callback', () => {
        let answerTest = false;
        const answerChange = true;
        const callback = (answer: boolean): void => {
            answerTest = answer;
        };

        service.onIsRoomFull(ROOM_NAME, callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.IsRoomFull, answerChange);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.IsRoomFull, ROOM_NAME);
        expect(answerTest).toBe(answerChange);
    });

    it('onOpponentJoinedGame should call socket.on and execute callback', () => {
        let gameRoomNameToChange = '';
        let opponentUsernameToChange = '';
        const gameRoomNameTest = 'gameRoomTest';
        const opponentUsernameTest = 'opponentUsernameTest';

        const callback = ({ gameRoomName, opponentUsername }: { gameRoomName: string; opponentUsername: string }): void => {
            gameRoomNameToChange = gameRoomName;
            opponentUsernameToChange = opponentUsername;
        };

        service.onOpponentJoinedGame(callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.OpponentJoinedGame, {
            gameRoomName: gameRoomNameTest,
            opponentUsername: opponentUsernameTest,
        });

        expect(gameRoomNameToChange).toBe(gameRoomNameTest);
        expect(opponentUsernameToChange).toBe(opponentUsernameTest);
    });

    it('onOpponentLeftGame should call socket.on and execute callback', () => {
        let varTest = '';
        const varTestChange = 'change varTest';
        const callback = (): void => {
            varTest = varTestChange;
        };

        service.onOpponentLeftGame(callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.OpponentLeftGame);

        expect(varTest).toBe(varTestChange);
    });

    it('onResponseOfCreator should call socket.on and execute callback', () => {
        let creatorAnswerTest = false;
        let gameRoomNameTest = '';
        const creatorAnswerTestChange = true;
        const gameRoomNameTestChange = 'change gameRoomNameTest';
        const callback = ({ creatorAnswer, gameRoomName }: { creatorAnswer: boolean; gameRoomName: string }): void => {
            creatorAnswerTest = creatorAnswer;
            gameRoomNameTest = gameRoomName;
        };

        service.onResponseOfCreator(callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.ResponseOfCreator, {
            creatorAnswer: creatorAnswerTestChange,
            gameRoomName: gameRoomNameTestChange,
        });

        expect(creatorAnswerTest).toBe(creatorAnswerTestChange);
        expect(gameRoomNameTest).toBe(gameRoomNameTestChange);
    });

    it('onCreatorLeftGame should call socket.on and execute callback', () => {
        let varTest = '';
        const varTestChange = 'change varTest';
        const callback = (): void => {
            varTest = varTestChange;
        };

        service.onCreatorLeftGame(callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.CreatorLeftGame, varTestChange);

        expect(varTest).toBe(varTestChange);
    });

    it('onGetCreatorUsername should call socket.on and execute callback', () => {
        let creatorUsernameTest = '';
        const creatorUsernameTestChange = 'change creatorUsernameTest';
        const callback = (creatorUsername: string): void => {
            creatorUsernameTest = creatorUsername;
        };

        service.onGetCreatorUsername(callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.GetCreatorUsername, creatorUsernameTestChange);

        expect(creatorUsernameTest).toBe(creatorUsernameTestChange);
    });

    it('onGiveCreatorUsername should call socket.on and execute callback', () => {
        let varTest = '';
        const varTestChange = 'change varTest';
        const callback = (): void => {
            varTest = varTestChange;
        };

        service.onGiveCreatorUsername(callback);

        socketTestHelper.peerSideEmit(WaitingRoomEvents.GiveCreatorUsername);

        expect(varTest).toBe(varTestChange);
    });

    it('getGameRooms should call socket.emit and socket.on with WaitingRoomEvents.GetGameRooms and roomName and execute callback', () => {
        service.getGameRooms();

        socketTestHelper.peerSideEmit(WaitingRoomEvents.GetGameRooms, GAME_ROOMS);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.GetGameRooms);
        expect(service.gameRooms).toBe(GAME_ROOMS);
    });

    it('isRoomCreated should return true if the roomName is in the gameRooms', () => {
        service.gameRooms = GAME_ROOMS;

        expect(service.isRoomCreated(GAME_ROOMS[1])).toBe(true);
    });

    it('joinGameRoom should call socket.emit with roomName', () => {
        service.joinGameRoom(ROOM_NAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.JoinGameRoom, ROOM_NAME);
    });

    it('responseOfCreator should call socket.emit with creatorUsername and roomName', () => {
        service.responseOfCreator(CREATOR_ANSWER, ROOM_NAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.ResponseOfCreator, { creatorAnswer: CREATOR_ANSWER, roomName: ROOM_NAME });
    });

    it('creatorLeftGame should call socket.emit with roomName', () => {
        service.creatorLeftGame(ROOM_NAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.CreatorLeftGame, ROOM_NAME);
    });

    it('opponentLeftGame should call socket.emit with roomName', () => {
        service.opponentLeftGame(ROOM_NAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.OpponentLeftGame, ROOM_NAME);
    });

    it('opponentJoinedGame should call socket.emit with roomName and username', () => {
        service.opponentJoinedGame(ROOM_NAME, USERNAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.OpponentJoinedGame, {
            roomName: ROOM_NAME,
            username: USERNAME,
        });
    });

    it('leaveGameRoom should call socket.emit with roomName', () => {
        service.leaveGameRoom(ROOM_NAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.LeaveGameRoom, ROOM_NAME);
    });

    it('leaveQueueRoom should call socket.emit with roomName', () => {
        service.leaveQueueRoom(ROOM_NAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.LeaveQueueRoom, ROOM_NAME);
    });

    it('giveCreatorUsername should call socket.emit with roomName and creatorUsername', () => {
        service.giveCreatorUsername(ROOM_NAME, CREATOR_USERNAME);

        expect(service.socket.emit).toHaveBeenCalledWith(WaitingRoomEvents.CreatorUsername, {
            roomName: ROOM_NAME,
            creatorUsername: CREATOR_USERNAME,
        });
    });

    it('callbackGetGameRooms should store its argument into gameRooms', () => {
        service.callbackGetGameRooms(GAME_ROOMS);

        expect(service.gameRooms).toBe(GAME_ROOMS);
    });

    it('removeWaitingRoomListeners should call socket.removeListener for all WaitingRoomEvents except one', () => {
        service.socket = jasmine.createSpyObj(['removeListener']);

        service.removeWaitingRoomListeners();

        const waitingRoomEventsLength = Object.keys(WaitingRoomEvents).length;

        expect(service.socket.removeListener).toHaveBeenCalledTimes(waitingRoomEventsLength - 1);
    });
});
