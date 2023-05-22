/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CanvasComponent } from '@app/components/canvas/canvas.component';
import { CommunicationService } from '@app/services/communication.service';
import { DrawService } from '@app/services/draw.service';
import { of } from 'rxjs';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let drawService: DrawService;
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;
    let reader: FileReader;
    let processImageSpy: jasmine.Spy;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                CommunicationService,
                HttpClient,
                HttpHandler,
                CanvasTestHelper,
                {
                    provide: DrawService,
                    useValue: {
                        drawImgUrl: jasmine.createSpy('drawImgUrl'),
                        resetCanvas: jasmine.createSpy('resetCanvas'),
                        drawToMergeCanvas: jasmine.createSpy('mergeToDrawCanvas'),
                        drawToCanvas: jasmine.createSpy('drawWhiteCanvas'),
                    },
                },
            ],
        }).compileComponents();

        drawService = TestBed.inject(DrawService);
        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.leftCanvas = TestBed.createComponent(CanvasComponent).componentInstance;
        component.rightCanvas = TestBed.createComponent(CanvasComponent).componentInstance;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('imgInfo should call drawImg with originalRef when imgRef is original', () => {
        const url = 'test-url';
        component.imgInfo('original', url);
        expect(drawService.drawImgUrl).toHaveBeenCalledWith(component.originalRef, url);
        expect(component.hasOriginal).toBeTrue();
        expect(component.hasModified).toBeFalse();
    });

    it('imgInfo should call drawImg with modifiedRef when imgRef is modified', () => {
        const url = 'test-url';
        component.imgInfo('modified', url);
        expect(drawService.drawImgUrl).toHaveBeenCalledWith(component.modifiedRef, url);
        expect(component.hasModified).toBeTrue();
        expect(component.hasOriginal).toBeFalse();
    });

    it('imgInfo should call drawImg with both originalRef and modifiedRef when imgRef is both', () => {
        const url = 'test-url';
        component.imgInfo('both', url);
        expect(drawService.drawImgUrl).toHaveBeenCalledWith(component.modifiedRef, url);
        expect(drawService.drawImgUrl).toHaveBeenCalledWith(component.originalRef, url);
        expect(component.hasOriginal).toBeTrue();
        expect(component.hasModified).toBeTrue();
    });

    it('canvasToBmp should call saveAsImage with originalRef and set imgData.data', async () => {
        component.imgData = { originalData: '', diffData: '', name: '', radius: 0 };
        component.pictureTitle = 'test-title';
        spyOn(component, 'saveAsImage').and.returnValue('test-image-data');
        await component.canvasToBmp();
        expect(component.saveAsImage).toHaveBeenCalledWith(component.originalRef, component.leftCanvas, component.leftMergeCanvas);
        expect(component.imgData.originalData).toBe('test-image-data');
    });

    it('canvasToBmp should call saveAsImage with modifiedRef and set imgData.diffData', async () => {
        component.imgData = { originalData: '', diffData: '', name: '', radius: 0 };
        component.pictureTitle = 'test-title';
        spyOn(component, 'saveAsImage').and.returnValue('test-image-data');
        await component.canvasToBmp();
        expect(component.saveAsImage).toHaveBeenCalledWith(component.modifiedRef, component.rightCanvas, component.rightMergeCanvas);
        expect(component.imgData.diffData).toBe('test-image-data');
    });

    it('canvasToBmp should set imgData.name to pictureTitle', async () => {
        component.imgData = { originalData: '', diffData: '', name: '', radius: 0 };
        component.pictureTitle = 'test-title';
        spyOn(component, 'saveAsImage').and.returnValue('test-image-data');
        await component.canvasToBmp();
        expect(component.imgData.name).toBe('test-title');
    });

    it('saveAsImage should call toDataURL on the canvas element with image/bmp', () => {
        const canvas = component.leftMergeCanvas.nativeElement;
        spyOn(canvas, 'toDataURL').and.returnValue('test-data-url');
        const imgRef = { nativeElement: canvas };
        component.saveAsImage(imgRef, component.leftCanvas, component.leftMergeCanvas);
        expect(canvas.toDataURL).toHaveBeenCalledWith('image/bmp');
    });

    it('saveAsImage should return the result of toDataURL', () => {
        const canvas = component.leftMergeCanvas.nativeElement;
        spyOn(canvas, 'toDataURL').and.returnValue('test-data-url');
        const imgRef = { nativeElement: canvas };
        const result = component.saveAsImage(imgRef, component.leftCanvas, component.leftMergeCanvas);
        expect(result).toBe('test-data-url');
    });

    it('analyzeRequestAnswer should set the numberOfDiff property to the input number', () => {
        const numberOfDiff = 42;
        component.analyzeRequestAnswer(numberOfDiff, 'easy', '');
        expect(component.numberOfDiff).toBe(numberOfDiff);
    });

    it('analyzeRequestAnswer should set the difficulty property to the input string', () => {
        const difficulty = 'hard';
        component.analyzeRequestAnswer(0, difficulty, '');
        expect(component.difficulty).toBe(difficulty);
    });

    it('readImage should call processImage with the loaded file when input files are present and input is truthy', async () => {
        processImageSpy = spyOn(component, 'processImage').and.stub();
        reader = new FileReader();
        const event: Event = { target: { files: [new File([], 'file1')] } as unknown as EventTarget } as Event;
        component.readImage(event, 'source').then(() => expect(processImageSpy).toHaveBeenCalledWith(reader.result as string, 'source'));
    });

    it('readImage should not call processImage when input files are absent', async () => {
        processImageSpy = spyOn(component, 'processImage').and.stub();
        reader = new FileReader();
        const event: Event = { target: null } as Event;
        component.readImage(event, 'source').catch(() => expect(processImageSpy).not.toHaveBeenCalled());
    });

    it('readImage should not call processImage when input is falsy', async () => {
        processImageSpy = spyOn(component, 'processImage').and.stub();
        reader = new FileReader();
        const event: Event = { target: { files: null } as unknown as EventTarget } as Event;
        component.readImage(event, 'source').catch(() => expect(processImageSpy).not.toHaveBeenCalled());
    });

    it('showPopupshould show the popup when it is called', () => {
        const popupRef = {
            nativeElement: {
                style: {
                    visibility: 'hidden',
                },
            },
        } as ElementRef;
        const saveBtnRef = {
            nativeElement: {
                disabled: false,
            },
        } as ElementRef;

        component.popupRef = popupRef;
        component.saveBtnRef = saveBtnRef;
        component.showPopup();
        expect(popupRef.nativeElement.style.visibility).toEqual('visible');
    });

    it('closePopup should hide the popup and enable the save button when it is called', () => {
        const deleteTempsSpy = spyOn(component, 'deleteTemps').and.stub();
        const popupRef = {
            nativeElement: {
                style: {
                    visibility: 'hidden',
                },
            },
        } as ElementRef;
        const saveBtnRef = {
            nativeElement: {
                disabled: false,
            },
        } as ElementRef;

        component.popupRef = popupRef;
        component.saveBtnRef = saveBtnRef;
        component.closePopup();
        expect(deleteTempsSpy).toHaveBeenCalled();
        expect(popupRef.nativeElement.style.visibility).toEqual('hidden');
        expect(saveBtnRef.nativeElement.disabled).toEqual(false);
    });

    it('enableSaveButton should enable the save button when it is called', () => {
        const popupRef = {
            nativeElement: {
                style: {
                    visibility: 'hidden',
                },
            },
        } as ElementRef;
        const saveBtnRef = {
            nativeElement: {
                disabled: false,
            },
        } as ElementRef;

        component.popupRef = popupRef;
        component.saveBtnRef = saveBtnRef;
        component.disableSaveButton();
        component.enableSaveButton();
        expect(saveBtnRef.nativeElement.disabled).toEqual(false);
    });

    it('processImage should call imgInfo when checkImage returns true', async () => {
        const url = 'data:image/x-ms-bmp;base64,Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAA////////AAD///////8AAA==';
        const source = 'some source';
        const size = 921654;
        const checkImageSpy = spyOn(component, 'checkImage').and.returnValue(true);
        const imgInfoSpy = spyOn(component, 'imgInfo');
        component.defaultHeight = 2;
        component.defaultWidth = 2;

        await component.processImage(url, source, size);

        expect(checkImageSpy).toHaveBeenCalledWith(2, 2, size);
        expect(imgInfoSpy).toHaveBeenCalledWith(source, url);
    });

    it('processImage should show alert when checkImage returns false because of width and height', async () => {
        const url = 'data:image/x-ms-bmp;base64,Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAA////////AAD///////8AAA==';
        const source = 'some source';
        const size = 921654;
        const checkImageSpy = spyOn(component, 'checkImage').and.returnValue(false);
        const imgInfoSpy = spyOn(component, 'imgInfo');
        const alertSpy = spyOn(window, 'alert');
        component.defaultHeight = 3;
        component.defaultWidth = 3;

        try {
            await component.processImage(url, source, size);
            fail();
        } catch (error) {
            expect(checkImageSpy).toHaveBeenCalledWith(2, 2, size);
            expect(imgInfoSpy).not.toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalledWith("L'image doit avoir les dimensions suivantes : 640 x 480 px et doit être 24 bit");
        }
    });

    it('checkImage should return true if width, height and size are correct', async () => {
        const size = 921654;
        component.defaultHeight = 2;
        component.defaultWidth = 2;

        component.checkImage(2, 2, size);

        expect(component.checkImage).toBeTruthy();
    });

    it('checkImage should return false if width and height are incorrect', async () => {
        const size = 921654;
        component.defaultHeight = 3;
        component.defaultWidth = 3;

        component.checkImage(2, 2, size);

        expect(component.checkImage).toBeTruthy();
    });

    it('checkImage should return false if size is incorrect', async () => {
        const size = 5;
        component.defaultHeight = 2;
        component.defaultWidth = 2;

        component.checkImage(2, 2, size);

        expect(component.checkImage).toBeTruthy();
    });

    it('processImage should show alert when checkImage returns false because of size', async () => {
        const url = 'data:image/x-ms-bmp;base64,Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABABgAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAA////////AAD///////8AAA==';
        const source = 'some source';
        const size = 70;
        const checkImageSpy = spyOn(component, 'checkImage').and.returnValue(false);
        const imgInfoSpy = spyOn(component, 'imgInfo');
        const alertSpy = spyOn(window, 'alert');
        component.defaultHeight = 2;
        component.defaultWidth = 2;

        try {
            await component.processImage(url, source, size);
            fail();
        } catch (error) {
            expect(checkImageSpy).toHaveBeenCalledWith(2, 2, size);
            expect(imgInfoSpy).not.toHaveBeenCalled();
            expect(alertSpy).toHaveBeenCalledWith("L'image doit avoir les dimensions suivantes : 640 x 480 px et doit être 24 bit");
        }
    });

    it('checkSaveBtn should call disableSaveButton and alert "titre" if imgData.name is undefined', () => {
        const disableSaveButtonSpy = spyOn(component, 'disableSaveButton');
        const alertSpy = spyOn(window, 'alert');
        component.numberOfDiff = 5;
        component.checkSaveBtn();
        expect(disableSaveButtonSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Il faut ajouter un titre');
    });

    it('checkSaveBtn should call disableSaveButton and alert "diff" if numberOfDiff is greater than 9', () => {
        const disableSaveButtonSpy = spyOn(component, 'disableSaveButton');
        const alertSpy = spyOn(window, 'alert');
        const imgData = { name: 'test', originalData: '', diffData: '', radius: 0 };
        component.numberOfDiff = 10;
        component.imgData = imgData;
        component.checkSaveBtn();
        expect(disableSaveButtonSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith("L'image doit contenir entre 3 et 9 différences");
    });

    it('checkSaveBtn should not call disableSaveButton when the name of the image is defined and numberOfDiff is between 3 and 9', () => {
        const disableSaveButtonSpy = spyOn(component, 'disableSaveButton');
        const alertSpy = spyOn(window, 'alert');
        const imgData = { name: 'test', originalData: '', diffData: '', radius: 0 };
        component.numberOfDiff = 5;
        component.imgData = imgData;
        component.checkSaveBtn();
        expect(disableSaveButtonSpy).not.toHaveBeenCalled();
        expect(alertSpy).not.toHaveBeenCalled();
    });

    it('saveImage should call the imageSave method and log the response', () => {
        const comService = TestBed.inject(CommunicationService);
        component.difficulty = 'Diff';
        component.imgData.name = 'test-img-name';
        component.numberOfDiff = 5;
        const response = 'test-response';
        spyOn(comService, 'imageSave').and.returnValue(of(response));
        spyOn(console, 'log');
        spyOn(router, 'navigate').and.stub();

        component.saveImage();

        expect(comService.imageSave).toHaveBeenCalledWith(component.imgData.name, component.difficulty, component.numberOfDiff);
    });

    it('validateImage should handle a successful validation response', () => {
        const spy = spyOn(component, 'analyzeRequestAnswer').and.stub();
        const checkSaveBtnSpy = spyOn(component, 'checkSaveBtn').and.stub();
        const showPopupSpy = spyOn(component, 'showPopup').and.stub();
        const canvasToBmpSpy = spyOn(component, 'canvasToBmp').and.stub();
        const comServiceSpy = spyOn(component.comService, 'imageValidate').and.returnValue(
            of({
                data: 'test data',
                numberOfDiff: 1,
                difficulty: 'easy',
            }),
        );

        component.validateImage();

        expect(spy).toHaveBeenCalledWith(1, 'easy', 'test data');
        expect(checkSaveBtnSpy).toHaveBeenCalled();
        expect(showPopupSpy).toHaveBeenCalled();
        expect(canvasToBmpSpy).toHaveBeenCalled();
        expect(comServiceSpy).toHaveBeenCalled();
    });

    it('deleteTemps should call the deleteTemps method and log the response', () => {
        const comService = TestBed.inject(CommunicationService);
        const response = 'test-response';
        spyOn(comService, 'deleteTemps').and.returnValue(of(response));
        spyOn(console, 'log');

        component.deleteTemps();

        expect(comService.deleteTemps).toHaveBeenCalled();
    });

    it('resetImg should call resetCanvas with originalRef when imgRef is original', async () => {
        component.hasOriginal = true;
        await component.resetImg('original');
        expect(drawService.resetCanvas).toHaveBeenCalledWith(component.originalRef);
        expect(component.hasOriginal).toBeFalsy();
    });

    it('resetImg should call resetCanvas with modifiedRef when imgRef is modified', async () => {
        component.hasModified = true;
        await component.resetImg('modified');
        expect(drawService.resetCanvas).toHaveBeenCalledWith(component.modifiedRef);
        expect(component.hasModified).toBeFalsy();
    });

    it('should call undo() when ctrl+z is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
        spyOn(component, 'undo');

        document.dispatchEvent(event);

        expect(component.undo).toHaveBeenCalled();
    });

    it('should call redo() when ctrl+shift+z is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
        spyOn(component, 'redo');

        document.dispatchEvent(event);

        expect(component.redo).toHaveBeenCalled();
    });

    it('duplicateForeground should give the exporting canvas information to the importing canvas', () => {
        component.leftCanvas.modifications = [];
        component.leftCanvas.numberOfMods = 0;
        component.rightCanvas.modifications = [{ points: [{ row: 1, col: 1 }], color: 'red' }];
        component.rightCanvas.numberOfMods = 1;
        const updateAllModsCanvasSpy = spyOn(component.leftCanvas, 'updateAllModsCanvas').and.stub();
        component.duplicateForeground(component.rightCanvas, component.leftCanvas);
        expect(component.leftCanvas.modifications).toEqual([{ points: [{ row: 1, col: 1 }], color: 'red' }]);
        expect(component.leftCanvas.numberOfMods).toEqual(1);
        expect(updateAllModsCanvasSpy).toHaveBeenCalled();
    });

    it('swapForegrounds should swap the foregrounds', () => {
        component.leftCanvas.modifications = [];
        component.leftCanvas.numberOfMods = 0;
        component.rightCanvas.modifications = [{ points: [{ row: 1, col: 1 }], color: 'red' }];
        component.rightCanvas.numberOfMods = 1;

        const leftUpdateAllModsCanvasSpy = spyOn(component.leftCanvas, 'updateAllModsCanvas').and.stub();
        const rightUpdateAllModsCanvasSpy = spyOn(component.rightCanvas, 'updateAllModsCanvas').and.stub();

        component.swapForegrounds();

        expect(component.leftCanvas.modifications).toEqual([{ points: [{ row: 1, col: 1 }], color: 'red' }]);
        expect(component.leftCanvas.numberOfMods).toEqual(1);
        expect(component.rightCanvas.modifications).toEqual([]);
        expect(component.rightCanvas.numberOfMods).toEqual(0);
        expect(leftUpdateAllModsCanvasSpy).toHaveBeenCalled();
        expect(rightUpdateAllModsCanvasSpy).toHaveBeenCalled();
    });

    it('undo should call the canvasComponents undo function', () => {
        const leftUndoSpy = spyOn(component.leftCanvas, 'undo').and.stub();
        component.allModifications = [component.leftCanvas, component.leftCanvas];
        component.numberOfMods = 2;

        component.undo();

        expect(component.allModifications).toEqual([component.leftCanvas, component.leftCanvas]);
        expect(component.numberOfMods).toEqual(1);
        expect(leftUndoSpy).toHaveBeenCalled();
    });

    it('undo should not call the canvasComponents undo function if numberOfMods is 0', () => {
        const leftUndoSpy = spyOn(component.leftCanvas, 'undo').and.stub();
        component.allModifications = [component.leftCanvas, component.leftCanvas];
        component.numberOfMods = 0;

        component.undo();

        expect(component.allModifications).toEqual([component.leftCanvas, component.leftCanvas]);
        expect(component.numberOfMods).toEqual(0);
        expect(leftUndoSpy).not.toHaveBeenCalled();
    });

    it('redo should call the canvasComponents redo function', () => {
        const leftRedoSpy = spyOn(component.leftCanvas, 'redo').and.stub();
        component.allModifications = [component.leftCanvas, component.leftCanvas];
        component.numberOfMods = 1;

        component.redo();

        expect(component.allModifications).toEqual([component.leftCanvas, component.leftCanvas]);
        expect(component.numberOfMods).toEqual(2);
        expect(leftRedoSpy).toHaveBeenCalled();
    });

    it('redo should not call the canvasComponents redo function if numberOfMods is equal to length of allModificaitons', () => {
        const leftRedoSpy = spyOn(component.leftCanvas, 'redo').and.stub();
        component.allModifications = [component.leftCanvas, component.leftCanvas];
        component.numberOfMods = 2;

        component.redo();

        expect(component.allModifications).toEqual([component.leftCanvas, component.leftCanvas]);
        expect(component.numberOfMods).toEqual(2);
        expect(leftRedoSpy).not.toHaveBeenCalled();
    });

    it('addModification should add a difference if allModifications.length==numberOfMods', () => {
        component.allModifications = [component.leftCanvas, component.leftCanvas];
        component.numberOfMods = 2;

        component.addModification(component.rightCanvas);

        expect(component.allModifications).toEqual([component.leftCanvas, component.leftCanvas, component.rightCanvas]);
        expect(component.numberOfMods).toEqual(3);
    });

    it('addModification should not remove extra differences if allModifications.length < numberOfMods', () => {
        component.allModifications = [component.leftCanvas, component.leftCanvas];
        component.numberOfMods = 1;

        component.addModification(component.rightCanvas);

        expect(component.allModifications).toEqual([component.leftCanvas, component.rightCanvas]);
        expect(component.numberOfMods).toEqual(2);
    });
});
