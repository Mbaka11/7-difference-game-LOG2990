import { Component, OnDestroy } from '@angular/core';
import { TimerService } from '@app/services/timer.service';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnDestroy {
    constructor(public timerService: TimerService) {
        timerService.onGetTimer();
    }

    ngOnDestroy(): void {
        this.timerService.resetTimer();
    }
}
