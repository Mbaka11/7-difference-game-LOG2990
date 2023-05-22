import { TimerGateway } from '@app/gateways/timer/timer.gateway';
import { TimerFactoryService } from '@app/services/timer-factory/timer-factory.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { TimerFactoryGateway } from './timer-factory.gateway';

const SOCKET_MOCK: Socket = {} as Socket;

describe('TimerFactoryGateway', () => {
    let gateway: TimerFactoryGateway;
    let server: SinonStubbedInstance<Server>;
    let timerFactoryService: TimerFactoryService;

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerFactoryGateway,
                TimerFactoryService,
                { provide: WaitingRoomService, useValue: {} },
                { provide: TimerGateway, useValue: {} },
            ],
        }).compile();

        gateway = module.get<TimerFactoryGateway>(TimerFactoryGateway);
        timerFactoryService = module.get<TimerFactoryService>(TimerFactoryService);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('changePlaybackSpeedX1 should call timerFactoryService.changePlaybackSpeedX1', () => {
        const roomName = 'roomNameTest';

        jest.spyOn(timerFactoryService, 'changePlaybackSpeedX1').mockImplementation();

        gateway.changePlaybackSpeedX1(SOCKET_MOCK, roomName);

        expect(timerFactoryService.changePlaybackSpeedX1).toHaveBeenCalledWith(roomName);
    });

    it('changePlaybackSpeedX2 should call timerFactoryService.changePlaybackSpeedX2', () => {
        const roomName = 'roomNameTest';

        jest.spyOn(timerFactoryService, 'changePlaybackSpeedX2').mockImplementation();

        gateway.changePlaybackSpeedX2(SOCKET_MOCK, roomName);

        expect(timerFactoryService.changePlaybackSpeedX2).toHaveBeenCalledWith(roomName);
    });

    it('changePlaybackSpeedX4 should call timerFactoryService.changePlaybackSpeedX4', () => {
        const roomName = 'roomNameTest';

        jest.spyOn(timerFactoryService, 'changePlaybackSpeedX4').mockImplementation();

        gateway.changePlaybackSpeedX4(SOCKET_MOCK, roomName);

        expect(timerFactoryService.changePlaybackSpeedX4).toHaveBeenCalledWith(roomName);
    });

    it('setInvertedTimer should call timerFactoryService.setInvertedTimer', () => {
        const roomName = 'roomNameTest';
        const timerStartValue = 60;
        const convertToSeconds = 10;
        jest.spyOn(timerFactoryService, 'setInvertedTimer').mockImplementation();

        gateway.setInvertedTimer(SOCKET_MOCK, { roomName, timerStartValue });

        expect(timerFactoryService.setInvertedTimer).toHaveBeenCalledWith(roomName, timerStartValue * convertToSeconds);
    });

    it('decrementTimer should call timerFactoryService.decrementTimer', () => {
        const roomName = 'roomNameTest';
        const decrementValue = 5;

        jest.spyOn(timerFactoryService, 'decrementTimer').mockImplementation();

        gateway.decrementTimer(SOCKET_MOCK, { roomName, decrementValue });

        expect(timerFactoryService.decrementTimer).toHaveBeenCalledWith(roomName, decrementValue);
    });

    it('incrementTimer should call timerFactoryService.incrementTimer', () => {
        const roomName = 'roomNameTest';
        const incrementValue = 5;

        jest.spyOn(timerFactoryService, 'incrementTimer').mockImplementation();

        gateway.incrementTimer(SOCKET_MOCK, { roomName, incrementValue });

        expect(timerFactoryService.incrementTimer).toHaveBeenCalledWith(roomName, incrementValue);
    });

    it('resetTimer should call timerFactoryService.resetTimer', () => {
        const roomName = 'roomNameTest';

        jest.spyOn(timerFactoryService, 'resetTimer').mockImplementation();

        gateway.resetTimer(SOCKET_MOCK, roomName);

        expect(timerFactoryService.resetTimer).toHaveBeenCalledWith(roomName);
    });

    it('stopTimer should call timerFactoryService.stopTimer', () => {
        const roomName = 'roomNameTest';

        jest.spyOn(timerFactoryService, 'stopTimer').mockImplementation();

        gateway.stopTimer(SOCKET_MOCK, roomName);

        expect(timerFactoryService.stopTimer).toHaveBeenCalledWith(roomName);
    });

    it('replayTimer should call timerFactoryService.replayTimer', () => {
        const roomName = 'roomNameTest';

        jest.spyOn(timerFactoryService, 'replayTimer').mockImplementation();

        gateway.replayTimer(SOCKET_MOCK, roomName);

        expect(timerFactoryService.replayTimer).toHaveBeenCalledWith(roomName);
    });
});
