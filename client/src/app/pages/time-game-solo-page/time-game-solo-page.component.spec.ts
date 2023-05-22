import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeGameSoloPageComponent } from './time-game-solo-page.component';

/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('GameSoloPageComponent', () => {
    let component: TimeGameSoloPageComponent;
    let fixture: ComponentFixture<TimeGameSoloPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeGameSoloPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimeGameSoloPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
