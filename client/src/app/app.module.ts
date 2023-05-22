import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeadbarComponent } from '@app/components/headbar/headbar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ConfigButtonsComponent } from './components/config-buttons/config-buttons.component';
import { DialogMessageComponent } from './components/dialog-message/dialog-message.component';
import { DifficultyLabelComponent } from './components/difficulty-label/difficulty-label.component';
import { FormComponent } from './components/form/form.component';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { GameComponent } from './components/game/game.component';
import { GamecardComponent } from './components/gamecard/gamecard.component';
import { HintsDisplayComponent } from './components/hints-display/hints-display.component';
import { HistoryInputComponent } from './components/history-input/history-input.component';
import { HistoryComponent } from './components/history/history.component';
import { InformationCardComponent } from './components/information-card/information-card.component';
import { ModaleMainPageComponent } from './components/modals/modale-main-page/modale-main-page.component';
import { PaintComponent } from './components/paint/paint.component';
import { PlayerNameDialogComponent } from './components/player-name-dialog/player-name-dialog.component';
import { ReplayDialogMessageComponent } from './components/replay-dialog-message/replay-dialog-message.component';
import { StepperConstantsComponent } from './components/stepper-constants/stepper-constants.component';
import { ThirdHintComponent } from './components/third-hint/third-hint.component';
import { TimerComponent } from './components/timer/timer.component';
import { TopPodiumComponent } from './components/top-podium/top-podium.component';
import { TwoButtonDialogMessageComponent } from './components/two-button-dialog-message/two-button-dialog-message.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { CreationPageComponent } from './pages/creation-page/creation-page.component';
import { GameMultiplayerPageComponent } from './pages/game-multiplayer-page/game-multiplayer-page.component';
import { GameSoloPageComponent } from './pages/game-solo-page/game-solo-page.component';
import { SelectGamePageComponent } from './pages/select-game-page/select-game-page.component';
import { TimeGameMultiplayerPageComponent } from './pages/time-game-multiplayer-page/time-game-multiplayer-page.component';
import { TimeGameSoloPageComponent } from './pages/time-game-solo-page/time-game-solo-page.component';
import { WaitingRoomComponent } from './pages/waiting-room/waiting-room.component';
import { AudioClickService } from './services/audio-click.service';

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        ConfigurationPageComponent,
        CanvasComponent,
        PaintComponent,
        GameSoloPageComponent,
        InformationCardComponent,
        DifficultyLabelComponent,
        TimerComponent,
        HeadbarComponent,
        ConfigButtonsComponent,
        GameConstantsComponent,
        StepperConstantsComponent,
        HistoryComponent,
        HistoryInputComponent,
        TopPodiumComponent,
        CreationPageComponent,
        SelectGamePageComponent,
        GamecardComponent,
        ModaleMainPageComponent,
        FormComponent,
        HintsDisplayComponent,
        ChatBoxComponent,
        PlayerNameDialogComponent,
        WaitingRoomComponent,
        GameComponent,
        GameMultiplayerPageComponent,
        DialogMessageComponent,
        TwoButtonDialogMessageComponent,
        ReplayDialogMessageComponent,
        TimeGameSoloPageComponent,
        TimeGameMultiplayerPageComponent,
        ThirdHintComponent,
    ],
    providers: [AudioClickService],
    bootstrap: [AppComponent],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatSlideToggleModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
