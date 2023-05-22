import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReplayDialogMessageComponent } from './replay-dialog-message.component';

describe('ReplayDialogMessageComponent', () => {
    let component: ReplayDialogMessageComponent;
    let fixture: ComponentFixture<ReplayDialogMessageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<ReplayDialogMessageComponent>>;

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [ReplayDialogMessageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: { message: 'test message' } },
            ],
            imports: [MatDialogModule, RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayDialogMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onConfirm should close dialog and navigate to home', () => {
        routerSpy.navigate.and.stub();
        mockDialogRef.close.and.stub();

        component.onConfirm();

        expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'confirm' });
        expect(routerSpy.navigate).toHaveBeenCalledWith(['home']);
    });

    it('onClickReplay should close with event replay', () => {
        mockDialogRef.close.and.stub();

        component.onClickReplay();

        expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'replay' });
    });
});
