import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModaleMainPageComponent } from '@app/components/modals/modale-main-page/modale-main-page.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(private dialogRef: MatDialog) {}

    openDialog() {
        this.dialogRef.open(ModaleMainPageComponent);
    }
}
