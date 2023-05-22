import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameConstantsComponent } from './game-constants.component';

describe('GameConstantsComponent', () => {
    let component: GameConstantsComponent;
    let fixture: ComponentFixture<GameConstantsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameConstantsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameConstantsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should save time settings', () => {
        component.gameTimeConstants.gameTime = 1;
        component.gameTimeConstants.successTime = 2;
        component.gameTimeConstants.penaltyTime = 3;
        component.onclickSaveTimeConstants();
        expect(localStorage.getItem('gameTime')).toBe('1');
        expect(localStorage.getItem('successTime')).toBe('2');
        expect(localStorage.getItem('penaltyTime')).toBe('3');
    });

    it('should reset time settings', () => {
        component.gameTimeConstants.gameTime = 1;
        component.gameTimeConstants.successTime = 2;
        component.gameTimeConstants.penaltyTime = 3;
        component.onClickResetTimeConstants();
        expect(component.isDefaultTimeSettings()).toBeTruthy();
    });
});
