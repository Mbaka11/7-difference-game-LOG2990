import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CHEAT_FLASH_INTERVAL_MS, GameType } from '@app/common/constants';
import { GameInProgress, Points } from '@app/common/game-interface';
import { NUMBER_OF_PLAYER_MULTIPLAYER } from '@app/common/multiplayer-constant';
import { PLAY_BACK_SETUP } from '@app/common/play-back-constant';
import { PlayBack } from '@app/common/play-back-interface';
import { NUMBER_OF_PLAYER_SINGLEPLAYER } from '@app/common/singleplayer-constant';
import { Game, TimeGameSetting } from '@app/common/time-game-interface';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';
import { HintsDisplayComponent } from '@app/components/hints-display/hints-display.component';
import { InformationCardComponent } from '@app/components/information-card/information-card.component';
import { EventType } from '@app/interfaces/game-event';
import { Vec2 } from '@app/interfaces/vec2';
import { ChatService } from '@app/services/chat.service';
import { CommunicationService } from '@app/services/communication.service';
import { DrawService } from '@app/services/draw.service';
import { EndgameService } from '@app/services/endgame.service';
import { GameService } from '@app/services/game.service';
import { GeneralGameService } from '@app/services/general-game.service';
import { InterpretRouteService } from '@app/services/interpret-route.service';
import { MouseHandler } from '@app/services/mouse-buttons.service';
import { MultiplayerService } from '@app/services/multiplayer.service';
import { TimeGameSocketService } from '@app/services/time-game-socket.service';
import { VideoReplayService } from '@app/services/video-replay.service';
import { Coordinate } from '@common/coordinate';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss', '../../../styles.scss'],
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvas2') canvas2: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas1') canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('usernameParagraph') usernameRef: ElementRef<HTMLParagraphElement>;
    @ViewChild('pointsParagraph') pointsRef: ElementRef<HTMLParagraphElement>;
    @ViewChild(ChatBoxComponent) chatBox: ChatBoxComponent;
    @ViewChild(HintsDisplayComponent) hintComponent: HintsDisplayComponent;
    @ViewChild(InformationCardComponent) informationCard: InformationCardComponent;
    @ViewChild('chatBoxContainer', { static: true }) chatBoxContainer: ElementRef;
    @ViewChild('replayContainer') replayContainer: ElementRef<HTMLDivElement>;
    @ViewChild('cheatButtonContainer') cheatButtonContainer: ElementRef<HTMLDivElement>;
    @ViewChild(HintsDisplayComponent) hintsComponent: HintsDisplayComponent;
    @Input() gameType: GameType;
    gameId: number;
    gameInProgress: GameInProgress;
    gameCardLoaded: boolean = false;
    points: Points;
    enableKeydownListener: boolean = true;
    refreshed: boolean = false;
    foundDifferenceSubscription: Subscription;
    surenderSubscription: Subscription;
    loserSubscription: Subscription;
    replayModeSubscription: Subscription;
    replayModeSubscriptionNthTime: Subscription;
    startReplaySubscription: Subscription;
    restartReplaySubscription: Subscription;
    hintReplaySubscription: Subscription;
    timeOnAbandon: Subscription;
    logCoordsReplaySubscription: Subscription;
    cheatModeReplaySubscription: Subscription;
    opponentClickReplaySubscription: Subscription;
    closeThirdHintSubscription: Subscription;
    closedDialogSubscription: Subscription;
    playBack: PlayBack = PLAY_BACK_SETUP;
    timeGameSubscription: Subscription;
    timeGameSettingsSubscription: Subscription;
    timeGameLoseSubscription: Subscription;
    showReplayButtons: boolean = false;
    constructor(
        public mouse: MouseHandler,
        public dialog: MatDialog,
        public draw: DrawService,
        public comService: CommunicationService,
        private route: ActivatedRoute,
        public chatService: ChatService,
        public router: Router,
        public gameService: GameService,
        public generalGameService: GeneralGameService,
        public multiplayerService: MultiplayerService,
        public interpretRouteService: InterpretRouteService,
        public endgameService: EndgameService,
        public videoReplayService: VideoReplayService,
        public timeGameSocketService: TimeGameSocketService,
    ) {
        this.router.events.pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd)).subscribe((event) => {
            if (event.id === 1 && event.url === event.urlAfterRedirects) this.refreshed = true;
        });
        this.gameId = this.interpretRouteService.getGameId(this.route);
        this.gameInProgress = this.generalGameService.initializeGameInProgress(this.gameType, this.canvas1, this.canvas2);
        this.points = { numberOfDifferences: 0, numberOfDifferencesAdversary: 0 };
        this.endgameService.dialog = this.dialog;
        this.videoReplayService.gameId = this.gameId;
    }

    @HostListener('window:keydown.t', ['$event']) onKeydownT(event: KeyboardEvent) {
        if (!this.chatBoxContainer.nativeElement.contains(event.target) && !VideoReplayService.isPlayingReplay) {
            this.cheatButton(event);
        }
    }
    @HostListener('window:popstate', ['$event']) onPopState() {
        this.endgameService.surrenderGame(this.gameInProgress.gameType, this.gameInProgress);
    }
    @HostListener('window:keydown.i', ['$event']) onKeydownI(event: KeyboardEvent) {
        if (this.enableKeydownListener && !this.chatBoxContainer.nativeElement.contains(event.target) && !VideoReplayService.isPlayingReplay) {
            this.hintManagement(this.generalGameService.differenceRandomizer(this.gameInProgress));
        }
    }

    ngOnInit() {
        if (this.gameType === GameType.SoloClassic || this.gameType === GameType.MultiplayerClassic) this.getGameCard();
        this.chatService.joinRoom(this.gameInProgress.roomName);
        this.subscribers();
        this.gameService.cheatStatus = false;
        this.gameService.cheatStatusString = 'désactivé';
        VideoReplayService.isPlayingReplay = false;
        this.gameInProgress.gameType = this.gameType;
        if (this.refreshed) {
            this.endgameService.onRefreshed(this.gameInProgress);
        }
    }

    hintManagement(differenceNumber: number) {
        if (this.hintComponent.hintNumber > 0) {
            this.hintsComponent.removeHint();
            if (!VideoReplayService.isPlayingReplay) this.videoReplayService.logEvent(EventType.Hint, undefined, undefined, differenceNumber);
            this.gameService.drawHint(this.gameInProgress.differences[differenceNumber], this.gameInProgress, this.hintsComponent);
        }
    }

    subscribers() {
        this.foundDifferenceSubscription = this.multiplayerService.foundDifference.subscribe(async (data: Coordinate[]) => {
            this.videoReplayService.logEvent(EventType.OpponentClick, undefined, data);
            this.points = await this.gameService.correctClickOpponent({ coords: data, index: 0 }, this.gameInProgress, this.points);
        });
        this.surenderSubscription = this.multiplayerService.surender.subscribe(() => {
            this.endgameService.oponentHasGivenUp(this.gameInProgress.roomName, this.gameInProgress.gameType);
        });
        this.loserSubscription = this.multiplayerService.loser.subscribe(() => {
            this.endgameService.loseGame(this.gameInProgress, this.gameInProgress.roomName, this.gameInProgress.opponentUsername);
        });
        this.timeGameSubscription = this.timeGameSocketService.gameData.subscribe(async (data: Game) => {
            this.gameInProgress = await this.gameService.timeGameOnSubscription(data, this.gameInProgress);
            this.gameCardLoaded = true;
        });
        this.startReplaySubscription = this.videoReplayService.startReplaySubject.subscribe(({ roomName, speed }) => {
            this.hintComponent.resetHints();
            this.gameInProgress = this.gameService.startReplay(roomName, this.gameInProgress, speed);
        });
        this.restartReplaySubscription = this.videoReplayService.restartReplaySubject.subscribe(() => {
            this.togglePlayPause();
        });
        this.timeGameSettingsSubscription = this.timeGameSocketService.gameSetting.subscribe((data: TimeGameSetting) => {
            this.gameInProgress = this.gameService.timeGameSettingOnSubscription(data, this.gameInProgress);
        });
        this.timeOnAbandon = this.endgameService.timeAbandonSubject.subscribe(() => {
            this.gameInProgress.gameType = GameType.SoloTime;
            this.usernameRef.nativeElement.style.visibility = 'hidden';
            this.chatBox.disableAndHideContainer();
            this.hintComponent.makeButtonVisible();
            this.enableKeydownListener = true;
        });
        this.logCoordsReplaySubscription = this.videoReplayService.logCoordsReplaySubject.subscribe((event) => {
            this.logCoords(event);
        });
        this.cheatModeReplaySubscription = this.videoReplayService.cheatModeReplaySubject.subscribe((event) => {
            this.cheatButton(event);
        });
        this.timeGameLoseSubscription = this.timeGameSocketService.loseGame.subscribe(() => {
            this.endgameService.loseGame(this.gameInProgress, this.gameInProgress.roomName, this.gameInProgress.opponentUsername);
        });
        this.replayModeSubscription = this.endgameService.replaySubject.subscribe(() => {
            this.gameService.deactivateCheatStatus();
            this.showReplayContainer();
            this.disableEvents();
        });
        this.replayModeSubscriptionNthTime = this.endgameService.restartSubject.subscribe(() => {
            this.videoReplayService.restartWithoutDeletingTimer();
        });
        this.hintReplaySubscription = this.videoReplayService.hintReplaySubject.subscribe((differenceNumber: number) => {
            this.hintManagement(differenceNumber);
        });
        this.opponentClickReplaySubscription = this.videoReplayService.opponentReplaySubject.subscribe(async (data: Coordinate[]) => {
            this.points = await this.gameService.correctClickOpponent({ coords: data, index: 0 }, this.gameInProgress, this.points);
        });
        this.closeThirdHintSubscription = this.videoReplayService.closeThirdHintSubject.subscribe(() => {
            this.gameService.dialog.closeAll();
        });
        this.closedDialogSubscription = this.gameService.closedDialogSubject.subscribe(() => {
            this.videoReplayService.logEvent(EventType.CloseThirdHint);
        });
    }

    ngOnDestroy(): void {
        this.foundDifferenceSubscription.unsubscribe();
        this.surenderSubscription.unsubscribe();
        this.loserSubscription.unsubscribe();
        this.timeGameSubscription.unsubscribe();
        this.timeOnAbandon.unsubscribe();
        this.timeGameLoseSubscription.unsubscribe();
        this.logCoordsReplaySubscription.unsubscribe();
        this.startReplaySubscription.unsubscribe();
        this.replayModeSubscription.unsubscribe();
        this.cheatModeReplaySubscription.unsubscribe();
        this.timeGameSettingsSubscription.unsubscribe();
        this.restartReplaySubscription.unsubscribe();
        this.hintReplaySubscription.unsubscribe();
        this.opponentClickReplaySubscription.unsubscribe();
        this.closeThirdHintSubscription.unsubscribe();
        this.closedDialogSubscription.unsubscribe();
        this.replayModeSubscriptionNthTime.unsubscribe();
    }

    setupMultiplayerVue() {
        this.gameService.normalGameSetup(this.gameId, this.gameInProgress);
        this.gameInProgress.numberOfPlayer = NUMBER_OF_PLAYER_MULTIPLAYER;
        this.usernameRef.nativeElement.style.visibility = 'visible';
        this.pointsRef.nativeElement.style.visibility = 'visible';
        this.enableKeydownListener = false;
    }

    setupSingleplayer() {
        this.gameService.normalGameSetup(this.gameId, this.gameInProgress);
        this.gameInProgress.numberOfPlayer = NUMBER_OF_PLAYER_SINGLEPLAYER;
        this.usernameRef.nativeElement.style.visibility = 'hidden';
        this.pointsRef.nativeElement.style.visibility = 'hidden';
        this.chatBox.disableAndHideContainer();
        this.hintComponent.makeButtonVisible();
    }

    setupTimeSingleplayer() {
        this.gameService.timeGameSetup(this.gameInProgress);
        this.gameInProgress.numberOfPlayer = NUMBER_OF_PLAYER_SINGLEPLAYER;
        this.usernameRef.nativeElement.style.visibility = 'hidden';
        this.pointsRef.nativeElement.style.visibility = 'hidden';
        this.chatBox.disableAndHideContainer();
        this.hintComponent.makeButtonVisible();
    }

    setupTimeMultiplayerVue() {
        this.gameService.timeGameSetup(this.gameInProgress);
        this.gameInProgress.numberOfPlayer = NUMBER_OF_PLAYER_MULTIPLAYER;
        this.usernameRef.nativeElement.style.visibility = 'visible';
        this.pointsRef.nativeElement.style.visibility = 'hidden';
        this.enableKeydownListener = false;
    }

    async logCoords(event: MouseEvent) {
        const mousePosition: Vec2 | undefined = this.mouse.mouseHitDetect(event, this.playBack.playbackSpeed);
        if (mousePosition) {
            this.videoReplayService.logEvent(EventType.UserClick, event);
            const clickCoord: Vec2 = { x: mousePosition.x, y: mousePosition.y };
            if (
                this.generalGameService.leftAndRightPixelsAreDifferent(
                    this.gameInProgress.leftImagePixels,
                    this.gameInProgress.rightImagePixels,
                    clickCoord,
                )
            ) {
                const res = await this.gameService.correctClick(clickCoord, this.gameInProgress, this.points);
                this.points = res.points;
                this.gameInProgress = res.gameInProgress;
            } else this.gameService.errorClick(event, this.gameInProgress, clickCoord);
        }
    }

    ngAfterViewInit(): void {
        this.gameInProgress.gameType = this.gameType;
        if (this.gameInProgress.gameType === GameType.MultiplayerClassic) this.setupMultiplayerVue();
        if (this.gameInProgress.gameType === GameType.SoloClassic) this.setupSingleplayer();
        if (this.gameInProgress.gameType === GameType.SoloTime) this.setupTimeSingleplayer();
        if (this.gameInProgress.gameType === GameType.MultiplayerTime) this.setupTimeMultiplayerVue();
        this.gameInProgress.leftCanvas = this.canvas1;
        this.gameInProgress.rightCanvas = this.canvas2;
        this.chatService.joinAction(this.gameInProgress.username, this.gameInProgress.roomName); // save
        this.videoReplayService.startGame();
        if (this.gameService.cheatStatus) this.flashDifferencesBothScreens();
        this.enableEvents();
    }

    getGameCard(): void {
        this.comService.getGameCard(this.gameId).subscribe((data) => {
            this.gameInProgress.gameCard = data;
            this.gameCardLoaded = true;
        });
    }

    cheatButton(event: Event) {
        this.videoReplayService.logEvent(EventType.Cheat, event);
        this.gameService.reverseCheatStatus();
        this.flashDifferencesBothScreens();
    }

    async flashDifferencesBothScreens() {
        const ctx1 = this.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = this.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const promise1 = this.flashAllDifferences(ctx1, this.gameInProgress.leftImagePixels);
        const promise2 = this.flashAllDifferences(ctx2, this.gameInProgress.rightImagePixels);
        await Promise.all([promise1, promise2]);
    }

    flashAllDifferences(ctx: CanvasRenderingContext2D, lastImage: number[][][]) {
        let i = 0;
        const intervalId = setInterval(() => {
            if (this.gameService.cheatStatus) {
                if (i % 2 === 0) {
                    this.draw.drawPixels(this.gameInProgress.leftImagePixels, ctx);
                } else {
                    this.draw.drawPixels(this.gameInProgress.rightImagePixels, ctx);
                }
                i++;
            } else {
                clearInterval(intervalId);
                this.draw.drawPixels(lastImage, ctx);
            }
        }, CHEAT_FLASH_INTERVAL_MS);
    }

    togglePlayPause() {
        this.playBack.playPauseToolTip = this.videoReplayService.isPaused ? 'Pause' : 'Jouer';
        this.playBack.playPauseIcon = this.videoReplayService.isPaused ? 'pause' : 'play_arrow';
        this.points = this.videoReplayService.togglePlayPause(this.points, this.playBack.playbackSpeed);
    }

    showReplayContainer() {
        this.showReplayButtons = true;
    }

    disableEvents() {
        this.canvas1.nativeElement.removeEventListener('click', this.logCoords);
        this.canvas2.nativeElement.removeEventListener('click', this.logCoords);
        this.cheatButtonContainer.nativeElement.removeEventListener('click', this.cheatButton);
    }

    enableEvents() {
        this.canvas1.nativeElement.addEventListener('click', (event: MouseEvent) => {
            this.logCoords(event);
        });
        this.canvas2.nativeElement.addEventListener('click', (event: MouseEvent) => {
            this.logCoords(event);
        });
        this.cheatButtonContainer.nativeElement.addEventListener('click', (event: MouseEvent) => {
            this.cheatButton(event);
        });
    }
}
