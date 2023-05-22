import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PaintOptions } from '@app/common/constants';
import { STROKE_WIDTH_OPTIONS } from '@app/constants/creation-page';

const INITIAL_COLOR = 'red';
@Component({
    selector: 'app-paint',
    templateUrl: './paint.component.html',
    styleUrls: ['./paint.component.scss', '../../../styles.scss'],
})
export class PaintComponent implements OnInit {
    @Output() changeColor = new EventEmitter<string>();
    @Output() changeStrokeWidth = new EventEmitter<number>();
    @Output() changeSelectedOption = new EventEmitter<PaintOptions>();
    pencilBackground: string = '#ffffff';
    rectangleBackground: string = '#ffffff';
    eraserBackground: string = '#ffffff';
    currentColor: string = INITIAL_COLOR;
    allColors: string[] = ['red', 'orange', 'yellow', 'brown', 'pink', 'purple', 'blue', 'green', 'white', 'black'];
    strokeWidthOptions = STROKE_WIDTH_OPTIONS;
    strokeWidth: number;
    selectedOption: PaintOptions = PaintOptions.Pencil;

    ngOnInit() {
        this.strokeWidth = 1;
        this.selectPencil();
    }

    colorChangeClick(color: string) {
        this.currentColor = color;
        this.changeColor.emit(color);
    }

    selectPencil() {
        this.pencilBackground = '#f29b18';
        this.rectangleBackground = '#ffffff';
        this.eraserBackground = '#ffffff';
        this.selectedOption = PaintOptions.Pencil;
        this.changeSelectedOption.emit(PaintOptions.Pencil);
    }

    selectRectangle() {
        this.pencilBackground = '#ffffff';
        this.rectangleBackground = '#f29b18';
        this.eraserBackground = '#ffffff';
        this.selectedOption = PaintOptions.Rectangle;
        this.changeSelectedOption.emit(PaintOptions.Rectangle);
    }

    selectEraser() {
        this.pencilBackground = '#ffffff';
        this.rectangleBackground = '#ffffff';
        this.eraserBackground = '#f29b18';
        this.selectedOption = PaintOptions.Eraser;
        this.changeSelectedOption.emit(PaintOptions.Eraser);
    }
}
