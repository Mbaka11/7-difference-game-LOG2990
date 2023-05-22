import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameType } from '@app/common/constants';
import { GameInProgress } from '@app/common/game-interface';
import { DialogMessageComponent } from '@app/components/dialog-message/dialog-message.component';
import { ReplayDialogMessageComponent } from '@app/components/replay-dialog-message/replay-dialog-message.component';
import { TwoButtonDialogMessageComponent } from '@app/components/two-button-dialog-message/two-button-dialog-message.component';
import { INVALID_PODIUM_PLACE } from '@app/constants/invalid-podium-place';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { MultiplayerService } from '@app/services/multiplayer.service';
import { TimerService } from '@app/services/timer.service';
import { Subject } from 'rxjs';
import { HistoryService } from './history.service';
import { InterpretRouteService } from './interpret-route.service';
import { VideoReplayService } from './video-replay.service';

@Injectable({
    providedIn: 'root',
})
export class EndgameService {
    timerId: number;
    dialog: MatDialog;
    replaySubject = new Subject<unknown>();
    restartSubject = new Subject<unknown>();
    timeAbandonSubject = new Subject<unknown>();

    constructor(
        public chatService: ChatService,
        public multiplayerService: MultiplayerService,
        public timerService: TimerService,
        public comService: CommunicationService,
        public historyService: HistoryService,
        public interpretRouteService: InterpretRouteService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    onAbandon(gameType: GameType, gameInProgress: GameInProgress) {
        const dialogRef = this.dialog.open(TwoButtonDialogMessageComponent, {
            disableClose: true,
            data: { message: 'Voulez-vous vraiment abandonner la partie?', isGoingToReturn: true },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'confirm') this.surrenderGame(gameType, gameInProgress);
        });
    }

    onRefreshed(gameInProgress: GameInProgress) {
        const message = `${this.chatService.formatTime(new Date())} ${gameInProgress.username} a abandonné la partie.`;
        this.chatService.sendRoomMessage(gameInProgress.roomName, message, 'onPlayerLeave');
        this.multiplayerService.sendSurender(gameInProgress.roomName);
        this.multiplayerService.leaveRoom(gameInProgress.roomName);
        this.deleteTimer();
        this.router.navigate(['home']);

        if (gameInProgress.gameType !== undefined && !VideoReplayService.isPlayingReplay) {
            const gameTypeName = this.getGameTypeName(gameInProgress.gameType);

            if (gameInProgress.gameType === GameType.MultiplayerClassic || gameInProgress.gameType === GameType.MultiplayerTime) {
                this.historyService.addGameToHistory(
                    this.timerService.getTotalGameTimer().toString() + ' s',
                    gameTypeName,
                    [gameInProgress.username, gameInProgress.opponentUsername],
                    gameInProgress.opponentUsername,
                    gameInProgress.username,
                );
            } else {
                this.historyService.addGameToHistory(
                    this.timerService.getTotalGameTimer().toString() + ' s',
                    gameTypeName,
                    [gameInProgress.username],
                    undefined,
                    gameInProgress.username,
                );
            }
        }
    }

    getGameTypeName(gameType: GameType): string {
        switch (gameType) {
            case GameType.SoloClassic:
                return 'Solo Classic';
            case GameType.MultiplayerClassic:
                return 'Multiplayer Classic';
            case GameType.SoloTime:
                return 'Solo Time';
            case GameType.MultiplayerTime:
                return 'Multiplayer Time';
            default:
                throw new Error(`Unknown game type: ${gameType}`);
        }
    }

    surrenderGame(gameType: GameType, gameInProgress: GameInProgress): void {
        if (gameType !== GameType.MultiplayerTime) this.deleteTimer();
        const gameTypeName = this.getGameTypeName(gameType);
        if (gameType === GameType.MultiplayerClassic || gameType === GameType.MultiplayerTime) {
            const message = `${this.chatService.formatTime(new Date())} ${gameInProgress.username} a abandonné la partie.`;
            this.chatService.sendRoomMessage(gameInProgress.roomName, message, 'onPlayerLeave');
            this.multiplayerService.sendSurender(gameInProgress.roomName);
            this.historyService.addGameToHistory(
                this.timerService.getTotalGameTimer().toString() + ' s',
                gameTypeName,
                [gameInProgress.username, gameInProgress.opponentUsername],
                gameInProgress.opponentUsername,
                gameInProgress.username,
            );
        } else {
            this.historyService.addGameToHistory(
                this.timerService.getTotalGameTimer().toString() + ' s',
                gameTypeName,
                [gameInProgress.username],
                undefined,
                gameInProgress.username,
            );
        }
        VideoReplayService.isPlayingReplay = false;
        this.multiplayerService.leaveRoom(gameInProgress.roomName);
    }

    endGame(gameInProgress: GameInProgress): void {
        this.deleteTimer();
        this.multiplayerService.leaveRoom(gameInProgress.roomName);
        const gameTypeName = this.getGameTypeName(gameInProgress.gameType);

        if (this.isClassicGame(gameInProgress.gameType)) {
            if (!VideoReplayService.isPlayingReplay) {
                this.comService
                    .updatePodium({
                        username: gameInProgress.username,
                        time: this.timerService.getTotalGameTimer(),
                        gameId: gameInProgress.gameCard.gameId,
                        gameType: gameInProgress.gameType,
                        gameName: gameInProgress.gameCard.gameName,
                    })
                    .subscribe((podiumPlace: unknown) => {
                        if (podiumPlace === INVALID_PODIUM_PLACE) this.openWinAndReplayMessage();
                        else this.openWinAndReplayMessage(podiumPlace as number, gameInProgress.username);
                    });
            } else {
                this.openWinAndReplayMessage();
            }
        } else {
            this.openCongratsMessage();
        }
        if (gameInProgress.gameType === GameType.MultiplayerClassic || gameInProgress.gameType === GameType.MultiplayerTime) {
            if (gameInProgress.gameType === GameType.MultiplayerTime && this.interpretRouteService.getPlayerType(this.route) === 'creator') {
                this.historyService.addGameToHistory(
                    this.timerService.getTotalGameTimer().toString() + ' s',
                    gameTypeName,
                    [gameInProgress.username, gameInProgress.opponentUsername],
                    gameInProgress.username,
                    undefined,
                );
            }
        } else {
            if (!VideoReplayService.isPlayingReplay) {
                this.historyService.addGameToHistory(
                    this.timerService.getTotalGameTimer().toString() + ' s',
                    gameTypeName,
                    [gameInProgress.username],
                    gameInProgress.username,
                    undefined,
                );
            }
        }
    }

    loseGame(gameInProgress: GameInProgress, roomName: string, opponentUsername: string): void {
        this.deleteTimer();
        this.multiplayerService.leaveRoom(roomName);
        if (this.isClassicGame(gameInProgress.gameType)) {
            this.openLoseAndReplayMessage(opponentUsername);
        } else {
            this.openTimeLoserMessage();
            if (this.interpretRouteService.getPlayerType(this.route) === 'creator') {
                this.historyService.addGameToHistory(
                    this.timerService.getTimer().toString() + ' s',
                    this.getGameTypeName(gameInProgress.gameType),
                    [gameInProgress.username, gameInProgress.opponentUsername],
                    undefined,
                    undefined,
                );
            }
        }
    }

    oponentHasGivenUp(roomName: string, gameType: GameType): void {
        if (gameType === GameType.MultiplayerTime) {
            this.timeAbandonSubject.next({});
        } else {
            this.deleteTimer();
            this.multiplayerService.leaveRoom(roomName);
            this.openGiveUpMessage();
        }
    }

    deleteTimer(): void {
        this.timerService.stopTimer();
    }

    openCongratsMessage(): void {
        this.dialog.open(DialogMessageComponent, { disableClose: true, data: { message: 'Bravo tu as gagné!' } });
    }

    openWinAndReplayMessage(podiumPlace?: number, username?: string): void {
        const message =
            podiumPlace === undefined
                ? 'Bravo tu as gagné!'
                : `Bravo tu as gagné et en plus ${username}, votre pseudo, été ajouté à la place ${podiumPlace} du podium de ce jeu !`;
        const dialogRef = this.dialog.open(ReplayDialogMessageComponent, { disableClose: true, data: { message } });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'replay') {
                if (VideoReplayService.isPlayingReplay) this.restartSubject.next({});
                else this.replaySubject.next({});
            }
        });
    }

    openLoserMessage(opponentUsername: string): void {
        this.dialog.open(DialogMessageComponent, {
            disableClose: true,
            data: { message: `Bravo, vous avez perdu!\n${opponentUsername} vous a ouvert!` },
        });
    }

    openTimeLoserMessage(): void {
        this.dialog.open(DialogMessageComponent, {
            disableClose: true,
            data: { message: 'Bravo, vous avez perdu!\nLa minuterie vous a ouvert!' },
        });
    }

    openLoseAndReplayMessage(opponentUsername: string): void {
        const dialogRef = this.dialog.open(ReplayDialogMessageComponent, {
            disableClose: true,
            data: { message: `Bravo, vous avez perdu!\n${opponentUsername} vous a ouvert!` },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'replay') {
                if (VideoReplayService.isPlayingReplay) this.restartSubject.next({});
                else this.replaySubject.next({});
            }
        });
    }

    openGiveUpMessage(): void {
        this.dialog.open(DialogMessageComponent, {
            disableClose: true,
            data: { message: 'Bravo votre adversaire est parti en courant comme un joueur de league!' },
        });
    }

    isClassicGame(gameType: GameType) {
        return gameType === GameType.SoloClassic || gameType === GameType.MultiplayerClassic;
    }
}
