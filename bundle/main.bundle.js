webpackJsonp([1],{

/***/ "../../../../../src async recursive":
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = "../../../../../src async recursive";

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<main>\r\n    <!--search box-->\r\n    <div class=\"search\">\r\n        <div class=\"input-container\">\r\n            <input [class.filled]=\"state.query\" #searchInput type=\"text\" [(ngModel)]=\"state.query\" (ngModelChange)=\"onQueryChange()\" (keyup.enter)=\"search(state.query)\">\r\n            <label>Find your music</label>\r\n            <span class=\"clear fa fa-times-circle-o\" *ngIf=\"state.query\" (click)=\"clear()\"></span>\r\n            <span class=\"clear fa fa-times-circle-o\" *ngIf=\"state.query\" (click)=\"clear()\"></span>\r\n        </div>\r\n        <div class=\"suggestions\" *ngIf=\"showSuggestions\">\r\n            <div class=\"suggestion\" *ngFor=\"let e of suggestions\" (click)=\"search(e)\">{{e}}</div>\r\n        </div>\r\n    </div>\r\n\r\n    <!--track list-->\r\n    <div #trackList class=\"track-list\" (scroll)=\"onScroll($event)\">\r\n        <div class=\"track\" [class.playing]=\"track.playing\" *ngFor=\"let track of state.tracks\" (click)=\"play(track)\" [title]=\"track.title\">\r\n            <div class=\"artwork\">\r\n                <img [src]=\"track.artwork_url || 'https://i1.sndcdn.com/artworks-000135613276-kkqr5r-large.jpg'\">\r\n            </div>\r\n            <div class=\"title\">{{track.title}}</div>\r\n            <div class=\"duration\">{{track.durationInMins}}</div>\r\n        </div>\r\n        <div class=\"loading\" [class.show]=\"isLoadingMoreTracks\">\r\n            <span class=\"fa fa-spinner fa-pulse\"></span>\r\n            <span>Slow down, motherfucker...</span>\r\n        </div>\r\n    </div>\r\n\r\n    <!--the player-->\r\n    <!--<div class=\"player\" [class.show]=\"state.currentTrack\">\r\n        <div class=\"controls\">\r\n            <div class=\"title full\">\r\n                <div class=\"dancing\" [title]=\"state.currentTrack?.title\">{{state.currentTrack?.title}}</div>\r\n            </div>\r\n            <span class=\"fa fa-play-circle\" *ngIf=\"!player.playing\" (click)=\"player.resume()\"></span>\r\n            <span class=\"fa fa-pause-circle\" *ngIf=\"player.playing\" (click)=\"player.pause()\"></span>\r\n            <progress #progress (click)=\"onProgressClick($event)\"></progress>\r\n        </div>\r\n    </div>-->\r\n\r\n    <div class=\"player-wrapper\" [class.show]=\"state.currentTrack\">\r\n        <div class=\"player\">\r\n            <div class=\"title\">\r\n                <div class=\"dancing\" [title]=\"state.currentTrack?.title\">{{state.currentTrack?.title}}</div>\r\n            </div>\r\n            <div class=\"controls\">\r\n                <span class=\"fa fa-step-backward\" (click)=\"player.previous()\"></span>\r\n                <span class=\"fa fa-play\" *ngIf=\"!player.playing\" (click)=\"player.resume()\"></span>\r\n                <span class=\"fa fa-pause\" *ngIf=\"player.playing\" (click)=\"player.pause()\"></span>\r\n                <span class=\"fa fa-step-forward\" (click)=\"player.next()\"></span>\r\n            </div>\r\n            <progress #progress class=\"progress\" (click)=\"onProgressClick($event)\"></progress>\r\n            <div class=\"volume\">\r\n                <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" [(ngModel)]=\"state.volume\" (ngModelChange)=\"player.setVolume(state.volume)\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n</main>"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs__ = __webpack_require__("../../../../rxjs/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_rxjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_api_service__ = __webpack_require__("../../../../../src/app/services/api.service.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var LIMIT = 10;
var AppComponent = AppComponent_1 = (function () {
    function AppComponent(ngZone, apiService) {
        this.ngZone = ngZone;
        this.apiService = apiService;
        this.suggestions = [];
        this.offset = 0;
        this.queries = new __WEBPACK_IMPORTED_MODULE_1_rxjs__["Subject"]();
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        // connect to background script
        var backgroundScript = (function () {
            if (chrome.extension) {
                return chrome.extension.getBackgroundPage().background;
            }
            return background;
        })();
        this.state = backgroundScript.state;
        this.player = backgroundScript.player;
        this.player.onPlay = function () {
            _this.ngZone.run(function () {
                console.log('onPlay');
                _this.player.playing = true;
            });
        };
        this.player.onPause = function () {
            _this.ngZone.run(function () {
                console.log('onPause');
                _this.player.playing = false;
            });
        };
        this.player.onProgress = function (track, currentTime) {
            // update progress bar's max and initial value
            _this.progress.nativeElement.max = track.duration / 1000;
            _this.progress.nativeElement.value = currentTime;
        };
        // query will be delayed for 0.5s until user finished typing.
        this.queries.debounceTime(500).distinctUntilChanged()
            .subscribe(function (query) {
            _this.apiService.getQuerySuggestions(query).subscribe(function (data) {
                _this.suggestions = data;
                _this.showSuggestions = true;
            });
        });
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        this.searchInput.nativeElement.focus();
    };
    AppComponent.prototype.onQueryChange = function () {
        this.queries.next(this.state.query);
    };
    AppComponent.prototype.clear = function () {
        this.state.query = '';
        this.showSuggestions = false;
        this.searchInput.nativeElement.focus();
    };
    AppComponent.prototype.search = function (query) {
        var _this = this;
        this.showSuggestions = false;
        this.state.query = query;
        this.offset = 0;
        this.apiService.getTracks(query, LIMIT, 0).subscribe(function (data) {
            _this.state.tracks = AppComponent_1.processTrackData(data);
        });
        this.state.query = query;
    };
    AppComponent.prototype.onScroll = function ($event) {
        var _this = this;
        // bottom reached, fetch the next page
        // need a small buffer for different browsers
        if ($event.target.scrollTop + $event.target.clientHeight + 20 >= $event.target.scrollHeight) {
            if (this.isLoadingMoreTracks) {
                // prevent too many requests
                return;
            }
            this.offset = this.offset + LIMIT;
            this.isLoadingMoreTracks = true;
            this.apiService.getTracks(this.state.query, LIMIT, this.offset).subscribe(function (data) {
                _this.isLoadingMoreTracks = false;
                if (data && data.length > 0) {
                    Array.prototype.push.apply(_this.state.tracks, AppComponent_1.processTrackData(data));
                }
            });
        }
    };
    AppComponent.prototype.play = function (track) {
        if (track.playing) {
            return;
        }
        // update track status for UI
        this.state.tracks.forEach(function (e) { return e.playing = false; });
        track.playing = true;
        // play the track
        this.player.play(track);
    };
    AppComponent.prototype.onProgressClick = function (e) {
        var progressBar = e.currentTarget;
        var xPosition = e.pageX - progressBar.getBoundingClientRect().left;
        var time = xPosition / progressBar.clientWidth * progressBar.max;
        this.player.seek(time);
    };
    AppComponent.processTrackData = function (data) {
        return data.filter(function (e) { return e.streamable; }).map(function (track) {
            var durationInSeconds = track.duration / 1000;
            var mins = Math.floor(durationInSeconds / 60);
            var secs = Math.floor(durationInSeconds - mins * 60);
            track.durationInMins = mins + ':' + secs;
            return track;
        });
    };
    return AppComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])('searchInput'),
    __metadata("design:type", Object)
], AppComponent.prototype, "searchInput", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_14" /* ViewChild */])('progress'),
    __metadata("design:type", Object)
], AppComponent.prototype, "progress", void 0);
AppComponent = AppComponent_1 = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_15" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__("../../../../../src/app/app.component.html")
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* NgZone */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* NgZone */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__services_api_service__["a" /* ApiService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_api_service__["a" /* ApiService */]) === "function" && _b || Object])
], AppComponent);

var AppComponent_1, _a, _b;
//# sourceMappingURL=C:/Users/COMPUTER/project/music/src/app.component.js.map

/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("../../../common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__("../../../http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_forms__ = __webpack_require__("../../../forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_platform_browser__ = __webpack_require__("../../../platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_router__ = __webpack_require__("../../../router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__("../../../../../src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__services_api_service__ = __webpack_require__("../../../../../src/app/services/api.service.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};








var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_5__angular_router__["a" /* RouterModule */],
            __WEBPACK_IMPORTED_MODULE_1__angular_common__["a" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_forms__["a" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_http__["b" /* JsonpModule */]
        ],
        providers: [
            __WEBPACK_IMPORTED_MODULE_7__services_api_service__["a" /* ApiService */]
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=C:/Users/COMPUTER/project/music/src/app.module.js.map

/***/ }),

/***/ "../../../../../src/app/services/api.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("../../../http/@angular/http.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApiService; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var API_KEY = '458dac111e2456c40805cd838f4548c1';
var API_URL = 'https://api.soundcloud.com/';
var ApiService = (function () {
    function ApiService(http, jsonp) {
        this.http = http;
        this.jsonp = jsonp;
    }
    ApiService.prototype.getQuerySuggestions = function (query) {
        return this.jsonp.request('https://suggestqueries.google.com/complete/search?callback=JSONP_CALLBACK&hl=en&ds=yt&client=youtube&q=' + query)
            .map(function (data) {
            var jsonData = data.json();
            var suggestions = jsonData[1];
            return suggestions.map(function (e) {
                return e[0];
            });
        });
    };
    ApiService.prototype.getTracks = function (query, limit, offset) {
        return this.http.get(API_URL + 'tracks?client_id=' + API_KEY + '&q=' + query + '&limit=' + limit + '&offset=' + offset)
            .map(function (response) { return response.json(); });
    };
    ApiService.prototype.getStreamUrl = function (track) {
        return track.stream_url + '?client_id=' + API_KEY;
    };
    return ApiService;
}());
ApiService = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["c" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["c" /* Http */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Jsonp */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Jsonp */]) === "function" && _b || Object])
], ApiService);

var _a, _b;
//# sourceMappingURL=C:/Users/COMPUTER/project/music/src/api.service.js.map

/***/ }),

/***/ "../../../../../src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=C:/Users/COMPUTER/project/music/src/environment.js.map

/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("../../../platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("../../../../../src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("../../../../../src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=C:/Users/COMPUTER/project/music/src/main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map