import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-stepper-constants',
    templateUrl: './stepper-constants.component.html',
    styleUrls: ['./stepper-constants.component.scss', '../../../styles.scss'],
})
export class StepperConstantsComponent {
    @Input() time: number;
    @Input() step: number;
    @Input() maxValue: number;
    @Output() timeChange = new EventEmitter<number>();
    hasChanged: boolean = false;

    addTime(): void {
        this.time += this.step;
        this.timeChange.emit(this.time);
        this.hasChanged = true;
    }

    removeTime(): void {
        if (!this.isMin()) {
            this.time -= this.step;
            this.timeChange.emit(this.time);
            this.hasChanged = true;
        }
    }

    isMin(): boolean {
        return this.time <= 0;
    }

    isMax(): boolean {
        return this.time >= this.maxValue;
    }
}
