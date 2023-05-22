import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-headbar',
    templateUrl: './headbar.component.html',
    styleUrls: ['./headbar.component.scss'],
})
export class HeadbarComponent {
    @Input() headbarMessage: string;
}
