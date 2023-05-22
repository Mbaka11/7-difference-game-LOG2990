import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaintOptions } from '@app/common/constants';
import { PaintComponent } from './paint.component';

describe('PaintComponent', () => {
    let component: PaintComponent;
    let fixture: ComponentFixture<PaintComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaintComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PaintComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('colorChangeClick should set the current color and emit changeColor', () => {
        component.currentColor = 'green';
        const changeColorSpy = spyOn(component.changeColor, 'emit').and.stub();
        component.colorChangeClick('red');
        expect(changeColorSpy).toHaveBeenCalledOnceWith('red');
        expect(component.currentColor).toEqual('red');
    });

    it('selectPencil should set the button colors, change selectedOption and emit changeSelectedOption', () => {
        component.pencilBackground = '#000000';
        component.rectangleBackground = '#000000';
        component.eraserBackground = '#000000';
        const changeSelectedOptionSpy = spyOn(component.changeSelectedOption, 'emit').and.stub();
        component.selectPencil();
        expect(component.pencilBackground).toEqual('#f29b18');
        expect(component.rectangleBackground).toEqual('#ffffff');
        expect(component.eraserBackground).toEqual('#ffffff');
        expect(component.selectedOption).toEqual(PaintOptions.Pencil);
        expect(changeSelectedOptionSpy).toHaveBeenCalledWith(PaintOptions.Pencil);
    });

    it('selectRectangle should set the button colors, change selectedOption and emit changeSelectedOption', () => {
        component.pencilBackground = '#000000';
        component.rectangleBackground = '#000000';
        component.eraserBackground = '#000000';
        const changeSelectedOptionSpy = spyOn(component.changeSelectedOption, 'emit').and.stub();
        component.selectRectangle();
        expect(component.pencilBackground).toEqual('#ffffff');
        expect(component.rectangleBackground).toEqual('#f29b18');
        expect(component.eraserBackground).toEqual('#ffffff');
        expect(component.selectedOption).toEqual(PaintOptions.Rectangle);
        expect(changeSelectedOptionSpy).toHaveBeenCalledWith(PaintOptions.Rectangle);
    });

    it('selectEraser should set the button colors, change selectedOption and emit changeSelectedOption', () => {
        component.pencilBackground = '#000000';
        component.rectangleBackground = '#000000';
        component.eraserBackground = '#000000';
        const changeSelectedOptionSpy = spyOn(component.changeSelectedOption, 'emit').and.stub();
        component.selectEraser();
        expect(component.pencilBackground).toEqual('#ffffff');
        expect(component.rectangleBackground).toEqual('#ffffff');
        expect(component.eraserBackground).toEqual('#f29b18');
        expect(component.selectedOption).toEqual(PaintOptions.Eraser);
        expect(changeSelectedOptionSpy).toHaveBeenCalledWith(PaintOptions.Eraser);
    });
});
