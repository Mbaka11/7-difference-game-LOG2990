/* eslint-disable @typescript-eslint/no-magic-numbers */
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export const DEFAULT_HEIGHT = 480;
export const DEFAULT_WIDTH = 640;
export const DEFAULT_SIZE = 921654;
export const MAX_NUMBER_OF_DIFF = 9;
export const MIN_NUMBER_OF_DIFF = 3;

export const CHEAT_FLASH_INTERVAL_MS = 125;
export const FLASH_INTERVAL_MS = 250;
export const MAX_FLASH_ITERATIONS = 4;

export const FIRST_HINT_COUNT = 2;
export const FIRST_HINT_PIXEL_X = 160;
export const FIRST_HINT_PIXEL_Y = 120;
export const SECOND_HINT_COUNT = 1;
export const THIRD_HINT_COUNT = 0;
export const SECOND_HINT_PIXEL_X = 40;
export const SECOND_HINT_PIXEL_Y = 30;

export const TIME_MULTIPLIER = 10;

export const PIXEL_BYTE_SIZE = 4;
export const RED_PIXEL = [255, 0, 0, 255];
export const ORANGE_PIXEL = [255, 165, 0, 255];
export const YELLOW_PIXEL = [255, 255, 0, 255];
export const BROWN_PIXEL = [165, 42, 42, 255];
export const PINK_PIXEL = [255, 192, 203, 255];
export const PURPLE_PIXEL = [128, 0, 128, 255];
export const BLUE_PIXEL = [0, 0, 255, 255];
export const GREEN_PIXEL = [0, 128, 0, 255];
export const WHITE_PIXEL = [255, 255, 255, 255];
export const BLACK_PIXEL = [0, 0, 0, 255];
export const TRANSPARENT_PIXEL = [0, 0, 0, 0];

export const RADIUS: number[] = [0, 3, 9, 15];

export const PLAYBACK_SPEED_X1 = 1;
export const PLAYBACK_SPEED_X2 = 2;
export const PLAYBACK_SPEED_X4 = 4;

export const NO_TIME = -1;

export const FIRST_HINT_PIXEL = 100;

export enum PaintOptions {
    Pencil,
    Rectangle,
    Eraser,
}

export enum GameType {
    SoloClassic,
    MultiplayerClassic,
    SoloTime,
    MultiplayerTime,
}
