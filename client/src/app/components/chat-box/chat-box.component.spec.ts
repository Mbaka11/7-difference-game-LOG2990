/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ChatBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call chatService.messageSource.subscribe on ngOnInit', () => {
        const subscribeSpy = spyOn(component.chatService.messageSource, 'subscribe');
        component.ngOnInit();
        expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should remove inputContainerRef on disableAndHideContainer', () => {
        spyOn(component.inputContainerRef.nativeElement, 'remove');
        component.disableAndHideContainer();
        expect(component.inputContainerRef.nativeElement.remove).toHaveBeenCalled();
    });

    it('should return the roomGameName query parameter value on getRoomName', () => {
        const mockSnapshot = {
            queryParamMap: new Map([['roomGameName', 'testRoom']]),
        };
        component.route.snapshot = mockSnapshot as any;
        expect(component.getRoomName()).toEqual('testRoom');
    });

    it('should reset newMessage on sendMessage if message is sent', () => {
        component.newMessage = 'test message';
        component.sendMessage();
        expect(component.newMessage).toEqual('');
    });

    it('should not send a room message on sendMessage if newMessage is empty', () => {
        spyOn(component.chatService, 'sendRoomMessage');
        component.newMessage = '';
        component.sendMessage();
        expect(component.chatService.sendRoomMessage).not.toHaveBeenCalled();
    });

    it('should add new message to messages array on receiving new message', () => {
        const message = { message: 'test message', color: 'red', isSystem: false };
        component.chatService.messageSource.next(message);
        expect(component.messages).toEqual([message]);
    });
});
