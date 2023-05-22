import { Component } from '@angular/core';
import { GameType } from '@app/common/constants';

@Component({
    selector: 'app-time-game-multiplayer-page',
    templateUrl: './time-game-multiplayer-page.component.html',
    styleUrls: ['./time-game-multiplayer-page.component.scss', '../../../styles.scss'],
})
export class TimeGameMultiplayerPageComponent {
    gameType = GameType.MultiplayerTime;
}
