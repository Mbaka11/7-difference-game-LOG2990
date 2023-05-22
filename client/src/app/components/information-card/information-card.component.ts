import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NO_TIME } from '@app/common/constants';

@Component({
    selector: 'app-information-card',
    templateUrl: './information-card.component.html',
    styleUrls: ['./information-card.component.scss', '../../../styles.scss'],
})
export class InformationCardComponent implements AfterViewInit {
    @ViewChild('timeVariables') timeVariablesRef: ElementRef<HTMLDivElement>;
    @ViewChild('timeVariablesHint') timeVariablesHintRef: ElementRef<HTMLDivElement>;
    @Input() title: string | null;
    @Input() mode: string;
    @Input() difficulty: string | null;
    @Input() nbrDifferences: number;

    @Input() timePenalty: number;
    @Input() timeGain: number;

    ngAfterViewInit(): void {
        if (this.timePenalty === NO_TIME) this.timeVariablesHintRef.nativeElement.style.visibility = 'hidden';
        if (this.timeGain === NO_TIME) this.timeVariablesRef.nativeElement.style.visibility = 'hidden';
    }
}
