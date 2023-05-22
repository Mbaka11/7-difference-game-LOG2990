import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
/* eslint-disable */
@Component({
    selector: 'app-two-button-dialog-message',
    templateUrl: './two-button-dialog-message.component.html',
    styleUrls: ['./two-button-dialog-message.component.scss'],
})
export class TwoButtonDialogMessageComponent {
    message: string;
    isGoingToReturn: boolean;
    constructor(private dialogRef: MatDialogRef<TwoButtonDialogMessageComponent>, @Inject(MAT_DIALOG_DATA) data: any, public router: Router) {
        this.message = data.message;
        this.isGoingToReturn = data.isGoingToReturn;
    }

    onConfirm() {
        this.dialogRef.close({ event: 'confirm' });
        if (this.isGoingToReturn) {
            this.router.navigate(['home']);
        }
    }

    onCancel() {
        this.dialogRef.close({ event: 'cancel' });
    }
}
