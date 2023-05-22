import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { PodiumGateway } from '@app/gateways/podium/podium.gateway';
import { GamesService } from '@app/services/database/games.service';
import { GameType } from '@common/gametype';
import { Podium } from '@common/podium';
import { UpdatePodiumInformation } from '@common/update-podium-information';
import { Test, TestingModule } from '@nestjs/testing';
import { PodiumService } from './podium.service';

const INVALID_PODIUM_PLACE = -1;

const UPDATE_PODIUM_INFORMATION: UpdatePodiumInformation = {
    username: 'usernameTest',
    time: 40,
    gameId: 1,
    gameType: GameType.SoloTime,
    gameName: 'gameNameTest',
};

const PODIUM_MOCK: Podium = {
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

describe('PodiumService', () => {
    let service: PodiumService;
    let gamesService: GamesService;
    let chatGateway: ChatGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PodiumService,
                { provide: PodiumGateway, useValue: {} },
                {
                    provide: GamesService,
                    useValue: {
                        getPodiumByGameId: jest.fn(),
                        updatePodium: jest.fn(),
                    },
                },
                {
                    provide: ChatGateway,
                    useValue: {
                        broadcastAllNewPodiumPlayer: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PodiumService>(PodiumService);
        gamesService = module.get<GamesService>(GamesService);
        chatGateway = module.get<ChatGateway>(ChatGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updatePodium()', () => {
        it('should update no update podium for invalid game type and return INVALID_PODIUM_PLACE', async () => {
            jest.spyOn(service, 'updateSoloPodium');
            jest.spyOn(service, 'updateMultiplayerPodium');

            const podiumPlace = await service.updatePodium(UPDATE_PODIUM_INFORMATION);

            expect(service.updateSoloPodium).not.toHaveBeenCalled();
            expect(service.updateMultiplayerPodium).not.toHaveBeenCalled();
            expect(podiumPlace).toEqual(INVALID_PODIUM_PLACE);
        });

        it('should call updateSoloPodium with updatePodiumInformation', async () => {
            const podiumPlaceMock = 1;
            jest.spyOn(service, 'updateSoloPodium').mockResolvedValue(podiumPlaceMock);
            const gameType = GameType.SoloClassic;
            const updatePodiumInformationSoloClassic = { ...UPDATE_PODIUM_INFORMATION };
            updatePodiumInformationSoloClassic.gameType = gameType;

            const podiumPlace = await service.updatePodium(updatePodiumInformationSoloClassic);

            expect(service.updateSoloPodium).toHaveBeenCalledWith(updatePodiumInformationSoloClassic);
            expect(podiumPlace).toEqual(podiumPlaceMock);
        });

        it('should call updateMultiplayerPodium with updatePodiumInformation', async () => {
            const podiumPlaceMock = 1;
            jest.spyOn(service, 'updateMultiplayerPodium').mockResolvedValue(podiumPlaceMock);
            const gameType = GameType.MultiplayerClassic;
            const updatePodiumInformationMultiplayerClassic = { ...UPDATE_PODIUM_INFORMATION };
            updatePodiumInformationMultiplayerClassic.gameType = gameType;

            const podiumPlace = await service.updatePodium(updatePodiumInformationMultiplayerClassic);

            expect(service.updateMultiplayerPodium).toHaveBeenCalledWith(updatePodiumInformationMultiplayerClassic);
            expect(podiumPlace).toEqual(podiumPlaceMock);
        });
    });

    describe('updateSoloPodium()', () => {
        it('should return INVALID_PODIUM_PLACE for a time who doesnt make it in the podium', async () => {
            jest.spyOn(gamesService, 'getPodiumByGameId').mockResolvedValue(PODIUM_MOCK);

            const podiumPlace = await service.updateSoloPodium(UPDATE_PODIUM_INFORMATION);

            expect(podiumPlace).toEqual(INVALID_PODIUM_PLACE);
        });

        it('should return the podium place, update podium in the database and broadcast all new podium player', async () => {
            const gameTime = 1;
            const updatePodiumInformationFirstPlace = { ...UPDATE_PODIUM_INFORMATION };
            updatePodiumInformationFirstPlace.time = gameTime;

            jest.spyOn(gamesService, 'getPodiumByGameId').mockResolvedValue(PODIUM_MOCK);
            jest.spyOn(service, 'getSoloPodiumUpdated').mockReturnValue(PODIUM_MOCK);
            jest.spyOn(gamesService, 'updatePodium');
            jest.spyOn(chatGateway, 'broadcastAllNewPodiumPlayer');

            const podiumPlace = await service.updateSoloPodium(updatePodiumInformationFirstPlace);

            expect(gamesService.updatePodium).toHaveBeenCalledWith(PODIUM_MOCK);
            expect(chatGateway.broadcastAllNewPodiumPlayer).toHaveBeenCalledWith(
                updatePodiumInformationFirstPlace.username,
                updatePodiumInformationFirstPlace.gameName,
                podiumPlace,
            );
            expect(podiumPlace).toEqual(1);
        });
    });

    describe('updateMultiplayerPodium()', () => {
        it('should return INVALID_PODIUM_PLACE for a time who doesnt make it in the podium', async () => {
            jest.spyOn(gamesService, 'getPodiumByGameId').mockResolvedValue(PODIUM_MOCK);

            const podiumPlace = await service.updateMultiplayerPodium(UPDATE_PODIUM_INFORMATION);

            expect(podiumPlace).toEqual(INVALID_PODIUM_PLACE);
        });

        it('should return the podium place, update podium in the database and broadcast all new podium player', async () => {
            const gameTime = 1;
            const updatePodiumInformationFirstPlace = { ...UPDATE_PODIUM_INFORMATION };
            updatePodiumInformationFirstPlace.time = gameTime;

            jest.spyOn(gamesService, 'getPodiumByGameId').mockResolvedValue(PODIUM_MOCK);
            jest.spyOn(service, 'getMultiplayerPodiumUpdated').mockReturnValue(PODIUM_MOCK);
            jest.spyOn(gamesService, 'updatePodium');
            jest.spyOn(chatGateway, 'broadcastAllNewPodiumPlayer');

            const podiumPlace = await service.updateMultiplayerPodium(updatePodiumInformationFirstPlace);

            expect(gamesService.updatePodium).toHaveBeenCalledWith(PODIUM_MOCK);
            expect(chatGateway.broadcastAllNewPodiumPlayer).toHaveBeenCalledWith(
                updatePodiumInformationFirstPlace.username,
                updatePodiumInformationFirstPlace.gameName,
                podiumPlace,
            );
            expect(podiumPlace).toEqual(1);
        });
    });

    describe('getPodiumPlace()', () => {
        it('should return 1 for first place', () => {
            const time = 1;
            const podiumToSort = service.getSoloPodiumToSort(PODIUM_MOCK);

            const podiumPlace = service.getPodiumPlace(podiumToSort, time);

            expect(podiumPlace).toEqual(1);
        });
        it('should return 2 for second place', () => {
            const time = 15;
            const podiumToSort = service.getSoloPodiumToSort(PODIUM_MOCK);

            const podiumPlace = service.getPodiumPlace(podiumToSort, time);

            expect(podiumPlace).toEqual(2);
        });
        it('should return 3 for third place', () => {
            const time = 25;
            const podiumToSort = service.getSoloPodiumToSort(PODIUM_MOCK);

            const podiumPlace = service.getPodiumPlace(podiumToSort, time);

            expect(podiumPlace).toEqual(3);
        });
        it('should return -1 for other than the 3 places of the podium', () => {
            const time = 40;
            const podiumToSort = service.getSoloPodiumToSort(PODIUM_MOCK);

            const podiumPlace = service.getPodiumPlace(podiumToSort, time);

            expect(podiumPlace).toEqual(INVALID_PODIUM_PLACE);
        });
    });

    it('getSoloPodiumToSort() should return the 3 times of podium.solo', () => {
        const podiumToSort = service.getSoloPodiumToSort(PODIUM_MOCK);
        expect(podiumToSort).toEqual([PODIUM_MOCK.solo.first.time, PODIUM_MOCK.solo.second.time, PODIUM_MOCK.solo.third.time]);
    });

    it('getMultiplayerPodiumToSort() should return the 3 times of podium.multiplayer', () => {
        const podiumToSort = service.getSoloPodiumToSort(PODIUM_MOCK);
        expect(podiumToSort).toEqual([PODIUM_MOCK.multiplayer.first.time, PODIUM_MOCK.multiplayer.second.time, PODIUM_MOCK.multiplayer.third.time]);
    });

    describe('getSoloPodiumUpdated()', () => {
        it('should put it to the first place', () => {
            const podium = { ...PODIUM_MOCK };
            const updatePodiumInformation = { ...UPDATE_PODIUM_INFORMATION };
            const podiumPlace = 1;

            service.getSoloPodiumUpdated(podium, updatePodiumInformation, podiumPlace);

            expect(podium.solo.first).toEqual({ time: updatePodiumInformation.time, name: updatePodiumInformation.username });
        });

        it('should put it to the second place', () => {
            const podium = { ...PODIUM_MOCK };
            const updatePodiumInformation = { ...UPDATE_PODIUM_INFORMATION };
            const podiumPlace = 2;

            service.getSoloPodiumUpdated(podium, updatePodiumInformation, podiumPlace);

            expect(podium.solo.second).toEqual({ time: updatePodiumInformation.time, name: updatePodiumInformation.username });
        });

        it('should put it to the third place', () => {
            const podium = { ...PODIUM_MOCK };
            const updatePodiumInformation = { ...UPDATE_PODIUM_INFORMATION };
            const podiumPlace = 3;

            service.getSoloPodiumUpdated(podium, updatePodiumInformation, podiumPlace);

            expect(podium.solo.third).toEqual({ time: updatePodiumInformation.time, name: updatePodiumInformation.username });
        });
    });

    describe('getMultiplayerPodiumUpdated()', () => {
        it('should put it to the first place', () => {
            const podium = { ...PODIUM_MOCK };
            const updatePodiumInformation = { ...UPDATE_PODIUM_INFORMATION };
            const podiumPlace = 1;

            service.getMultiplayerPodiumUpdated(podium, updatePodiumInformation, podiumPlace);

            expect(podium.multiplayer.first).toEqual({ time: updatePodiumInformation.time, name: updatePodiumInformation.username });
        });

        it('should put it to the second place', () => {
            const podium = { ...PODIUM_MOCK };
            const updatePodiumInformation = { ...UPDATE_PODIUM_INFORMATION };
            const podiumPlace = 2;

            service.getMultiplayerPodiumUpdated(podium, updatePodiumInformation, podiumPlace);

            expect(podium.multiplayer.second).toEqual({ time: updatePodiumInformation.time, name: updatePodiumInformation.username });
        });

        it('should put it to the third place', () => {
            const podium = { ...PODIUM_MOCK };
            const updatePodiumInformation = { ...UPDATE_PODIUM_INFORMATION };
            const podiumPlace = 3;

            service.getMultiplayerPodiumUpdated(podium, updatePodiumInformation, podiumPlace);

            expect(podium.multiplayer.third).toEqual({ time: updatePodiumInformation.time, name: updatePodiumInformation.username });
        });
    });
});
