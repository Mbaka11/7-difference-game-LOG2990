import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent implements OnInit {
    form: FormGroup;
    gameId: number;
    route: string;
    username: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: { gameId: number; route: string },
        private router: Router,
        private fb: FormBuilder,
        public socket: SocketClientService,
    ) {
        this.gameId = data.gameId;
        this.route = data.route;
    }

    ngOnInit() {
        this.form = this.fb.group({
            username: ['', [Validators.required, this.validateAlphanumeric]],
        });
    }

    changePage(): void {
        this.username = this.form.get('username')?.value;
        this.router.navigate([this.route], {
            queryParams: {
                gameId: this.gameId,
                username: this.username,
                roomGameName: `singleplayer-gameId-group-${this.socket.socket.id}`,
                gameType: 'classic',
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
