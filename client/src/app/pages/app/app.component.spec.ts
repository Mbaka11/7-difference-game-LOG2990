import { TestBed } from '@angular/core/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MatDialog } from '@angular/material/dialog';

let fakeMatDialog: MatDialog;

describe('AppComponent', () => {
    fakeMatDialog = { open: jasmine.createSpy() } as unknown as MatDialog;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule],
            declarations: [AppComponent],
            providers: [{ provide: MatDialog, useValue: fakeMatDialog }],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
