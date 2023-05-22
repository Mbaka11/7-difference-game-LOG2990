import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server } from 'socket.io';
import { TimerEvents } from './timer-events';
import { TimerGateway } from './timer.gateway';

describe('TimerGateway', () => {
    let gateway: TimerGateway;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [TimerGateway],
        }).compile();

        gateway = module.get<TimerGateway>(TimerGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('emitTimer()', () => {
        it('should emit timer to the room in its arguments', () => {
            const roomName = 'roomNameTest';
            const timerTest = 123;

            server.to.returns({
                emit: (event: string, timer: number) => {
                    expect(event).toEqual(TimerEvents.GetTimer);
                    expect(timer).toEqual(timerTest);
                },
            } as BroadcastOperator<unknown, unknown>);

            gateway.emitTimer(roomName, timerTest);

            expect(server.to.calledWith(roomName)).toBeTruthy();
        });
    });

    it('emitTotalGameTimer() should emit totalGameTimer to the room in its arguments', () => {
        const roomName = 'roomNameTest';
        const totalGameTimerTest = 123;

        server.to.returns({
            emit: (event: string, timer: number) => {
                expect(event).toEqual(TimerEvents.GetTotalGameTimer);
                expect(timer).toEqual(totalGameTimerTest);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.emitTotalGameTimer(roomName, totalGameTimerTest);

        expect(server.to.calledWith(roomName)).toBeTruthy();
    });

    it('emitInvertedEnd() should emit InvertedTimerEnd to a room', () => {
        const roomName = 'roomNameTest';

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(TimerEvents.InvertedTimerEnd);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.emitInvertedEnd(roomName);

        expect(server.to.calledWith(roomName)).toBeTruthy();
    });
});
