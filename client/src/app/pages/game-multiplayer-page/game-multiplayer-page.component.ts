import { Component } from '@angular/core';
import { GameType } from '@app/common/constants';

@Component({
    selector: 'app-game-multiplayer-page',
    templateUrl: './game-multiplayer-page.component.html',
    styleUrls: ['./game-multiplayer-page.component.scss', '../../../styles.scss'],
})
export class GameMultiplayerPageComponent {
    gameType = GameType.MultiplayerClassic;
}
