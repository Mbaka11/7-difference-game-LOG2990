import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-replay-dialog-message',
    templateUrl: './replay-dialog-message.component.html',
    styleUrls: ['./replay-dialog-message.component.scss'],
})
export class ReplayDialogMessageComponent {
    message: string;
    isGoingToReturn: boolean;
    constructor(
        private dialogRef: MatDialogRef<ReplayDialogMessageComponent>,
        @Inject(MAT_DIALOG_DATA) data: { message: string },
        public router: Router,
    ) {
        this.message = data.message;
    }

    onConfirm() {
        this.dialogRef.close({ event: 'confirm' });
        this.router.navigate(['home']);
    }

    onClickReplay() {
        this.dialogRef.close({ event: 'replay' });
    }
}
