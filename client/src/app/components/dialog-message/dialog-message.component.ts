import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
/* eslint-disable */
@Component({
    selector: 'app-dialog-message',
    templateUrl: './dialog-message.component.html',
    styleUrls: ['./dialog-message.component.scss'],
})
export class DialogMessageComponent {
    message: string;
    constructor(@Inject(MAT_DIALOG_DATA) data: any) {
        this.message = data.message;
    }
}
