import {sleep} from "k6";

export function randomSleep(min: number, max: number) {
    const sleepTime = Math.random() * (max - min) + min;
    sleep(sleepTime);
}
