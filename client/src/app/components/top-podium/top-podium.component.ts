import { Component, Input, OnInit } from '@angular/core';
import { Podium } from '@app/interfaces/podium';
import { CommunicationService } from '@app/services/communication.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-top-podium',
    templateUrl: './top-podium.component.html',
    styleUrls: ['./top-podium.component.scss'],
})
export class TopPodiumComponent implements OnInit {
    @Input() gameId: number;
    podium: Podium | undefined;
    getPodiumByIdSubscription: Subscription;

    constructor(private comService: CommunicationService, private socketClientService: SocketClientService) {}

    ngOnInit(): void {
        this.getPodiumByIdSubscription = this.comService.getPodiumById(this.gameId).subscribe((podium: Podium) => {
            this.podium = podium;
        });

        this.socketClientService.socket.on('BroadcastPodium', this.callbackOnBroadcastPodium);
    }

    callbackOnBroadcastPodium = (podium: Podium): void => {
        if (podium.gameId === this.gameId) this.podium = podium;
    };

    onDestroy(): void {
        this.getPodiumByIdSubscription.unsubscribe();
    }
}
