import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerNameDialogComponent } from './player-name-dialog.component';

describe('PlayerNameDialogComponent', () => {
    let component: PlayerNameDialogComponent;
    let fixture: ComponentFixture<PlayerNameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, ReactiveFormsModule],
            declarations: [PlayerNameDialogComponent],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { gameId: 1, route: '/gamesolo' },
                },
                FormBuilder,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerNameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /gamesolo when changePage is called', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component.form.controls['username'].setValue('testUser');
        component.changePage();
        expect(routerSpy).toHaveBeenCalledWith(['/gamesolo'], {
            queryParams: {
                gameId: component.gameId,
                username: component.username,
                roomGameName: 'singleplayer-gameId-group-undefined',
                gameType: 'classic',
            },
        });
        expect(component.username).toBe('testUser');
    });

    it('should set this.username to undefined if username.value does not exist in form', () => {
        spyOn(component['router'], 'navigate');
        spyOn(component.form, 'get');
        component.changePage();
        expect(component.username).toBeUndefined();
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
});
