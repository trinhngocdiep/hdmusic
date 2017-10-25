import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';

declare var chrome;

const STORAGE_KEY = 'diep-data';

@Injectable()
export class DataService {

    constructor(
        private ngZone: NgZone
    ) {}

    storeData(data) {
        if (chrome && chrome.storage) {
            chrome.storage.local.set({[STORAGE_KEY]: data});
            return;
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    getData(callback) {
        if (chrome && chrome.storage) {
            chrome.storage.local.get(STORAGE_KEY, (data) => {
                this.ngZone.run(() => {
                    callback(data[STORAGE_KEY]);
                });
            });
            return;
        }
        callback(JSON.parse(sessionStorage.getItem(STORAGE_KEY)));
    }

}

export class Session {
    query = null;
    playingTrack = null;
}
