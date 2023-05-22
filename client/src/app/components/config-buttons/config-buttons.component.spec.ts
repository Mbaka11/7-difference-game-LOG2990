import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GamecardService } from '@app/services/gamecard.service';
import { of } from 'rxjs';
import { ConfigButtonsComponent } from './config-buttons.component';

describe('ConfigButtonsComponent', () => {
    let component: ConfigButtonsComponent;
    let fixture: ComponentFixture<ConfigButtonsComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let gameCardServiceSpy: GamecardService;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            imports: [MatDialogModule, MatTooltipModule, NoopAnimationsModule, HttpClientModule],
            declarations: [ConfigButtonsComponent],
            providers: [GamecardService, { provide: MatDialog, useValue: spy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigButtonsComponent);
        dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        gameCardServiceSpy = TestBed.inject(GamecardService) as jasmine.SpyObj<GamecardService>;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open time settings', () => {
        component.openTimeSettings();
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should open history', () => {
        component.openHistory();
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    describe('deleteAllPodiums', () => {
        it('should call gameCardService.deleteAllPodiums after the dialog is closed', () => {
            const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefSpy.afterClosed.and.returnValue(of({ event: 'confirm' }));
            dialogSpy.open.and.returnValue(dialogRefSpy);

            spyOn(gameCardServiceSpy, 'resetAllPodiums').and.stub();

            component.deleteAllPodiums();

            expect(dialogSpy.open).toHaveBeenCalled();
            expect(gameCardServiceSpy.resetAllPodiums).toHaveBeenCalled();
        });

        it('should not call gameCardService.deleteAllPodiums after the dialog is closed', () => {
            const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefSpy.afterClosed.and.returnValue(of({ event: 'canceled' }));
            dialogSpy.open.and.returnValue(dialogRefSpy);

            spyOn(gameCardServiceSpy, 'resetAllPodiums').and.stub();

            component.deleteAllPodiums();

            expect(dialogSpy.open).toHaveBeenCalled();
            expect(gameCardServiceSpy.resetAllPodiums).not.toHaveBeenCalled();
        });
    });

    describe('deleteAllPodiums', () => {
        it('should call gameCardService.deleteAllGames after the dialog is closed', () => {
            const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefSpy.afterClosed.and.returnValue(of({ event: 'confirm' }));
            dialogSpy.open.and.returnValue(dialogRefSpy);

            spyOn(gameCardServiceSpy, 'deleteAllGames').and.stub();

            component.deleteAllGames();

            expect(dialogSpy.open).toHaveBeenCalled();
            expect(gameCardServiceSpy.deleteAllGames).toHaveBeenCalled();
        });

        it('should not call gameCardService.deleteAllGames after the dialog is closed', () => {
            const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
            dialogRefSpy.afterClosed.and.returnValue(of({ event: 'canceled' }));
            dialogSpy.open.and.returnValue(dialogRefSpy);

            spyOn(gameCardServiceSpy, 'deleteAllGames').and.stub();

            component.deleteAllGames();

            expect(dialogSpy.open).toHaveBeenCalled();
            expect(gameCardServiceSpy.deleteAllGames).not.toHaveBeenCalled();
        });
    });
});
