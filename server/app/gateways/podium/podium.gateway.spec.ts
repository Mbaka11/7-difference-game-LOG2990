import { Podium } from '@common/podium';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { PodiumGateway } from './podium.gateway';

describe('PodiumGateway', () => {
    let gateway: PodiumGateway;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [PodiumGateway],
        }).compile();

        gateway = module.get<PodiumGateway>(PodiumGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('broadcastPodium() should emit a podium at BroadcastPodium event', () => {
        const podium: Podium = {
            gameId: 23534,
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

        jest.spyOn(server, 'emit');

        gateway.broadcastPodium(podium);

        expect(server.emit).toHaveBeenCalledWith('BroadcastPodium', podium);
    });
});
