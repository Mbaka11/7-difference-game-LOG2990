import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameMultiplayerPageComponent } from './game-multiplayer-page.component';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('GameMultiplayerPageComponent', () => {
    let component: GameMultiplayerPageComponent;
    let fixture: ComponentFixture<GameMultiplayerPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameMultiplayerPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameMultiplayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
