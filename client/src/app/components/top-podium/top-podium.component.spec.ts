import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Podium } from '@app/interfaces/podium';
import { CommunicationService } from '@app/services/communication.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { of } from 'rxjs';

import { TopPodiumComponent } from './top-podium.component';

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

const PODIUM_MOCK_2: Podium = {
    gameId: 23534,
    solo: {
        first: { time: 15, name: 'P1' },
        second: { time: 25, name: 'P2' },
        third: { time: 35, name: 'P3' },
    },
    multiplayer: {
        first: { time: 15, name: 'P4' },
        second: { time: 25, name: 'P5' },
        third: { time: 35, name: 'P6' },
    },
};

const INVALID_PODIUM_MOCK: Podium = {
    gameId: 5239875328742,
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

describe('TopPodiumComponent', () => {
    let component: TopPodiumComponent;
    let fixture: ComponentFixture<TopPodiumComponent>;
    let communicationServiceSpy: CommunicationService;
    let socketClientServiceSpy: SocketClientService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationService, SocketClientService],
            declarations: [TopPodiumComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TopPodiumComponent);
        communicationServiceSpy = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        socketClientServiceSpy = TestBed.inject(SocketClientService) as jasmine.SpyObj<SocketClientService>;
        spyOn(communicationServiceSpy, 'getPodiumById').and.returnValue(of(PODIUM_MOCK));
        spyOn(socketClientServiceSpy.socket, 'on').and.stub();
        component = fixture.componentInstance;

        spyOn(component, 'ngOnInit');
        component.gameId = PODIUM_MOCK.gameId;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call the init functions', () => {
            expect(communicationServiceSpy.getPodiumById).toHaveBeenCalledOnceWith(PODIUM_MOCK.gameId);
            expect(component.podium).toEqual(PODIUM_MOCK);
            expect(socketClientServiceSpy.socket.on).toHaveBeenCalledOnceWith('BroadcastPodium', component.callbackOnBroadcastPodium);
        });
    });

    describe('callbackOnBroadcastPodium', () => {
        it('should set podium given to this.podium', () => {
            component.callbackOnBroadcastPodium(PODIUM_MOCK_2);

            expect(component.podium).toEqual(PODIUM_MOCK_2);
        });

        it('should set podium given to this.podium', () => {
            component.callbackOnBroadcastPodium(INVALID_PODIUM_MOCK);

            expect(component.podium).toEqual(PODIUM_MOCK);
        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe from the getPodiumByIdSubscription', () => {
            spyOn(component.getPodiumByIdSubscription, 'unsubscribe');
            component.onDestroy();
            expect(component.getPodiumByIdSubscription.unsubscribe).toHaveBeenCalledOnceWith();
        });
    });
});
