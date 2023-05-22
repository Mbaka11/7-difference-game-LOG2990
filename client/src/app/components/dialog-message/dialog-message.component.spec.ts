import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogMessageComponent } from './dialog-message.component';

describe('dialogMessageComponent', () => {
    let component: DialogMessageComponent;
    let fixture: ComponentFixture<DialogMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogMessageComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DialogMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
