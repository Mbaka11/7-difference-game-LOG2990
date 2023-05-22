import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatService } from '@app/services/chat.service';
import { VideoReplayService } from '@app/services/video-replay.service';
import { Subject } from 'rxjs';
import { HintsDisplayComponent } from './hints-display.component';

describe('HintsDisplayComponent', () => {
    let component: HintsDisplayComponent;
    let fixture: ComponentFixture<HintsDisplayComponent>;
    let chatService: ChatService;
    let useHintSubject: Subject<unknown>;

    beforeEach(async () => {
        useHintSubject = new Subject<unknown>();
        chatService = jasmine.createSpyObj('ChatService', ['sendRoomMessage', 'sendRemoveHint', 'formatTime'], { useHint: useHintSubject });

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
            declarations: [HintsDisplayComponent],
            providers: [{ provide: ChatService, useValue: chatService }],
        }).compileComponents();

        fixture = TestBed.createComponent(HintsDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should remove a hint when useHint is called', () => {
        component.hints = [{ active: true }, { active: true }, { active: true }];
        useHintSubject.next(undefined);
        expect(component.hints).toEqual([{ active: false }, { active: true }, { active: true }]);
    });

    it('should not modify hintNumber when hints is an empty array', () => {
        component.hints = [];
        useHintSubject.next(undefined);
        expect(component.hintNumber).toBe(3);
    });

    it('should not modify hintNumber when no hints are active', () => {
        component.hints = [{ active: false }, { active: false }, { active: false }];
        useHintSubject.next(undefined);
        expect(component.hintNumber).toBe(3);
    });

    it('should return early when hintNumber is 0', () => {
        component.hintNumber = 0;
        component.removeHint();
        expect(component.chatService.sendRoomMessage).not.toHaveBeenCalled();
        expect(component.chatService.sendRemoveHint).not.toHaveBeenCalled();
    });

    it('should call sendRoomMessage and sendRemoveHint when hintNumber is greater than 0', () => {
        VideoReplayService.isPlayingReplay = false;
        component.hintNumber = 1;
        component.removeHint();
        expect(component.chatService.sendRoomMessage).toHaveBeenCalled();
        expect(component.chatService.sendRemoveHint).toHaveBeenCalled();
    });

    it('callParentMethod should call emit', () => {
        const emitSpy = spyOn(component.callParentMethodEvent, 'emit').and.stub();
        component.callParentMethod();
        expect(emitSpy).toHaveBeenCalled();
    });
});
