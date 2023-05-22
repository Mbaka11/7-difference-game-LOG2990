import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
})
export class FormComponent {
    @Input() form: FormGroup;
    @Output() username = new EventEmitter<string>();

    ngSubmit() {
        if (this.form) {
            this.username.emit(this.form.get('username')?.value);
        }
    }
}
