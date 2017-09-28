import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, RequestMethod, ResponseContentType, Jsonp } from '@angular/http';
import { Subject, Observable } from 'rxjs';

const API_KEY = '458dac111e2456c40805cd838f4548c1';
const API_URL = 'https://api.soundcloud.com/';

@Injectable()
export class ApiService {

    constructor(
        private http: Http,
        private jsonp: Jsonp
    ) {}

    getQuerySuggestions(query: string) {
        return this.jsonp.request('https://suggestqueries.google.com/complete/search?callback=JSONP_CALLBACK&hl=en&ds=yt&client=youtube&q=' + query)
            .map(data => {
                let jsonData = data.json();
                let suggestions = jsonData[1];
                return suggestions.map(e => {
                    return e[0];
                });
            });
    }

    getTracks(query, limit, offset) {
        return this.http.get(API_URL + 'tracks?client_id=' + API_KEY + '&q=' + query + '&limit=' + limit + '&offset=' + offset)
            .map(response => response.json());
    }

    getStreamUrl(track) {
        return track.stream_url + '?client_id=' + API_KEY;
    }

}
