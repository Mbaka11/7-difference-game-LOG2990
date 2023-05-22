import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSoloPageComponent } from './game-solo-page.component';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('GameSoloPageComponent', () => {
    let component: GameSoloPageComponent;
    let fixture: ComponentFixture<GameSoloPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSoloPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSoloPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
