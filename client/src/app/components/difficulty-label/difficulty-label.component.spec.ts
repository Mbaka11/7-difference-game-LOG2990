import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifficultyLabelComponent } from './difficulty-label.component';

describe('DifficultyLabelComponent', () => {
    let component: DifficultyLabelComponent;
    let fixture: ComponentFixture<DifficultyLabelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DifficultyLabelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DifficultyLabelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
