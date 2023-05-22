import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectGamePageComponent } from './select-game-page.component';

describe('SelectGamePageComponent', () => {
    let component: SelectGamePageComponent;
    let fixture: ComponentFixture<SelectGamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectGamePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
