import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaintOptions } from '@app/common/constants';
import { CanvasComponent } from '@app/components/canvas/canvas.component';
import {
    DEFAULT_HEIGHT,
    DEFAULT_SIZE,
    DEFAULT_WIDTH,
    MAX_LENGTH,
    MAX_NUMBER_OF_DIFF,
    MIN_NUMBER_OF_DIFF,
    RADIUS,
} from '@app/constants/creation-page';
import { CommunicationService } from '@app/services/communication.service';
import { DrawService } from '@app/services/draw.service';

interface ImgData {
    name: string;
    originalData: string;
    diffData: string;
    radius: number;
}

@Component({
    selector: 'app-creation-page',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss', '../../../styles.scss'],
})
export class CreationPageComponent implements OnInit, AfterViewInit {
    @ViewChild('original') originalRef: ElementRef<HTMLCanvasElement>;
    @ViewChild('modified') modifiedRef: ElementRef<HTMLCanvasElement>;
    @ViewChild('differences') differencesRef: ElementRef<HTMLImageElement>;
    @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;
    @ViewChild('saveBtn') saveBtnRef: ElementRef<HTMLButtonElement>;
    @ViewChild('leftMods') leftCanvas: CanvasComponent;
    @ViewChild('rightMods') rightCanvas: CanvasComponent;
    @ViewChild('leftMergeCanvas') leftMergeCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('rightMergeCanvas') rightMergeCanvas: ElementRef<HTMLCanvasElement>;
    @Output() currentColor: string = 'red';
    @Output() currentStrokeWidth: number = 1;
    @Output() selectedPaintOption: PaintOptions = PaintOptions.Pencil;
    radiuses: number[] = RADIUS;

    imgData = {} as ImgData;
    inputFormControl = new FormControl('', [Validators.required, Validators.maxLength(MAX_LENGTH), this.noWhitespaceValidator]);

    defaultHeight = DEFAULT_HEIGHT;
    defaultWidth = DEFAULT_WIDTH;

    hasModified: boolean;
    hasOriginal: boolean;

    pictureTitle: string;

    numberOfDiff: number;
    difficulty: string;

    allModifications: CanvasComponent[] = [];
    numberOfMods = 0;

    isSaveButtonDisabled: boolean;

    constructor(public comService: CommunicationService, public drawService: DrawService, private router: Router) {}

    @HostListener('document:keydown.control.z') ctrlZ() {
        this.undo();
    }

    @HostListener('document:keydown.shift.control.z') ctrlShiftZ() {
        this.redo();
    }

    ngOnInit(): void {
        this.imgData.radius = 3;
        this.hasModified = false;
        this.hasOriginal = false;
    }

    ngAfterViewInit(): void {
        this.drawBackgroundToWhite(this.originalRef);
        this.drawBackgroundToWhite(this.modifiedRef);
    }

    noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { whitespace: true };
    }

    async readImage(event: Event, source: string): Promise<void> {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            const input = event.target as HTMLInputElement;
            const imgSize = (input.files as FileList)[0].size;
            if (input && input.files) {
                reader.addEventListener(
                    'load',
                    async () => {
                        await this.processImage(reader.result as string, source, imgSize);
                        res();
                    },
                    false,
                );
                reader.readAsDataURL(input.files[0]);
            } else {
                rej();
            }
        });
    }

    async processImage(url: string, source: string, imgSize: number): Promise<void> {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => {
                if (this.checkImage(img.height, img.width, imgSize)) {
                    this.imgInfo(source, url);
                    res();
                } else {
                    window.alert(`L'image doit avoir les dimensions suivantes : ${DEFAULT_WIDTH} x ${DEFAULT_HEIGHT} px et doit être 24 bit`);
                    rej();
                }
            };
            img.src = url;
        });
    }

    checkImage(height: number, width: number, size: number) {
        return height === this.defaultHeight && width === this.defaultWidth && size === DEFAULT_SIZE;
    }

    async imgInfo(imgRef: string, url: string) {
        if (imgRef === 'original') {
            this.drawService.drawImgUrl(this.originalRef, url);
            this.hasOriginal = true;
        }
        if (imgRef === 'modified') {
            this.hasModified = true;
            this.drawService.drawImgUrl(this.modifiedRef, url);
        }
        if (imgRef === 'both') {
            this.drawService.drawImgUrl(this.modifiedRef, url);
            this.drawService.drawImgUrl(this.originalRef, url);
            this.hasModified = true;
            this.hasOriginal = true;
        }
    }

    async updateImage(data: string) {
        this.differencesRef.nativeElement.src = `data:image/bmp;base64,${data}`;
    }

    async resetImg(imgRef: string) {
        if (imgRef === 'original') {
            this.drawService.resetCanvas(this.originalRef);
            this.hasOriginal = false;
        }
        if (imgRef === 'modified') {
            this.drawService.resetCanvas(this.modifiedRef);
            this.hasModified = false;
        }
    }

    async canvasToBmp() {
        this.imgData.originalData = this.saveAsImage(this.originalRef, this.leftCanvas, this.leftMergeCanvas);
        this.imgData.diffData = this.saveAsImage(this.modifiedRef, this.rightCanvas, this.rightMergeCanvas);
        this.imgData.name = this.pictureTitle;
    }

    saveAsImage(imgRef: ElementRef<HTMLCanvasElement>, foreground: CanvasComponent, mergeCanvasRef: ElementRef<HTMLCanvasElement>): string {
        const mergeCanvas = mergeCanvasRef.nativeElement;
        const backgroundCanvas = imgRef.nativeElement;
        const backgroundCtx = backgroundCanvas.getContext('2d') as CanvasRenderingContext2D;
        const mergeCtx = mergeCanvas.getContext('2d') as CanvasRenderingContext2D;

        this.drawService.drawToMergeCanvas(backgroundCtx, foreground, mergeCtx);
        const dataUrl = mergeCanvas.toDataURL('image/bmp');
        return dataUrl;
    }

    showPopup() {
        this.popupRef.nativeElement.style.visibility = 'visible';
    }
    closePopup() {
        this.popupRef.nativeElement.style.visibility = 'hidden';
        this.enableSaveButton();
        this.deleteTemps();
    }
    enableSaveButton() {
        this.isSaveButtonDisabled = false;
    }
    disableSaveButton() {
        this.isSaveButtonDisabled = true;
    }

    async analyzeRequestAnswer(numberOfDiff: number, difficulty: string, data: string) {
        this.numberOfDiff = numberOfDiff;
        this.difficulty = difficulty;
        await this.updateImage(data);
    }

    validateImage() {
        this.canvasToBmp();

        this.comService.imageValidate(this.imgData).subscribe({
            next: (response) => {
                this.analyzeRequestAnswer(response.numberOfDiff, response.difficulty, response.data);
                this.checkSaveBtn();
            },
        });
        this.showPopup();
    }

    deleteTemps() {
        this.comService.deleteTemps().subscribe({});
    }

    checkSaveBtn() {
        if (this.imgData.name === undefined) {
            window.alert('Il faut ajouter un titre');
            this.disableSaveButton();
        }
        if (this.numberOfDiff > MAX_NUMBER_OF_DIFF || this.numberOfDiff < MIN_NUMBER_OF_DIFF) {
            window.alert("L'image doit contenir entre 3 et 9 différences");
            this.disableSaveButton();
        }
    }

    saveImage() {
        this.comService.imageSave(this.imgData.name, this.difficulty, this.numberOfDiff).subscribe(() => {
            this.router.navigate(['/configuration']);
        });
    }

    duplicateForeground(exporting: CanvasComponent, importing: CanvasComponent) {
        importing.modifications = JSON.parse(JSON.stringify(exporting.modifications));
        importing.numberOfMods = exporting.numberOfMods;
        importing.updateAllModsCanvas();
    }

    swapForegrounds() {
        const leftMods = JSON.parse(JSON.stringify(this.leftCanvas.modifications));
        const leftNumberOfMods = this.leftCanvas.numberOfMods;
        this.duplicateForeground(this.rightCanvas, this.leftCanvas);
        this.rightCanvas.modifications = leftMods;
        this.rightCanvas.numberOfMods = leftNumberOfMods;
        this.rightCanvas.updateAllModsCanvas();
    }

    undo() {
        if (this.numberOfMods > 0) {
            this.allModifications[this.numberOfMods - 1].undo();
            this.numberOfMods--;
        }
    }

    redo() {
        if (this.numberOfMods < this.allModifications.length) {
            this.allModifications[this.numberOfMods].redo();
            this.numberOfMods++;
        }
    }

    addModification(canvas: CanvasComponent) {
        if (this.numberOfMods < this.allModifications.length) {
            this.allModifications.splice(this.numberOfMods);
        }
        this.allModifications.push(canvas);
        this.numberOfMods++;
    }

    drawBackgroundToWhite(canvas: ElementRef<HTMLCanvasElement>) {
        const background = canvas.nativeElement;
        const ctx = background.getContext('2d') as CanvasRenderingContext2D;
        const whiteImage = new Image();
        whiteImage.src = './assets/images/image_empty.bmp';
        this.drawService.drawToCanvas(whiteImage, ctx);
    }
}
