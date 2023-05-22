import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/common/constants';
import { Coordinate } from '@common/coordinate';
import { ThirdHintComponent } from './third-hint.component';
describe('ThirdHintComponent', () => {
    let component: ThirdHintComponent;
    let fixture: ComponentFixture<ThirdHintComponent>;
    let mockDialogData: { data: { difference: Coordinate[] } };
    let ctxStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        mockDialogData = { data: { difference: [{ row: 1, col: 1 }] } };
        await TestBed.configureTestingModule({
            declarations: [ThirdHintComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
        }).compileComponents();
        ctxStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;

        fixture = TestBed.createComponent(ThirdHintComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('drawThirdHint should call drawDifferenceToBlankCanvas', () => {
        const drawDifferenceToBlankCanvasSpy = spyOn(component.draw, 'drawDifferenceToBlankCanvas').and.stub();
        component.drawThirdHint(mockDialogData.data.difference, ctxStub);
        expect(drawDifferenceToBlankCanvasSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call drawThirdHint if difference if defined', () => {
        component.data.difference = [{ row: 1, col: 1 }];
        const drawThirdHintSpy = spyOn(component, 'drawThirdHint').and.stub();
        component.ngAfterViewInit();
        expect(drawThirdHintSpy).toHaveBeenCalled();
    });
});
