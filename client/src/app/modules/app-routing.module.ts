import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GameMultiplayerPageComponent } from '@app/pages/game-multiplayer-page/game-multiplayer-page.component';
import { GameSoloPageComponent } from '@app/pages/game-solo-page/game-solo-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectGamePageComponent } from '@app/pages/select-game-page/select-game-page.component';
import { TimeGameMultiplayerPageComponent } from '@app/pages/time-game-multiplayer-page/time-game-multiplayer-page.component';
import { TimeGameSoloPageComponent } from '@app/pages/time-game-solo-page/time-game-solo-page.component';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'creation', component: CreationPageComponent },
    { path: 'configuration', component: ConfigurationPageComponent },
    { path: 'creation', component: CreationPageComponent },
    { path: 'gamesolo', component: GameSoloPageComponent },
    { path: 'time-gamesolo', component: TimeGameSoloPageComponent },
    { path: 'time-gamemultiplayer', component: TimeGameMultiplayerPageComponent },
    { path: 'gamemultiplayer', component: GameMultiplayerPageComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: 'selectgame', component: SelectGamePageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
