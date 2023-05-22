import { AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ConfigButtonsComponent } from '@app/components/config-buttons/config-buttons.component';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { TwoButtonDialogMessageComponent } from '@app/components/two-button-dialog-message/two-button-dialog-message.component';
import { DEFAULT_MAX_GAMECARD_DISPLAYED } from '@app/constants/page-constants';
import { CommunicationService } from '@app/services/communication.service';
import { GamecardService } from '@app/services/gamecard.service';
import { WaitingRoomService } from '@app/services/waiting-room.service';
import { GameInformation } from '@common/game-information';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gamecard',
    templateUrl: './gamecard.component.html',
    styleUrls: ['./gamecard.component.scss', '../../../styles.scss'],
})
export class GamecardComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChildren(ConfigButtonsComponent) configButtonsComponents: QueryList<ConfigButtonsComponent>;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    @Input() buttonName1: string;
    @Input() buttonName2: string;
    @Input() disableButton2: boolean;

    startIndex = 0;

    pageSize = DEFAULT_MAX_GAMECARD_DISPLAYED;
    pageSizeOptions = [DEFAULT_MAX_GAMECARD_DISPLAYED];
    pageEventVariable: PageEvent;
    deleteSubscription: Subscription;

    cards: GameInformation[] = [];
    imageURLs: string[] = [];

    isEmpty: boolean = false;

    constructor(
        public gamecardService: GamecardService,
        public dialog: MatDialog,
        public commService: CommunicationService,
        public waitingRoomService: WaitingRoomService,
    ) {}

    onPageEvent(event: PageEvent) {
        this.startIndex = event.pageIndex * this.pageSize;
    }

    getColor(difficulty: string): string {
        switch (difficulty) {
            case 'facile':
                return 'green';
            case 'difficile':
                return 'red';
            default:
                return 'black';
        }
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe((event) => {
            this.pageEventVariable = event;
            this.onPageEvent(event);
        });
        this.deleteSubscription = this.gamecardService.cardDeleted.subscribe(() => {
            this.getCardInfo();
        });
    }

    ngOnDestroy(): void {
        this.deleteSubscription.unsubscribe();
    }

    async ngOnInit() {
        this.getCardInfo();
    }

    useLeftButton(card: GameInformation, buttonName: string) {
        if (buttonName === 'Jouer') {
            this.openPlayerNameDialog(card, '/gamesolo');
        }

        if (buttonName === 'Supprimer') {
            this.confirmation(card);
        }

        if (buttonName === 'Créer' || buttonName === 'Joindre') {
            this.openPlayerNameDialog(card, '/waiting-room');
        }
    }

    deletePodium(gameId: number): void {
        const dialogRef = this.dialog.open(TwoButtonDialogMessageComponent, {
            disableClose: true,
            data: { message: 'Voulez-vous vraiment supprimer le podium ?', isGoingToReturn: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'confirm') {
                this.commService.resetPodium(gameId);
            }
        });
    }

    openPlayerNameDialog(card: GameInformation, routeAfterDialog: string) {
        this.dialog.open(PlayerNameDialogComponent, {
            data: {
                gameId: card.gameId,
                route: routeAfterDialog,
            },
        });
    }

    confirmation(card: GameInformation) {
        const dialogRef = this.dialog.open(TwoButtonDialogMessageComponent, {
            disableClose: true,
            data: { message: 'Voulez-vous vraiment supprimer la carte?', isGoingToReturn: false },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'confirm') {
                this.commService.deleteReal(card.gameId).subscribe(() => {
                    this.getCardInfo();
                });
            }
        });
    }

    getCardInfo() {
        this.commService.imageGetAllURLs().subscribe((data) => {
            this.imageURLs = data.data;
            this.cards = data.games;
            if (this.cards.length === 0) {
                this.isEmpty = true;
            }
        });
    }

    getButtonName2(card: GameInformation): string {
        if (this.waitingRoomService.isRoomCreated(`waiting-room-gameId-${card.gameId}`)) return 'Joindre';
        else return 'Créer';
    }
}
