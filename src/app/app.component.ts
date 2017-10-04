import { Component, ViewChild, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions, Response, RequestMethod, ResponseContentType } from '@angular/http';
import { Subject } from 'rxjs';
declare var $;
declare var chrome;
declare var background;

import { ApiService } from './services/api.service';

const LIMIT = 10;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    constructor(
        private ngZone: NgZone,
        public apiService: ApiService
    ){}

    @ViewChild('searchInput') searchInput;
    @ViewChild('progress') progress;

    state: any;
    player: any;

    suggestions = [];
    showSuggestions: boolean;
    isLoadingMoreTracks: boolean;

    private offset: number = 0;
    private queries = new Subject<string>();

    ngOnInit() {
        // connect to background script
        let backgroundScript = (function() {
            if (chrome.extension) {
                return chrome.extension.getBackgroundPage().background;
            }
            return background;
        })();
        this.state = backgroundScript.state;
        this.player = backgroundScript.player;
        this.player.onPlay = () => {
            this.ngZone.run(() => {
                console.log('onPlay');
                this.player.playing = true;
            })
        };
        this.player.onPause = () => {
            this.ngZone.run(() => {
                console.log('onPause');
                this.player.playing = false;
            })
        };
        this.player.onProgress = (track, currentTime) => {
            // update progress bar's max and initial value
            this.progress.nativeElement.max = track.duration / 1000;
            this.progress.nativeElement.value = currentTime;
        };

        // query will be delayed for 0.5s until user finished typing.
        this.queries.debounceTime(500).distinctUntilChanged()
            .subscribe(query => {
                this.apiService.getQuerySuggestions(query).subscribe(data => {
                    this.suggestions = data;
                    this.showSuggestions = true;
                });
            });
    }

    ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
    }

    onQueryChange() {
        this.queries.next(this.state.query);
    }

    clear() {
        this.state.query = '';
        this.showSuggestions = false;
        this.searchInput.nativeElement.focus();
    }

    search(query) {
        this.showSuggestions = false;
        this.state.query = query;
        this.offset = 0;
        this.apiService.getTracks(query, LIMIT, 0).subscribe(data => {
            this.state.tracks = AppComponent.processTrackData(data);
        });
        this.state.query = query;
    }

    onScroll($event) {
        // bottom reached, fetch the next page
        // need a small buffer for different browsers
        if ($event.target.scrollTop + $event.target.clientHeight + 20 >= $event.target.scrollHeight) {
            if (this.isLoadingMoreTracks) {
                // prevent too many requests
                return;
            }
            this.offset = this.offset + LIMIT;
            this.isLoadingMoreTracks = true;
            this.apiService.getTracks(this.state.query, LIMIT, this.offset).subscribe(data => {
                this.isLoadingMoreTracks = false;
                if (data && data.length > 0) {
                    Array.prototype.push.apply(this.state.tracks, AppComponent.processTrackData(data));
                }
            });
        }
    }

    play(track) {
        if (track.playing) {
            return;
        }
        // update track status for UI
        this.state.tracks.forEach(e => e.playing = false);
        track.playing = true;

        // play the track
        this.player.play(track);
    }

    onProgressClick(e) {
        let progressBar = e.currentTarget;
        let xPosition = e.pageX - progressBar.getBoundingClientRect().left;
        let time = xPosition / progressBar.clientWidth * progressBar.max;
        this.player.seek(time);
    }

    private static processTrackData(data) {
        return data.filter(e => e.streamable).map(track => {
            let durationInSeconds = track.duration / 1000;
            let mins = Math.floor(durationInSeconds/60);
            let secs = Math.floor(durationInSeconds - mins*60);
            track.durationInMins = mins + ':' + secs;
            return track;
        });
    }

}
