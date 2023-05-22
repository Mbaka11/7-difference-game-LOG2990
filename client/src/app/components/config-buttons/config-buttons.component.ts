import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameConstantsComponent } from '@app/components/game-constants/game-constants.component';
import { HistoryComponent } from '@app/components/history/history.component';
import { TwoButtonDialogMessageComponent } from '@app/components/two-button-dialog-message/two-button-dialog-message.component';
import { GamecardService } from '@app/services/gamecard.service';

@Component({
    selector: 'app-config-buttons',
    templateUrl: './config-buttons.component.html',
    styleUrls: ['./config-buttons.component.scss', '../../../styles.scss'],
})
export class ConfigButtonsComponent {
    gameName: string;

    constructor(public dialog: MatDialog, private gameCardService: GamecardService) {}

    openTimeSettings() {
        this.dialog.open(GameConstantsComponent);
    }

    openHistory() {
        this.dialog.open(HistoryComponent);
    }

    deleteAllPodiums(): void {
        const dialogRef = this.dialog.open(TwoButtonDialogMessageComponent, {
            disableClose: true,
            data: { message: 'Voulez-vous vraiment supprimer tous les PODIUMS ?', isGoingToReturn: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'confirm') {
                this.gameCardService.resetAllPodiums();
            }
        });
    }

    deleteAllGames(): void {
        const dialogRef = this.dialog.open(TwoButtonDialogMessageComponent, {
            disableClose: true,
            data: { message: 'Voulez-vous vraiment supprimer tous les JEUX ?', isGoingToReturn: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'confirm') {
                this.gameCardService.deleteAllGames();
            }
        });
    }
}
