import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { PodiumGateway } from '@app/gateways/podium/podium.gateway';
import { GamesRepository } from '@app/services/database/games.repository';
import { GamesService } from '@app/services/database/games.service';
import { PodiumService } from '@app/services/podium/podium.service';
import { GameType } from '@common/gametype';
import { Podium } from '@common/podium';
import { UpdatePodiumInformation } from '@common/update-podium-information';
import { Test, TestingModule } from '@nestjs/testing';
import { PodiumController } from './podium.controller';

describe('PodiumController', () => {
    let controller: PodiumController;
    let podiumController: PodiumController;
    let gamesService: GamesService;
    let podiumService: PodiumService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GamesService,
                PodiumService,
                { provide: GamesRepository, useValue: {} },
                { provide: PodiumGateway, useValue: {} },
                { provide: ChatGateway, useValue: {} },
            ],
            controllers: [PodiumController],
        }).compile();

        controller = module.get<PodiumController>(PodiumController);
        podiumController = module.get<PodiumController>(PodiumController);
        gamesService = module.get<GamesService>(GamesService);
        podiumService = module.get<PodiumService>(PodiumService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getPodiumById() should return a Podium object', async () => {
        const gameId = 123544;
        const testPodium: Podium = {
            gameId,
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

        jest.spyOn(gamesService, 'getPodiumByGameId').mockResolvedValue(testPodium);

        const result = await podiumController.getPodiumById(gameId.toString());

        expect(result).toEqual(testPodium);
    });

    it('deleteAllPodiums should call gamesService.deleteAllPodiums', async () => {
        jest.spyOn(gamesService, 'deleteAllPodiums').mockResolvedValue();

        podiumController.deleteAllPodiums();

        expect(gamesService.deleteAllPodiums).toHaveBeenCalled();
    });

    it('deletePodiumById should call gamesService.deletePodiumByGameId', async () => {
        const gameId = 1;

        jest.spyOn(gamesService, 'deletePodiumByGameId').mockResolvedValue();

        podiumController.deletePodiumById(gameId.toString());

        expect(gamesService.deletePodiumByGameId).toHaveBeenCalledWith(gameId);
    });

    it('resetAllPodiums should call gamesService.updateAllPodiums', async () => {
        jest.spyOn(gamesService, 'updateAllPodiums').mockResolvedValue();

        podiumController.resetAllPodiums();

        expect(gamesService.updateAllPodiums).toHaveBeenCalled();
    });

    it('resetPodiumById should call gamesService.resetPodiumById', async () => {
        const gameId = 1;

        jest.spyOn(gamesService, 'resetPodiumById').mockResolvedValue();

        podiumController.resetPodiumById(gameId.toString());

        expect(gamesService.resetPodiumById).toHaveBeenCalledWith(gameId);
    });

    it('updatePodium should call gamesService.updatePodium and return its value', async () => {
        const podiumPlace = 1;
        const updatePodiumInformationTest: UpdatePodiumInformation = {
            username: 'usernameTest',
            time: 10,
            gameId: 1,
            gameType: GameType.SoloClassic,
            gameName: 'gameNameTest',
        };

        jest.spyOn(podiumService, 'updatePodium').mockResolvedValue(podiumPlace);

        const podiumControllerReturnValue = await podiumController.updatePodium(updatePodiumInformationTest);

        expect(podiumService.updatePodium).toHaveBeenCalledWith(updatePodiumInformationTest);
        expect(podiumControllerReturnValue).toEqual(podiumPlace);
    });
});
