import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '@app/services/chat.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements AfterViewChecked, OnInit {
    @ViewChild('inputContainer') inputContainerRef: ElementRef<HTMLDivElement>;
    @ViewChild('scrollMe') private myScrollItem: ElementRef;

    messages: { message: string; color?: string; isSystem: boolean }[] = [];
    newMessage: string;
    username: string;

    private previousScrollHeight: ElementRef;

    constructor(public chatService: ChatService, public socketService: SocketClientService, public route: ActivatedRoute) {
        this.username = this.getGameUsername();
    }

    ngOnInit(): void {
        this.chatService.messageSource.subscribe(({ message, color, isSystem }) => {
            this.messages.push({ message, color, isSystem });
        });
    }

    disableAndHideContainer() {
        this.inputContainerRef.nativeElement.remove();
    }

    getRoomName(): string {
        return this.route.snapshot.queryParamMap.get('roomGameName') as string;
    }

    getGameUsername(): string {
        return this.route.snapshot.queryParamMap.get('username') as string;
    }

    sendMessage() {
        const message = {
            message: `${this.chatService.formatTime(new Date())} ${this.username}: ${this.newMessage} `,
            color: 'black',
            isSystem: false,
        };

        const message2 = this.newMessage.trim();
        if (!message2) {
            return;
        }

        this.chatService.sendRoomMessage(this.getRoomName(), message.message, 'onPlayerMessage');
        this.newMessage = '';
    }

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        if (this.myScrollItem.nativeElement.scrollHeight !== this.previousScrollHeight) {
            this.myScrollItem.nativeElement.scrollTop = this.myScrollItem.nativeElement.scrollHeight;
            this.previousScrollHeight = this.myScrollItem.nativeElement.scrollHeight;
        }
    }
}
