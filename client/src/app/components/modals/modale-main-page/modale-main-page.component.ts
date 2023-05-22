import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { SocketClientService } from '@app/services/socket-client.service';

import { Router } from '@angular/router';

@Component({
    selector: 'app-modale-main-page',
    templateUrl: './modale-main-page.component.html',
    styleUrls: ['./modale-main-page.component.scss'],
    template: '<app-form></app-form>',
})
export class ModaleMainPageComponent implements OnInit {
    form: FormGroup;
    gameId: number;
    route: string;
    username: string;
    gameType: string;

    constructor(
        // @Inject(MAT_DIALOG_DATA) data: { gameType: string },
        private router: Router,
        private fb: FormBuilder,
        public socket: SocketClientService,
    ) {
        // this.gameId = data.gameId;
        // this.route = data.route;
    }

    ngOnInit() {
        this.form = this.fb.group({
            username: ['', [Validators.required, this.validateAlphanumeric]],
        });
    }

    changePage(): void {
        this.username = this.form.get('username')?.value;
        this.router.navigate(['/time-gamesolo'], {
            queryParams: {
                gameId: 0,
                username: this.username,
                roomGameName: `timeSingleplayer-gameId-0-group-${this.socket.socket.id}`,
                userType: 'creator',
            },
        });
    }

    changePageMultiplayer(): void {
        this.username = this.form.get('username')?.value;
        this.router.navigate(['/waiting-room'], {
            queryParams: {
                gameId: 0,
                username: this.username,
                roomGameName: `timeMultiplayer-gameId-0-group-${this.socket.socket.id}`,
                gameType: 'time',
            },
        });
    }

    validateAlphanumeric(control: FormControl) {
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(control.value)) {
            return { alphanumeric: true };
        }
        return null;
    }

    onUsernameChange(username: string): void {
        this.username = username;
    }
}
