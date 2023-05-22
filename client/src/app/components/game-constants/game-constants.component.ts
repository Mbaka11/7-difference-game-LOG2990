import { Component, OnInit, ViewChild } from '@angular/core';
import { TimeGameSetting } from '@app/common/time-game-interface';
import { StepperConstantsComponent } from '@app/components/stepper-constants/stepper-constants.component';
import { GAME_TIME_CONSTANTS } from '@app/constants/time-constants';
import { TimeGameSocketService } from '@app/services/time-game-socket.service';
import { GameTimeConstants } from '@common/game-time-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    @ViewChild('gameTimeStepper') gameTimeStepper: StepperConstantsComponent;
    @ViewChild('penaltyTimeStepper') penaltyTimeStepper: StepperConstantsComponent;
    @ViewChild('successTimeStepper') successTimeStepper: StepperConstantsComponent;

    gameTimeConstants: GameTimeConstants = {
        gameTime: GAME_TIME_CONSTANTS.defaultGameTime,
        penaltyTime: GAME_TIME_CONSTANTS.defaultPenaltyTime,
        successTime: GAME_TIME_CONSTANTS.defaultSuccessTime,
    };

    constructor(private timeGameSocketService: TimeGameSocketService) {}

    ngOnInit(): void {
        const savedGameTime = localStorage.getItem('gameTime');
        const savedSuccessTime = localStorage.getItem('successTime');
        const savedPenaltyTime = localStorage.getItem('penaltyTime');
        if (savedGameTime && savedSuccessTime && savedPenaltyTime) {
            this.gameTimeConstants.gameTime = parseInt(savedGameTime, 10);
            this.gameTimeConstants.successTime = parseInt(savedSuccessTime, 10);
            this.gameTimeConstants.penaltyTime = parseInt(savedPenaltyTime, 10);
        }
    }

    isDefaultTimeSettings(): boolean {
        return (
            this.gameTimeConstants.gameTime === GAME_TIME_CONSTANTS.defaultGameTime &&
            this.gameTimeConstants.successTime === GAME_TIME_CONSTANTS.defaultSuccessTime &&
            this.gameTimeConstants.penaltyTime === GAME_TIME_CONSTANTS.defaultPenaltyTime
        );
    }

    onclickSaveTimeConstants(): void {
        localStorage.setItem('gameTime', this.gameTimeConstants.gameTime.toString());
        localStorage.setItem('successTime', this.gameTimeConstants.successTime.toString());
        localStorage.setItem('penaltyTime', this.gameTimeConstants.penaltyTime.toString());
        const settings: TimeGameSetting = {
            startTime: this.gameTimeConstants.gameTime,
            penaltyTime: this.gameTimeConstants.penaltyTime,
            bonusTime: this.gameTimeConstants.successTime,
        };
        this.timeGameSocketService.sendGameSettings(settings);
    }

    onClickResetTimeConstants(): void {
        this.gameTimeConstants = {
            gameTime: GAME_TIME_CONSTANTS.defaultGameTime,
            penaltyTime: GAME_TIME_CONSTANTS.defaultPenaltyTime,
            successTime: GAME_TIME_CONSTANTS.defaultSuccessTime,
        };
        this.onclickSaveTimeConstants();
    }
}
