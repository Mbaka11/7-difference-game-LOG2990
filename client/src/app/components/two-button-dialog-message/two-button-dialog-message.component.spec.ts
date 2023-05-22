import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TwoButtonDialogMessageComponent } from './two-button-dialog-message.component';

describe('TwoButtonDialogMessageComponent', () => {
    let component: TwoButtonDialogMessageComponent;
    let fixture: ComponentFixture<TwoButtonDialogMessageComponent>;
    let mockDialogRef: MatDialogRef<TwoButtonDialogMessageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj(['close']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [TwoButtonDialogMessageComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: { message: 'test message' } },
            ],
            imports: [RouterTestingModule],
        }).compileComponents();
        fixture = TestBed.createComponent(TwoButtonDialogMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a message', () => {
        expect(component.message).toEqual('test message');
    });

    it('should close the dialog with "confirm" event when onConfirm() is called', () => {
        component.isGoingToReturn = true;
        component.onConfirm();
        expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'confirm' });
    });

    it('should close the dialog with "cancel" event when onCancel() is called', () => {
        component.onCancel();
        expect(mockDialogRef.close).toHaveBeenCalledWith({ event: 'cancel' });
    });
});
