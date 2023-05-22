import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperConstantsComponent } from './stepper-constants.component';

describe('StepperConstantsComponent', () => {
    let component: StepperConstantsComponent;
    let fixture: ComponentFixture<StepperConstantsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StepperConstantsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StepperConstantsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add time', () => {
        component.time = 0;
        component.step = 1;
        component.addTime();
        expect(component.time).toBe(1);
    });

    it('should remove time', () => {
        component.time = 1;
        component.step = 1;
        component.removeTime();
        expect(component.time).toBe(0);
    });

    it('should not remove time', () => {
        component.time = 0;
        component.step = 1;
        component.removeTime();
        expect(component.time).toBe(0);
    });

    it('should be min', () => {
        component.time = 0;
        expect(component.isMin()).toBeTruthy();
    });

    it('should not be min', () => {
        component.time = 1;
        expect(component.isMin()).toBeFalsy();
    });

    it('should emit time change', () => {
        spyOn(component.timeChange, 'emit');
        component.time = 1;
        component.step = 1;
        component.addTime();
        expect(component.timeChange.emit).toHaveBeenCalledWith(2);
    });
});
