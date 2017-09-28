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

/***/ "../../../../../src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<main>\n    <!--search box-->\n    <div class=\"search\">\n        <div class=\"input-container\">\n            <input [class.filled]=\"query\" #searchInput type=\"text\" [(ngModel)]=\"query\" (ngModelChange)=\"onQueryChange()\" (keyup.enter)=\"search(query)\">\n            <label>Find your music</label>\n            <svg width=\"300%\" height=\"100%\" viewBox=\"0 0 1200 60\" preserveAspectRatio=\"none\">\n                <path d=\"M0,56.5c0,0,298.666,0,399.333,0C448.336,56.5,513.994,46,597,46c77.327,0,135,10.5,200.999,10.5c95.996,0,402.001,0,402.001,0\"></path>\n            </svg>\n            <span class=\"clear fa fa-times-circle-o\" *ngIf=\"query\" (click)=\"clear()\"></span>\n        </div>\n        <div class=\"suggestions\" *ngIf=\"showSuggestions\">\n            <div class=\"suggestion\" *ngFor=\"let e of suggestions\" (click)=\"search(e)\">{{e}}</div>\n        </div>\n    </div>\n\n    <!--track list-->\n    <div #trackList class=\"track-list\" (scroll)=\"onScroll($event)\">\n        <div class=\"track\" title=\"Play this song\" [class.playing]=\"track.playing\" *ngFor=\"let track of tracks\" (click)=\"play(track)\">\n            <div class=\"artwork\">\n                <img [src]=\"track.artwork_url || 'https://i1.sndcdn.com/artworks-000135613276-kkqr5r-large.jpg'\">\n            </div>\n            <div class=\"title\" [title]=\"track.title\">{{track.title}}</div>\n            <div class=\"duration\">{{track.durationInMins}}</div>\n        </div>\n        <div class=\"loading\" [class.show]=\"isLoadingMoreTracks\">\n            <span class=\"fa fa-spinner fa-pulse\"></span>\n            <span>Slow down, motherfucker...</span>\n        </div>\n    </div>\n\n    <!--the player-->\n    <div class=\"player\">\n        <div class=\"controls\">\n            <div class=\"title full\">\n                <div class=\"dancing\" [title]=\"playingTrack?.title\">{{playingTrack?.title}}</div>\n            </div>\n            <span class=\"fa fa-play-circle\" *ngIf=\"player?.paused\" (click)=\"resumeTrack()\"></span>\n            <span class=\"fa fa-pause-circle\" *ngIf=\"!player?.paused\" (click)=\"pauseTrack()\"></span>\n            <progress #progress (click)=\"onProgressClick($event)\"></progress>\n        </div>\n    </div>\n</main>"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs__ = __webpack_require__("../../../../rxjs/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_rxjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_api_service__ = __webpack_require__("../../../../../src/app/services/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_data_service__ = __webpack_require__("../../../../../src/app/services/data.service.ts");
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
var AppComponent = (function () {
    function AppComponent(apiService, dataService) {
        this.apiService = apiService;
        this.dataService = dataService;
        this.background = (function () {
            if (chrome.extension) {
                return chrome.extension.getBackgroundPage().background;
            }
            return background;
        })();
        this.suggestions = [];
        this.tracks = [];
        this.offset = 0;
        this.queries = new __WEBPACK_IMPORTED_MODULE_1_rxjs__["Subject"]();
        this.session = new __WEBPACK_IMPORTED_MODULE_3__services_data_service__["b" /* Session */]();
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        // load previous session
        this.dataService.getData(function (data) {
            console.log('previous session', data);
            if (data) {
                _this.session = data;
                _this.query = _this.session.query;
                _this.playingTrack = _this.session.playingTrack;
                _this.search(_this.query);
                if (_this.playingTrack) {
                    if (_this.background.player) {
                        _this.player = _this.background.player;
                    }
                    else {
                        _this.player = _this.background.play(_this.apiService.getStreamUrl(_this.playingTrack));
                    }
                    _this.connectPlayer(_this.player);
                }
            }
        });
        // query will be delayed for 0.5s until user finished typing.
        this.queries.debounceTime(500).distinctUntilChanged()
            .subscribe(function (query) {
            _this.apiService.getQuerySuggestions(query).subscribe(function (data) {
                _this.suggestions = data;
                _this.showSuggestions = true;
            });
        });
    };
    AppComponent.prototype.onQueryChange = function () {
        this.queries.next(this.query);
    };
    AppComponent.prototype.clear = function () {
        this.query = '';
        this.showSuggestions = false;
        this.searchInput.nativeElement.focus();
    };
    AppComponent.prototype.search = function (query) {
        var _this = this;
        this.showSuggestions = false;
        this.query = query;
        this.offset = 0;
        this.apiService.getTracks(query, LIMIT, 0).subscribe(function (data) {
            _this.tracks = data.filter(function (e) { return e.streamable; }).map(function (e) { return _this.processTrackData(e); });
        });
        this.session.query = query;
        this.updateSession();
    };
    AppComponent.prototype.onScroll = function ($event) {
        var _this = this;
        // bottom reached, fetch the next page
        if ($event.target.scrollTop + $event.target.clientHeight >= $event.target.scrollHeight) {
            if (this.isLoadingMoreTracks) {
                // prevent too many requests
                return;
            }
            this.offset = this.offset + LIMIT;
            this.isLoadingMoreTracks = true;
            this.apiService.getTracks(this.query, LIMIT, this.offset).subscribe(function (data) {
                _this.isLoadingMoreTracks = false;
                if (data && data.length > 0) {
                    Array.prototype.push.apply(_this.tracks, data.filter(function (e) { return e.streamable; }).map(function (e) { return _this.processTrackData(e); }));
                }
            });
        }
    };
    AppComponent.prototype.processTrackData = function (track) {
        var durationInSeconds = track.duration / 1000;
        var mins = Math.floor(durationInSeconds / 60);
        var secs = Math.floor(durationInSeconds - mins * 60);
        track.durationInMins = mins + ':' + secs;
        return track;
    };
    AppComponent.prototype.updateSession = function () {
        this.dataService.storeData(this.session);
    };
    AppComponent.prototype.play = function (track) {
        if (track.playing) {
            return;
        }
        // update status for displaying
        this.tracks.forEach(function (e) { return e.playing = false; });
        track.playing = true;
        this.playingTrack = track;
        // play the track
        var player = this.background.play(this.apiService.getStreamUrl(track));
        this.connectPlayer(player);
        this.session.playingTrack = track;
        this.updateSession();
    };
    AppComponent.prototype.connectPlayer = function (player) {
        var _this = this;
        this.player = player;
        this.player.onplay = function () {
            // update track 's playing status
            if (_this.playingTrack) {
                _this.playingTrack.playing = true;
            }
        };
        this.player.onpause = function () {
            // update track 's playing status
            if (_this.playingTrack) {
                _this.playingTrack.playing = false;
            }
            // play next track if any
            if (_this.player.ended) {
                var currentIndex = _this.tracks.indexOf(_this.playingTrack);
                var nextTrack = _this.tracks[currentIndex + 1];
                if (nextTrack) {
                    _this.play(nextTrack);
                }
            }
        };
        this.player.ontimeupdate = function () {
            // update progress bar's max and initial value
            _this.progress.nativeElement.max = _this.playingTrack.duration / 1000;
            _this.progress.nativeElement.value = _this.player.currentTime;
        };
    };
    AppComponent.prototype.pause = function (track) {
        track.playing = false;
        this.background.pause();
    };
    AppComponent.prototype.resumeTrack = function () {
        this.player.play();
    };
    AppComponent.prototype.pauseTrack = function () {
        this.player.pause();
    };
    AppComponent.prototype.onProgressClick = function (e) {
        var progressBar = e.currentTarget;
        var xPosition = e.pageX - progressBar.getBoundingClientRect().left;
        if (this.player) {
            // seek the playback to time based on the pointer's position within the progress bar
            this.player.currentTime = xPosition / progressBar.clientWidth * progressBar.max;
            if (this.player.paused) {
                this.player.play();
            }
        }
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
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_15" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__("../../../../../src/app/app.component.html"),
        styles: [__webpack_require__("../../../../../src/app/app.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__services_api_service__["a" /* ApiService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_api_service__["a" /* ApiService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_3__services_data_service__["a" /* DataService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__services_data_service__["a" /* DataService */]) === "function" && _b || Object])
], AppComponent);

var _a, _b;
//# sourceMappingURL=C:/Users/ngocdieptrinh/project/chrome/src/app.component.js.map

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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__services_data_service__ = __webpack_require__("../../../../../src/app/services/data.service.ts");
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
            __WEBPACK_IMPORTED_MODULE_7__services_api_service__["a" /* ApiService */],
            __WEBPACK_IMPORTED_MODULE_8__services_data_service__["a" /* DataService */]
        ],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=C:/Users/ngocdieptrinh/project/chrome/src/app.module.js.map

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
//# sourceMappingURL=C:/Users/ngocdieptrinh/project/chrome/src/api.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/data.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DataService; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Session; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var STORAGE_KEY = 'diep-data';
var DataService = (function () {
    function DataService(ngZone) {
        this.ngZone = ngZone;
    }
    DataService.prototype.storeData = function (data) {
        if (chrome && chrome.storage) {
            chrome.storage.local.set((_a = {}, _a[STORAGE_KEY] = data, _a));
            return;
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        var _a;
    };
    DataService.prototype.getData = function (callback) {
        var _this = this;
        if (chrome && chrome.storage) {
            chrome.storage.local.get(STORAGE_KEY, function (data) {
                _this.ngZone.run(function () {
                    callback(data[STORAGE_KEY]);
                });
            });
            return;
        }
        callback(JSON.parse(sessionStorage.getItem(STORAGE_KEY)));
    };
    return DataService;
}());
DataService = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["d" /* NgZone */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["d" /* NgZone */]) === "function" && _a || Object])
], DataService);

var Session = (function () {
    function Session() {
        this.query = null;
        this.playingTrack = null;
    }
    return Session;
}());

var _a;
//# sourceMappingURL=C:/Users/ngocdieptrinh/project/chrome/src/data.service.js.map

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
//# sourceMappingURL=C:/Users/ngocdieptrinh/project/chrome/src/environment.js.map

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
//# sourceMappingURL=C:/Users/ngocdieptrinh/project/chrome/src/main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map