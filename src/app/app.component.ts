import { Component, ViewChild } from '@angular/core';
import { Http, Headers, RequestOptions, Response, RequestMethod, ResponseContentType } from '@angular/http';
import { Subject } from 'rxjs';
declare var $;
declare var chrome;
declare var background;

import { ApiService } from './services/api.service';
import { DataService, Session } from './services/data.service';

const LIMIT = 10;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(
        public apiService: ApiService,
        public dataService: DataService
    ){}

    private background = (function() {
        if (chrome.extension) {
            return chrome.extension.getBackgroundPage().background;
        }
        return background;
    })();

    @ViewChild('searchInput') searchInput;
    @ViewChild('progress') progress;

    query: string;
    suggestions = [];
    tracks = [];
    showSuggestions: boolean;
    isLoadingMoreTracks: boolean;
    playingTrack: any;
    player: any;

    private offset: number = 0;
    private queries = new Subject<string>();
    private session: Session = new Session();


    ngOnInit() {
        // load previous session
        this.dataService.getData((data) => {
            console.log('previous session', data)
            if (data) {
                this.session = data;
                this.query = this.session.query;
                this.playingTrack = this.session.playingTrack;
                this.search(this.query);
                if (this.playingTrack) {
                    if (this.background.player) {
                        this.player = this.background.player;
                    } else {
                        this.player = this.background.play(this.apiService.getStreamUrl(this.playingTrack));
                    }
                    this.connectPlayer(this.player);
                }
            }
        });

        // query will be delayed for 0.5s until user finished typing.
        this.queries.debounceTime(500).distinctUntilChanged()
            .subscribe(query => {
                this.apiService.getQuerySuggestions(query).subscribe(data => {
                    this.suggestions = data;
                    this.showSuggestions = true;
                });
            });
    }

    onQueryChange() {
        this.queries.next(this.query);
    }

    clear() {
        this.query = '';
        this.showSuggestions = false;
        this.searchInput.nativeElement.focus();
    }

    search(query) {
        this.showSuggestions = false;
        this.query = query;
        this.offset = 0;
        this.apiService.getTracks(query, LIMIT, 0).subscribe(data => {
            this.tracks = data.filter(e => e.streamable).map(e => this.processTrackData(e));
        });
        this.session.query = query;
        this.updateSession();
    }

    onScroll($event) {
        // bottom reached, fetch the next page
        if ($event.target.scrollTop + $event.target.clientHeight >= $event.target.scrollHeight) {
            if (this.isLoadingMoreTracks) {
                // prevent too many requests
                return;
            }
            this.offset = this.offset + LIMIT;
            this.isLoadingMoreTracks = true;
            this.apiService.getTracks(this.query, LIMIT, this.offset).subscribe(data => {
                this.isLoadingMoreTracks = false;
                if (data && data.length > 0) {
                    Array.prototype.push.apply(this.tracks, data.filter(e => e.streamable).map(e => this.processTrackData(e)));
                }
            });
        }
    }

    private processTrackData(track) {
        let durationInSeconds = track.duration / 1000;
        let mins = Math.floor(durationInSeconds/60);
        let secs = Math.floor(durationInSeconds - mins*60);
        track.durationInMins = mins + ':' + secs;
        return track;
    }

    private updateSession() {
        this.dataService.storeData(this.session);
    }

    play(track) {
        if (track.playing) {
            return;
        }
        // update status for displaying
        this.tracks.forEach(e => e.playing = false);
        track.playing = true;
        this.playingTrack = track;

        // play the track
        let player = this.background.play(this.apiService.getStreamUrl(track));
        this.connectPlayer(player);

        this.session.playingTrack = track;
        this.updateSession();
    }

    private connectPlayer(player) {
        this.player = player;
        this.player.onplay = () => {
            // update track 's playing status
            if (this.playingTrack) {
                this.playingTrack.playing = true;
            }
        };
        this.player.onpause = () => {
            // update track 's playing status
            if (this.playingTrack) {
                this.playingTrack.playing = false;
            }

            // play next track if any
            if (this.player.ended) {
                let currentIndex = this.tracks.indexOf(this.playingTrack);
                let nextTrack = this.tracks[currentIndex + 1];
                if (nextTrack) {
                    this.play(nextTrack);
                }
            }
        };
        this.player.ontimeupdate = () => {
            // update progress bar's max and initial value
            this.progress.nativeElement.max = this.playingTrack.duration / 1000;
            this.progress.nativeElement.value = this.player.currentTime;

        };
    }

    pause(track) {
        track.playing = false;
        this.background.pause();
    }

    resumeTrack() {
        this.player.play();
    }

    pauseTrack() {
        this.player.pause();
    }

    onProgressClick(e) {
        let progressBar = e.currentTarget;
        let xPosition = e.pageX - progressBar.getBoundingClientRect().left;
        if (this.player) {
            // seek the playback to time based on the pointer's position within the progress bar
            this.player.currentTime = xPosition / progressBar.clientWidth * progressBar.max;
            if (this.player.paused) {
                this.player.play();
            }
        }
    }
}
