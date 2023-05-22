import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let fakeMatDialog: MatDialog;

    beforeEach(async () => {
        fakeMatDialog = { open: jasmine.createSpy() } as unknown as MatDialog;
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [{ provide: MatDialog, useValue: fakeMatDialog }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openDialog should call MatDialog.open()', () => {
        component.openDialog();
        expect(fakeMatDialog.open).toHaveBeenCalled();
    });
});
