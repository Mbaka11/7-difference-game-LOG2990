import { Component } from '@angular/core';
import { GameType } from '@app/common/constants';

@Component({
    selector: 'app-game-solo-page',
    templateUrl: './game-solo-page.component.html',
    styleUrls: ['./game-solo-page.component.scss', '../../../styles.scss'],
})
export class GameSoloPageComponent {
    gameType = GameType.SoloClassic;
}
