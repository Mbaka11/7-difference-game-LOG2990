import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TimerFactoryService } from './timer-factory.service';

jest.mock('@app/services/timer/timer.service', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TimerService: jest.fn().mockImplementation(() => ({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        stopTimer: jest.fn(),
        stopTotalGameTimer: jest.fn(),
        changeIntervalTox1: jest.fn(),
        changeIntervalTox2: jest.fn(),
        changeIntervalTox4: jest.fn(),
        setInvertedTimer: jest.fn(),
        decrementTimer: jest.fn(),
        incrementTimer: jest.fn(),
        resetTimer: jest.fn(),
        replayTimer: jest.fn(),
    })),
}));

import { TimerService } from '@app/services/timer/timer.service';

const USER_1_ID = '-f3g34rg43g5hxz';
const USER_2_ID = '123gregg5sdd213';
const USER_3_ID = '9gr0u8g29ub8yg3';
const USER_4_ID = 'r32t43gfdgth565';
const GAME_ID = 1;

const INVALID_ROOM_NAME = `rien-gameId-${GAME_ID}`;
const SINGLEPLAYER_ROOM_NAME = `singleplayer-gameId-${GAME_ID}-group-${USER_2_ID}`;
const MULTIPLAYER_ROOM_NAME = `multiplayer-gameId-${GAME_ID}-group-${USER_2_ID}`;
const MULTIPLAYER_1_PLAYER_ROOM_NAME = `multiplayer-gameId-${GAME_ID}-group-${USER_4_ID}`;
const TIME_MULTIPLAYER_PLAYER_ROOM_NAME = `timeMultiplayer-gameId-${GAME_ID}-group-${USER_4_ID}`;

const ROOMS_TEST: Map<string, Set<string>> = new Map();

const INVALID_ROOM = new Set([]);
const SINGLEPLAYER_ROOM = new Set([USER_1_ID]);
const MULTIPLAYER_ROOM = new Set([USER_2_ID, USER_3_ID]);
const MULTIPLAYER_1_PLAYER = new Set([USER_4_ID]);

ROOMS_TEST.set(INVALID_ROOM_NAME, INVALID_ROOM);
ROOMS_TEST.set(SINGLEPLAYER_ROOM_NAME, SINGLEPLAYER_ROOM);
ROOMS_TEST.set(MULTIPLAYER_ROOM_NAME, MULTIPLAYER_ROOM);
ROOMS_TEST.set(MULTIPLAYER_1_PLAYER_ROOM_NAME, MULTIPLAYER_1_PLAYER);
ROOMS_TEST.set(TIME_MULTIPLAYER_PLAYER_ROOM_NAME, MULTIPLAYER_1_PLAYER);

describe('TimerFactoryService', () => {
    let service: TimerFactoryService;
    let waitingRoomService: WaitingRoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TimerService],
            providers: [
                TimerFactoryService,
                WaitingRoomService,
                { provide: TimerGateway, useValue: {} },
                TimerService,
                TimerGateway,
                {
                    provide: 'roomName',
                    useValue: 'roomName',
                },
            ],
        }).compile();

        service = module.get<TimerFactoryService>(TimerFactoryService);
        waitingRoomService = module.get<WaitingRoomService>(WaitingRoomService);

        jest.spyOn(waitingRoomService, 'getGroupFromRoomName').mockImplementation((roomName: string) => {
            const substring = 'group-';
            const remainingStr = roomName.slice(roomName.indexOf(substring) + substring.length);
            return remainingStr;
        });
        jest.spyOn(waitingRoomService, 'getGameTypeFromRoomName').mockImplementation((roomName: string) => {
            const arr = roomName.split('-');
            return arr[0];
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTimer()', () => {
        it('should not generate timer when gameType is not singleplayer or multiplayer', () => {
            jest.spyOn(service.timers, 'set');

            service.generateTimer(INVALID_ROOM_NAME, ROOMS_TEST.get(INVALID_ROOM_NAME));

            expect(service.timers.set).not.toHaveBeenCalled();
        });

        it('should generate timer for its roomName when gameType is singleplayer', () => {
            service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

            const timer = service.timers.get(USER_2_ID);

            expect(timer).toBeTruthy();
        });

        it('should generate timer for its roomName when gameType is multiplayer', () => {
            service.generateTimer(MULTIPLAYER_ROOM_NAME, ROOMS_TEST.get(MULTIPLAYER_ROOM_NAME));

            const timer = service.timers.get(USER_2_ID);

            expect(timer).toBeTruthy();
        });

        it('should not generate timer when gameType is multiplayer but the room has only one player', () => {
            service.generateTimer(MULTIPLAYER_1_PLAYER_ROOM_NAME, ROOMS_TEST.get(MULTIPLAYER_1_PLAYER_ROOM_NAME));

            const timer = service.timers.get(USER_4_ID);

            expect(timer).toBeUndefined();
        });

        it('should not generate timer when a timer is already created for a group', () => {
            service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

            const timerCreated = service.timers.get(USER_2_ID);

            expect(timerCreated).toBeTruthy();

            const timerNotCreated = service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

            expect(timerNotCreated).toBeUndefined();
        });
    });

    it('changePlaybackSpeedX1() should call changeIntervalTox1 from the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.changePlaybackSpeedX1(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).changeIntervalTox1).toHaveBeenCalled();
    });

    it('changePlaybackSpeedX2() should call changeIntervalTox2 from the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.changePlaybackSpeedX2(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).changeIntervalTox2).toHaveBeenCalled();
    });

    it('changePlaybackSpeedX4() should call changeIntervalTox4 from the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.changePlaybackSpeedX4(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).changeIntervalTox4).toHaveBeenCalled();
    });

    it('setInvertedTimer() should call setInvertedTimer from the good timer', () => {
        const roomGroup = USER_2_ID;
        const startTimerValue = 60;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.setInvertedTimer(SINGLEPLAYER_ROOM_NAME, startTimerValue);

        expect(service.timers.get(roomGroup).setInvertedTimer).toHaveBeenCalled();
    });

    it('decrementTimer() should call decrementTimer from the good timer', () => {
        const roomGroup = USER_2_ID;
        const decrementValue = 60;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.decrementTimer(SINGLEPLAYER_ROOM_NAME, decrementValue);

        expect(service.timers.get(roomGroup).decrementTimer).toHaveBeenCalled();
    });

    it('incrementTimer() should call incrementTimer from the good timer', () => {
        const roomGroup = USER_2_ID;
        const incrementValue = 60;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.incrementTimer(SINGLEPLAYER_ROOM_NAME, incrementValue);

        expect(service.timers.get(roomGroup).incrementTimer).toHaveBeenCalled();
    });

    describe('deleteTimer()', () => {
        it('should call stopTimer from the good timer and delete it in the timers variable', () => {
            const roomGroup = USER_2_ID;
            service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));
            expect(service.timers.get(roomGroup)).toBeTruthy();

            service.deleteTimer(SINGLEPLAYER_ROOM_NAME, SINGLEPLAYER_ROOM);

            expect(service.timers.size).toEqual(0);
        });

        it('should not call stopTimer if its gameType timeMultiplayer and its room.size is > 0', () => {
            const roomGroup = USER_4_ID;
            service.generateTimer(TIME_MULTIPLAYER_PLAYER_ROOM_NAME, ROOMS_TEST.get(TIME_MULTIPLAYER_PLAYER_ROOM_NAME));
            expect(service.timers.get(roomGroup)).toBeTruthy();

            service.deleteTimer(TIME_MULTIPLAYER_PLAYER_ROOM_NAME, ROOMS_TEST.get(TIME_MULTIPLAYER_PLAYER_ROOM_NAME));

            expect(service.timers.size).toEqual(1);
        });
    });

    it('resetTimer() should call incrementTimer from the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.resetTimer(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).resetTimer).toHaveBeenCalled();
    });

    it('stopTimer() should call stopTimer from the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.stopTimer(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).stopTimer).toHaveBeenCalled();
    });

    it('stopTotalGameTimer() should call stopTotalGameTimer grom the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.stopTotalGameTimer(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).stopTotalGameTimer).toHaveBeenCalled();
    });

    it('replayTimer() should call replayTimer from the good timer', () => {
        const roomGroup = USER_2_ID;
        service.generateTimer(SINGLEPLAYER_ROOM_NAME, ROOMS_TEST.get(SINGLEPLAYER_ROOM_NAME));

        service.replayTimer(SINGLEPLAYER_ROOM_NAME);

        expect(service.timers.get(roomGroup).replayTimer).toHaveBeenCalled();
    });
});
