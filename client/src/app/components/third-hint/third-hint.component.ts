import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawService } from '@app/services/draw.service';
import { Coordinate } from '@common/coordinate';

@Component({
    selector: 'app-third-hint',
    templateUrl: './third-hint.component.html',
    styleUrls: ['./third-hint.component.scss'],
})
export class ThirdHintComponent implements AfterViewInit {
    @ViewChild('canvas3') canvas3: ElementRef<HTMLCanvasElement>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { difference: Coordinate[] }, public draw: DrawService) {}

    ngAfterViewInit(): void {
        const ctx3 = this.canvas3.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        if (this.data.difference) this.drawThirdHint(this.data.difference, ctx3);
    }

    drawThirdHint(difference: Coordinate[], ctx: CanvasRenderingContext2D) {
        this.draw.drawDifferenceToBlankCanvas(difference, ctx);
    }
}
