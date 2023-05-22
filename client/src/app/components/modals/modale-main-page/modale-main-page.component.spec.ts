import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ModaleMainPageComponent } from './modale-main-page.component';

describe('ModaleMainPageComponent', () => {
    let component: ModaleMainPageComponent;
    let fixture: ComponentFixture<ModaleMainPageComponent>;
    let fakeMatDialog: MatDialog;
    let router: Router;

    beforeEach(async () => {
        fakeMatDialog = { open: jasmine.createSpy() } as unknown as MatDialog;

        await TestBed.configureTestingModule({
            declarations: [ModaleMainPageComponent],
            imports: [ReactiveFormsModule, RouterTestingModule],
            providers: [{ provide: MatDialog, useValue: fakeMatDialog }],
        }).compileComponents();

        fixture = TestBed.createComponent(ModaleMainPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('changePage should navigate to the correct route with the correct query params', () => {
        spyOn(router, 'navigate');

        const username = 'testuser';

        component.form.setValue({ username });

        component.changePage();

        expect(router.navigate).toHaveBeenCalledWith(['/time-gamesolo'], {
            queryParams: {
                gameId: 0,
                username,
                roomGameName: `timeSingleplayer-gameId-0-group-${component.socket.socket.id}`,
                userType: 'creator',
            },
        });
    });

    it('changePageMultiplayer should navigate to the correct route with the correct query params for multiplayer', () => {
        spyOn(router, 'navigate');

        const username = 'testuser';
        component.form.setValue({ username });

        component.changePageMultiplayer();
        expect(router.navigate).toHaveBeenCalledWith(['/waiting-room'], {
            queryParams: {
                gameId: 0,
                username,
                roomGameName: `timeMultiplayer-gameId-0-group-${component.socket.socket.id}`,
                gameType: 'time',
            },
        });
    });

    it('should validate that username is alphanumeric', () => {
        const control = component.form.controls['username'];
        control.setValue('testuser');
        expect(control.valid).toBeTruthy();
        control.setValue('test_user');
        expect(control.hasError('alphanumeric')).toBeTruthy();
    });

    it('should update username when onUsernameChange is called', () => {
        component.onUsernameChange('testuser');
        expect(component.username).toBe('testuser');
    });

    it('should set this.username to undefined if username.value does not exist in form', () => {
        spyOn(component['router'], 'navigate');
        spyOn(component.form, 'get');
        component.changePage();
        expect(component.username).toBeUndefined();
    });

    it('should set this.username to undefined if username.value does not exist in form', () => {
        spyOn(component['router'], 'navigate');
        spyOn(component.form, 'get');
        component.changePageMultiplayer();
        expect(component.username).toBeUndefined();
    });
});
