/* eslint-disable */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { CommunicationService } from './communication.service';
import { GamecardService } from './gamecard.service';

describe('GamecardService', () => {
    let service: GamecardService;
    let socketTestHelper: SocketTestHelper;
    let comService: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CommunicationService, HttpClient, HttpHandler],
        });
        socketTestHelper = new SocketTestHelper() as any;
        comService = new CommunicationService(HttpClient as any);
        service = new GamecardService({ socket: socketTestHelper } as any, comService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call next when the deleteCard event is emitted', () => {
        spyOn(service.cardDeleted, 'next');
        socketTestHelper.peerSideEmit('deleteCard');
        expect(service.cardDeleted.next).toHaveBeenCalled();
    });

    it('should call comService.resetAllPodiums()', () => {
        spyOn(comService, 'resetAllPodiums');
        service.resetAllPodiums();
        expect(comService.resetAllPodiums).toHaveBeenCalled();
    });

    it('should call comService.deleteAllGames()', () => {
        spyOn(comService, 'deleteAllGames');
        service.deleteAllGames();
        expect(comService.deleteAllGames).toHaveBeenCalled();
    });
});
