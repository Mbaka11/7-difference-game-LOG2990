import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer.service';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerService: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimerComponent],
        }).compileComponents();

        timerService = TestBed.inject(TimerService);
        spyOn(timerService, 'onGetTimer');
        spyOn(timerService, 'resetTimer');

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    describe('constructor()', () => {
        it('should call timerService.onGetTimer()', () => {
            expect(component.timerService.onGetTimer).toHaveBeenCalledOnceWith();
        });
    });

    describe('ngOnDestroy()', () => {
        it('should call timerService.resetTimer()', () => {
            component.ngOnDestroy();
            expect(timerService.resetTimer).toHaveBeenCalledOnceWith();
        });
    });
});
