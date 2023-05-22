import { TestBed } from '@angular/core/testing';
import { AudioClickService } from './audio-click.service';

describe('AudioClickService', () => {
    let service: AudioClickService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AudioClickService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should play the right audio', () => {
        spyOn(HTMLMediaElement.prototype, 'play');
        service.playRight();
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('should play a random wrong audio', () => {
        spyOn(HTMLMediaElement.prototype, 'play');
        service.playWrong();
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('should increment the number of finds', () => {
        service.incrementFinds();
        expect(service.numberErrors).toEqual(1);
    });
});
