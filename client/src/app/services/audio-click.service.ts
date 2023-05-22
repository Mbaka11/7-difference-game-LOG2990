import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AudioClickService {
    numberErrors: number = 0;

    playRight() {
        const audio = new Audio();
        audio.src = './assets/sounds/right1.mp3';
        audio.load();
        audio.play();
    }

    playWrong() {
        const audioSources = ['./assets/sounds/wrong1.mp3', './assets/sounds/wrong2.mp3', './assets/sounds/wrong3.mp3'];
        const audioArray = [];
        for (const src of audioSources) {
            const audio = new Audio();
            audio.src = src;
            audio.load();
            audioArray.push(audio);
        }
        const randomIndex = Math.floor(Math.random() * audioArray.length);
        audioArray[randomIndex].play();
    }

    incrementFinds() {
        this.numberErrors += 1;
        return this.numberErrors;
    }
}
