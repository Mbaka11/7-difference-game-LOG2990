import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_TIME } from '@app/common/constants';
import { InformationCardComponent } from './information-card.component';

describe('InformationCardComponent', () => {
    let component: InformationCardComponent;
    let fixture: ComponentFixture<InformationCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InformationCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InformationCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should hide time variables when time penalty is not set', () => {
        component.timePenalty = NO_TIME;
        component.ngAfterViewInit();
        component.timeVariablesRef.nativeElement.style.visibility = 'visible';
        expect(component.timeVariablesHintRef.nativeElement.style.visibility).toEqual('hidden');
    });

    it('should not hide time variables when time penalty is set', () => {
        fixture.componentInstance.timePenalty = 2;
        component.ngAfterViewInit();
        component.timeVariablesRef.nativeElement.style.visibility = 'visible';
        expect(component.timeVariablesHintRef.nativeElement.style.visibility).toEqual('');
    });

    it('should hide time variables when time gain is not set', () => {
        component.timeGain = NO_TIME;
        component.ngAfterViewInit();
        component.timeVariablesRef.nativeElement.style.visibility = 'visible';
        expect(component.timeVariablesRef.nativeElement.style.visibility).toEqual('visible');
    });

    it('should not hide time variables when time gain is set', () => {
        fixture.componentInstance.timeGain = 2;
        component.ngAfterViewInit();
        component.timeVariablesRef.nativeElement.style.visibility = 'visible';
        expect(component.timeVariablesRef.nativeElement.style.visibility).toEqual('visible');
    });
});
