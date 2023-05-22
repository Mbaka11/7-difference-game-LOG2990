import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MIN_NUMBER_OF_DIFF } from '@app/common/constants';
import { ChatService } from '@app/services/chat.service';
import { GameService } from '@app/services/game.service';
import { VideoReplayService } from '@app/services/video-replay.service';

const HINT_NOT_FOUND_INDEX = -1;

@Component({
    selector: 'app-hints-display',
    templateUrl: './hints-display.component.html',
    styleUrls: ['./hints-display.component.scss'],
})
export class HintsDisplayComponent implements OnInit {
    @Output() callParentMethodEvent = new EventEmitter();
    @ViewChild('hintButton') hintButton: ElementRef<HTMLDivElement>;
    hintNumber = MIN_NUMBER_OF_DIFF;
    hints = [{ active: true }, { active: true }, { active: true }];
    username: string;

    constructor(public chatService: ChatService, private route: ActivatedRoute, public gameService: GameService) {
        this.username = this.getGameUsername();
    }

    ngOnInit(): void {
        this.chatService.useHint.subscribe(() => {
            if (this.hints.length === 0) {
                return;
            }

            const hintIndex = this.hints.findIndex((hint) => hint.active === true);

            if (hintIndex === HINT_NOT_FOUND_INDEX) {
                return;
            }

            this.hints[hintIndex].active = false;
        });
    }

    makeButtonVisible(): void {
        // this.hintButton.nativeElement.style.visibility = 'visible';
    }

    getRoomName(): string {
        return this.route.snapshot.queryParamMap.get('roomGameName') as string;
    }

    getGameUsername(): string {
        return this.route.snapshot.queryParamMap.get('username') as string;
    }

    removeHint() {
        if (this.hintNumber === 0) {
            return;
        }
        const message = `${this.chatService.formatTime(new Date())} ${this.username} a utilisé un indice. Il en reste ${this.hintNumber - 1}.`;
        this.hintNumber--;
        if (!VideoReplayService.isPlayingReplay) {
            this.chatService.sendRoomMessage(this.getRoomName(), message, 'onHint');
            this.chatService.sendRemoveHint(this.getRoomName());
        }
    }

    callParentMethod() {
        this.callParentMethodEvent.emit();
    }

    resetHints() {
        this.hints = [{ active: true }, { active: true }, { active: true }];
        this.hintNumber = MIN_NUMBER_OF_DIFF;
    }
}
