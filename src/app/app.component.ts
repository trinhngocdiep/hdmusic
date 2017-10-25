import { Component, ViewChild, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions, Response, RequestMethod, ResponseContentType } from '@angular/http';
import { Subject } from 'rxjs';
declare var $;
declare var chrome;
declare var background;

import { ApiService } from './services/api.service';

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
    searching: boolean;
    scEnable = true;
    ytEnable = true;

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
                this.player.playing = true;
            })
        };
        this.player.onPause = () => {
            this.ngZone.run(() => {
                this.player.playing = false;
            })
        };
        this.player.onProgress = (track, currentTime) => {
            // update progress bar's max and initial value
            this.progress.nativeElement.max = track.durationInSeconds;
            this.progress.nativeElement.value = currentTime;
        };

        // suggest for search
        // query will be delayed for 0.5s until user finished typing.
        this.queries.debounceTime(500).distinctUntilChanged()
            .subscribe(term => {
                this.apiService.suggest(term).subscribe(data => {
                    if (data && data.length > 0) {
                        this.suggestions = data;
                        this.showSuggestions = true;
                    }
                });
            });

        // load top tracks if no previous tracks found
        if (!this.state.tracks || this.state.tracks.length == 0) {
            this.state.offset = null;
            this.state.isTopTracks = true;
            this.searching = true;
            this.apiService.getTopTracks(this.state.offset)
                .finally(() => this.searching = false)
                .subscribe(data => {
                    this.state.offset = data.offset;
                    this.state.tracks = data.tracks;
                });
        }
    }

    ngAfterViewInit() {
        this.searchInput.nativeElement.focus();
    }

    onQueryChange() {
        this.queries.next(this.state.query.term);
    }

    clear() {
        this.state.query.term = '';
        this.showSuggestions = false;
        this.searchInput.nativeElement.focus();
    }

    cancelSearch() {
        this.showSuggestions = false;
        this.searchInput.nativeElement.blur();
    }

    search(term) {
        this.showSuggestions = false;
        this.state.query.term = term;
        this.state.offset = null;
        this.state.isTopTracks = false;
        this.searching = true;
        this.apiService.search(this.state.query, this.state.offset)
            .finally(() => this.searching = false)
            .subscribe(data => {
                this.state.offset = data.offset;
                this.state.tracks = data.tracks;
            });
    }

    onScroll($event) {
        // bottom reached, fetch the next page
        // need a small buffer for different browsers
        if ($event.target.scrollTop + $event.target.clientHeight + 20 >= $event.target.scrollHeight) {
            if (this.isLoadingMoreTracks) {
                // prevent too many requests
                return;
            }
            this.isLoadingMoreTracks = true;
            let apiCall = this.state.isTopTracks ? this.apiService.getTopTracks(this.state.offset) : this.apiService.search(this.state.query, this.state.offset);
            apiCall.subscribe(data => {
                this.isLoadingMoreTracks = false;
                this.state.offset = data.offset;
                Array.prototype.push.apply(this.state.tracks, data.tracks);
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

}
