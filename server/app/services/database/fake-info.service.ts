import { Podium } from '@common/podium';
const UPPER_BOUND = 19;
const LOWER_BOUND = 19;

export class FakeInformation {
    namesList: string[] = [
        'Adam',
        'Benjamin',
        'Catherine',
        'David',
        'Elizabeth',
        'Frank',
        'Gabriel',
        'Hannah',
        'Isaac',
        'Julia',
        'Kenneth',
        'Lucy',
        'Michael',
        'Nora',
        'Oliver',
        'Penelope',
        'Quentin',
        'Rachel',
        'Samuel',
        'Teresa',
        'Ursula',
        'Victor',
        'Wendy',
        'Xavier',
        'Yvonne',
        'Zachary',
        'Abigail',
        'Bryan',
        'Caroline',
        'Daniel',
    ];

    getRandomTime(): number[] {
        const numberOne = Math.floor(Math.random() * UPPER_BOUND) + LOWER_BOUND;
        const numberTwo = Math.floor(Math.random() * UPPER_BOUND) + LOWER_BOUND;
        const numberThree = Math.floor(Math.random() * UPPER_BOUND) + LOWER_BOUND;
        const threeRandomTimes: number[] = [numberOne, numberTwo, numberThree];
        threeRandomTimes.sort((a, b) => a - b);
        return threeRandomTimes;
    }

    getRandomName(): string {
        return this.namesList[Math.floor(Math.random() * this.namesList.length)];
    }

    createFakePodium(gameId: number): Podium {
        const randomTimesSolo = this.getRandomTime();
        const randomTimesMult = this.getRandomTime();
        const newPodium: Podium = {
            gameId,
            solo: {
                first: { time: randomTimesSolo[0], name: this.getRandomName() },
                second: { time: randomTimesSolo[1], name: this.getRandomName() },
                third: { time: randomTimesSolo[2], name: this.getRandomName() },
            },
            multiplayer: {
                first: { time: randomTimesMult[0], name: this.getRandomName() },
                second: { time: randomTimesMult[1], name: this.getRandomName() },
                third: { time: randomTimesMult[2], name: this.getRandomName() },
            },
        };
        return newPodium;
    }
}
