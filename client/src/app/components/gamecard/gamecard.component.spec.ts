import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GamecardService } from '@app/services/gamecard.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import { GameInformation } from '@common/game-information';
import { of } from 'rxjs';
import { GamecardComponent } from './gamecard.component';

describe('GamecardComponent', () => {
    let component: GamecardComponent;
    let fixture: ComponentFixture<GamecardComponent>;
    let dialog: MatDialog;
    let waitingRoomService: WaitingRoomService;
    let comService: CommunicationService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamecardComponent],
            imports: [MatPaginatorModule, MatDialogModule, NoopAnimationsModule, RouterTestingModule],
            providers: [GamecardService, HttpClient, HttpHandler, MatDialog, FormBuilder, CommunicationService],
        }).compileComponents();
        fixture = TestBed.createComponent(GamecardComponent);
        dialog = TestBed.inject(MatDialog);
        comService = TestBed.inject(CommunicationService);
        waitingRoomService = TestBed.inject(WaitingRoomService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a paginator', () => {
        expect(component.paginator).toBeTruthy();
    });

    it('should set the startIndex', () => {
        expect(component.startIndex).toBe(0);
    });

    it('should set the startIndex', () => {
        const event = {
            pageIndex: 1,
            pageSize: 4,
            length: 7,
        } as PageEvent;
        component.onPageEvent(event);
        expect(component.startIndex).toBe(event.pageSize);
    });

    it('should subscribe to the paginator page event', () => {
        spyOn(component.paginator.page, 'subscribe');
        component.ngAfterViewInit();
        expect(component.paginator.page.subscribe).toHaveBeenCalled();
    });

    it('should update the pageEventVariable and call onPageEvent when the paginator emits a page event', () => {
        spyOn(component, 'onPageEvent');
        component.ngAfterViewInit();
        const pageEvent = {
            pageIndex: 1,
            pageSize: 4,
            length: 7,
        };
        component.paginator.page.emit(pageEvent);
        expect(component.pageEventVariable).toEqual(pageEvent);
        expect(component.onPageEvent).toHaveBeenCalledWith(pageEvent);
    });

    it('should return the correct color for the difficulty', () => {
        expect(component.getColor('facile')).toBe('green');
        expect(component.getColor('difficile')).toBe('red');
        expect(component.getColor('')).toBe('black');
    });

    it('should call openPlayerNameDialog if buttonName1 is "Jouer"', () => {
        const card: GameInformation = { gameId: 1, gameName: 'test1', gameDifficulty: 'test1', numberOfDiff: 2 };
        component.buttonName1 = 'Jouer';
        component.openPlayerNameDialog = jasmine.createSpy();
        component.useLeftButton(card, component.buttonName1);
        expect(component.openPlayerNameDialog).toHaveBeenCalledWith(card, '/gamesolo');
    });

    it('should call openPlayerNameDialog if buttonName1 is "Créer"', () => {
        const card: GameInformation = { gameId: 1, gameName: 'test1', gameDifficulty: 'test1', numberOfDiff: 2 };
        component.buttonName1 = 'Créer';
        component.openPlayerNameDialog = jasmine.createSpy();
        component.useLeftButton(card, component.buttonName1);
        expect(component.openPlayerNameDialog).toHaveBeenCalledWith(card, '/waiting-room');
    });

    it('should call openPlayerNameDialog if buttonName1 is "Joindre"', () => {
        const card: GameInformation = { gameId: 1, gameName: 'test1', gameDifficulty: 'test1', numberOfDiff: 2 };
        component.buttonName1 = 'Joindre';
        component.openPlayerNameDialog = jasmine.createSpy();
        component.useLeftButton(card, component.buttonName1);
        expect(component.openPlayerNameDialog).toHaveBeenCalledWith(card, '/waiting-room');
    });

    it('should call commService.deleteReal and getCardInfo if buttonName1 is "Supprimer"', () => {
        const card: GameInformation = { gameId: 3, gameName: 'test2', gameDifficulty: 'test2', numberOfDiff: 4 };
        const buttonName = 'Supprimer';
        const confirmationSpy = spyOn(component, 'confirmation').and.stub();
        component.useLeftButton(card, buttonName);
        expect(confirmationSpy).toHaveBeenCalledWith(card);
    });

    it('should call openPlayerNameDialog with the correct URL if buttonName is "Joindre"', () => {
        const card: GameInformation = { gameId: 1, gameName: 'test1', gameDifficulty: 'test1', numberOfDiff: 2 };
        const buttonName2 = 'Joindre';
        spyOn(component, 'openPlayerNameDialog');
        component.useLeftButton(card, buttonName2);
        expect(component.openPlayerNameDialog).toHaveBeenCalledWith(card, '/waiting-room');
    });

    it('should call openPlayerNameDialog with the correct URL if buttonName is "Créer"', () => {
        const card: GameInformation = { gameId: 1, gameName: 'test1', gameDifficulty: 'test1', numberOfDiff: 2 };
        const buttonName = 'Créer';
        spyOn(component, 'openPlayerNameDialog');
        component.useLeftButton(card, buttonName);
        expect(component.openPlayerNameDialog).toHaveBeenCalledWith(card, '/waiting-room');
    });

    it('should open the player name dialog with the correct data', () => {
        const gameInfo: GameInformation = {
            gameId: 5,
            gameName: 'MyGame',
            gameDifficulty: 'facile',
            numberOfDiff: 6,
        };
        const routeAfterDialog = '/gamesolo';
        spyOn(dialog, 'open').and.callThrough();
        component.openPlayerNameDialog(gameInfo, routeAfterDialog);
        expect(dialog.open).toHaveBeenCalledWith(PlayerNameDialogComponent, {
            data: {
                gameId: gameInfo.gameId,
                route: routeAfterDialog,
            },
        });
    });

    it('should set the imageURLs and cards properties', () => {
        const fakeData = {
            data: ['url1', 'url2'],
            games: [
                { gameId: 5, gameName: 'MyGame', gameDifficulty: 'facile', numberOfDiff: 6 },
                { gameId: 3, gameName: 'test2', gameDifficulty: 'difficile', numberOfDiff: 4 },
            ],
        };
        spyOn(component.commService, 'imageGetAllURLs').and.returnValue(of(fakeData));

        component.getCardInfo();

        expect(component.imageURLs).toEqual(fakeData.data);
        expect(component.cards).toEqual(fakeData.games);
    });

    it('should call imageGetAllURLs on the commService', () => {
        const fakeData = {
            data: ['url1', 'url2'],
            games: [
                { gameId: 5, gameName: 'MyGame', gameDifficulty: 'facile', numberOfDiff: 6 },
                { gameId: 3, gameName: 'test2', gameDifficulty: 'difficile', numberOfDiff: 4 },
            ],
        };

        spyOn(component.commService, 'imageGetAllURLs').and.returnValue(of(fakeData));

        component.getCardInfo();

        expect(component.commService.imageGetAllURLs).toHaveBeenCalled();
    });

    it('should return "Joindre" if the room is created', () => {
        const card: GameInformation = { gameId: 3, gameName: 'test2', gameDifficulty: 'difficile', numberOfDiff: 4 };
        spyOn(waitingRoomService, 'isRoomCreated').and.returnValue(true);
        expect(component.getButtonName2(card)).toBe('Joindre');
    });

    it('should return "Créer" if the room is created', () => {
        const card: GameInformation = { gameId: 3, gameName: 'test2', gameDifficulty: 'difficile', numberOfDiff: 4 };
        spyOn(waitingRoomService, 'isRoomCreated').and.returnValue(false);
        expect(component.getButtonName2(card)).toBe('Créer');
    });

    it('should call openPlayerNameDialog if buttonName2 is "Créer" or "Joindre"', () => {
        const card: GameInformation = { gameId: 1, gameName: 'test1', gameDifficulty: 'test1', numberOfDiff: 2 };
        component.buttonName2 = 'Créer';
        component.openPlayerNameDialog = jasmine.createSpy();
        component.useLeftButton(card, component.buttonName2);
        expect(component.openPlayerNameDialog).toHaveBeenCalledWith(card, '/waiting-room');
    });

    it('should confirm on supression', () => {
        const openSpy = spyOn(component.dialog, 'open').and.returnValue({
            afterClosed: () => of({ event: 'confirm' }),
        } as MatDialogRef<typeof component>);
        spyOn(component.commService, 'deleteReal').and.returnValue(of());
        const gameInformation = { gameId: 1, gameDifficulty: 'easy', gameName: 'name', numberOfDiff: 5 };
        component.confirmation(gameInformation);
        expect(openSpy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to multiplayer and call loseGame', () => {
        const cardInfoSpy = spyOn(component, 'getCardInfo').and.stub();
        component.ngOnInit();
        fixture.detectChanges();
        component.gamecardService.cardDeleted.next('nest');
        expect(cardInfoSpy).toHaveBeenCalled();
    });

    describe('deletePodium', () => {
        it('should call gameCardService.resetPodium after the dialog is closed ', () => {
            const gameId = 1;

            const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefSpy.afterClosed.and.returnValue(of({ event: 'confirm' }));
            spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

            spyOn(comService, 'resetPodium').and.stub();

            component.deletePodium(gameId);

            expect(dialog.open).toHaveBeenCalled();
            expect(comService.resetPodium).toHaveBeenCalledOnceWith(gameId);
        });

        it('should not call gameCardService.resetPodium after the dialog is closed ', () => {
            const gameId = 1;

            const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefSpy.afterClosed.and.returnValue(of({ event: 'canceled' }));
            spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

            spyOn(comService, 'resetPodium').and.stub();

            component.deletePodium(gameId);

            expect(dialog.open).toHaveBeenCalled();
            expect(comService.resetPodium).not.toHaveBeenCalledOnceWith(gameId);
        });
    });

    it('getCardInfo should set isEmpty to true if there are no games', () => {
        const fakeData = {
            data: ['url1', 'url2'],
            games: [],
        };
        spyOn(component.commService, 'imageGetAllURLs').and.returnValue(of(fakeData));

        component.getCardInfo();

        expect(component.isEmpty).toBeTrue();
    });
});
