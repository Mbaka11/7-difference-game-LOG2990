import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeGameMultiplayerPageComponent } from './time-game-multiplayer-page.component';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('GameMultiplayerPageComponent', () => {
    let component: TimeGameMultiplayerPageComponent;
    let fixture: ComponentFixture<TimeGameMultiplayerPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeGameMultiplayerPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimeGameMultiplayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
