/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
import { Podium } from '@common/podium';
import { FakeInformation } from './fake-info.service';

describe('FakeInformation', () => {
    let fakeInfo: FakeInformation;

    beforeEach(() => {
        fakeInfo = new FakeInformation();
    });

    describe('getRandomTime()', () => {
        test('should return an array of three numbers sorted in ascending order', () => {
            const result = fakeInfo.getRandomTime();

            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBe(3);
            expect(result).toEqual(result.slice().sort((a, b) => a - b));
        });
    });
    describe('getRandomName()', () => {
        test('should return a string that is one of the names in the namesList array', () => {
            const result = fakeInfo.getRandomName();

            expect(fakeInfo.namesList).toContain(result);
        });
    });
    describe('createFakePodium()', () => {
        test('should return an object with the correct shape and values', () => {
            const result = fakeInfo.createFakePodium(123);

            expect(result).toBeInstanceOf(Object);
            expect(result).toEqual(
                expect.objectContaining({
                    gameId: 123,
                    solo: expect.any(Object),
                    multiplayer: expect.any(Object),
                }),
            );
            const podium: Podium = result;
            expect(podium.solo).toEqual(
                expect.objectContaining({
                    first: expect.any(Object),
                    second: expect.any(Object),
                    third: expect.any(Object),
                }),
            );

            expect(podium.multiplayer).toEqual(
                expect.objectContaining({
                    first: expect.any(Object),
                    second: expect.any(Object),
                    third: expect.any(Object),
                }),
            );

            expect(podium.solo.first).toEqual(
                expect.objectContaining({
                    time: expect.any(Number),
                    name: expect.any(String),
                }),
            );

            expect(podium.solo.second).toEqual(
                expect.objectContaining({
                    time: expect.any(Number),
                    name: expect.any(String),
                }),
            );

            expect(podium.solo.third).toEqual(
                expect.objectContaining({
                    time: expect.any(Number),
                    name: expect.any(String),
                }),
            );

            expect(podium.multiplayer.first).toEqual(
                expect.objectContaining({
                    time: expect.any(Number),
                    name: expect.any(String),
                }),
            );

            expect(podium.multiplayer.second).toEqual(
                expect.objectContaining({
                    time: expect.any(Number),
                    name: expect.any(String),
                }),
            );

            expect(podium.multiplayer.third).toEqual(
                expect.objectContaining({
                    time: expect.any(Number),
                    name: expect.any(String),
                }),
            );
        });
    });
});
