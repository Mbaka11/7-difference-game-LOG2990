import { Component } from '@angular/core';
import { GameType } from '@app/common/constants';

@Component({
    selector: 'app-time-game-solo-page',
    templateUrl: './time-game-solo-page.component.html',
    styleUrls: ['./time-game-solo-page.component.scss', '../../../styles.scss'],
})
export class TimeGameSoloPageComponent {
    gameType = GameType.SoloTime;
}
