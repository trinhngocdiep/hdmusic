import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, RequestMethod } from '@angular/http';
import { Subject, Observable } from 'rxjs';

const SC_KEY = '458dac111e2456c40805cd838f4548c1'; // KyZEBUaphfHpKKZ9B0H9JsmvDULUPAkj
const YT_KEY = 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4';

@Injectable()
export class ApiService {

    constructor(
        private http: Http
    ) {}

    suggest(term: string) {
        return this.http.get('https://suggestqueries.google.com/complete/search?hl=en&client=firefox&q=' + term).map(data => data.json()[1]);
    }

    getTopTracks(offset) {
        let scQuery = 'https://api-v2.soundcloud.com/charts?kind=top&genre=soundcloud%3Agenres%3Aall-music&client_id=' + SC_KEY;
        if (offset) {
            // fetch next page
            if (offset.next_href) {
                scQuery = offset.next_href  + '&client_id=' + SC_KEY;
            } else {
                // no more result
                scQuery = null;
            }
        }
        if (scQuery) {
            return this.http.get(scQuery).map(response => {
                let data = response.json();
                let tracks = data.collection.map(e => e.track).filter(e => e.streamable).map(e => {
                    let durationInSeconds = e.duration / 1000;
                    return {
                        title: '[SoundCloud Top]' + e.title,
                        durationInSeconds: durationInSeconds,
                        durationInMinutes: formatDuration(durationInSeconds),
                        artwork_url: e.artwork_url,
                        stream_url: e.uri + '/stream?client_id=' + SC_KEY
                    };
                });
                return {
                    tracks: tracks,
                    offset: {
                        next_href: data.next_href
                    }
                }
            });
        }

        return Observable.of({
            tracks: [],
            offset: {
                next_href: null
            }
        });
    }

    search(query, offset) {
        let term = query.term;
        let scSearchResult = query.sc ? this.searchSc(term, offset) : Observable.of({
            tracks: [],
            next_href: null
        });
        let ytSearchResult = query.yt ? this.searchYt(term, offset) : Observable.of({
            tracks: [],
            pageToken: null
        });
        return Observable.forkJoin(scSearchResult, ytSearchResult)
            .map(data => {
                return {
                    tracks: data[0].tracks.concat(data[1].tracks),
                    offset: {
                        next_href: data[0].next_href,
                        pageToken: data[1].pageToken
                    }
                }
            });
    }

    private searchSc(term, offset) {
        let scQuery = 'https://api.soundcloud.com/tracks?linked_partitioning=1&limit=10&client_id=' + SC_KEY + '&q=' + term;
        if (offset) {
            // fetch next page
            if (offset.next_href) {
                scQuery = offset.next_href;
            } else {
                // no more result
                scQuery = null;
            }
        }
        if (scQuery) {
            return this.http.get(scQuery).map(response => {
                let data = response.json();
                let tracks = data.collection.filter(e => e.streamable).map(e => {
                    let durationInSeconds = e.duration / 1000;
                    return {
                        title: '[SoundCloud]' + e.title,
                        durationInSeconds: durationInSeconds,
                        durationInMinutes: formatDuration(durationInSeconds),
                        artwork_url: e.artwork_url,
                        stream_url: e.uri + '/stream?client_id=' + SC_KEY
                    };
                });
                return {
                    tracks: tracks,
                    next_href: data.next_href
                }
            });
        }

        return Observable.of({
            tracks: [],
            next_href: null
        });
    }

    private searchYt(term, offset) {
        let ytSearchQuery = 'https://www.googleapis.com/youtube/v3/search?key=' + YT_KEY + '&part=id&type=video&maxResults=10&q=' + term;
        if (offset) {
            // fetch next page
            if (offset.pageToken) {
                ytSearchQuery += '&pageToken=' + offset.pageToken;
            } else {
                // no more result
                ytSearchQuery = null;
            }
        }
        if (ytSearchQuery) {
            let nextPageToken;
            return this.http.get(ytSearchQuery)
                .map(response => {
                    let data = response.json();
                    nextPageToken = data.nextPageToken;
                    return data.items.map(e => e.id.videoId);
                })
                .flatMap(videoIds => {
                    return this.http.get('https://www.googleapis.com/youtube/v3/videos?key=' + YT_KEY + '&part=snippet,contentDetails,status&id=' + videoIds.join(','))
                        .map(response => {
                            let videos = response.json().items.filter(e => e.status.embeddable).map(e => {
                                let durationInSeconds = isoDurationToSeconds(e.contentDetails.duration);
                                return {
                                    title: '[YouTube]' + e.snippet.title,
                                    durationInSeconds: durationInSeconds,
                                    durationInMinutes: formatDuration(durationInSeconds),
                                    artwork_url: e.snippet.thumbnails.default.url,
                                    videoId: e.id
                                };
                            });
                            return {
                                tracks: videos,
                                pageToken: nextPageToken
                            };
                        });
                });
        }
        return Observable.of({
            tracks: [],
            pageToken: null
        });
    }
}

function isoDurationToSeconds(value: string) {
    var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    var hours = 0, minutes = 0, seconds = 0;

    if (reptms.test(value)) {
        var matches = reptms.exec(value);
        if (matches[1]) hours = Number(matches[1]);
        if (matches[2]) minutes = Number(matches[2]);
        if (matches[3]) seconds = Number(matches[3]);
        return hours * 3600  + minutes * 60 + seconds;
    }
    return 0;
}

function formatDuration(seconds) {
    let mins = Math.floor(seconds / 60);
    return mins + ':' + Math.floor(seconds - mins * 60);
}