(function() {

    const API_KEY = '458dac111e2456c40805cd838f4548c1';
    const API_URL = 'https://api.soundcloud.com/';

    var state = {
        tracks: [],
        currentTrack: null
    };
    var player = {
        play: play,
        pause: pause,
        next: next,
        previous: previous,
        seek: seek,
        resume: resume,
        setVolume: setVolume,
        onPlay: null,
        onProgress: null,
        onPause: null
    };

    var _player = new Audio();

    function setVolume(volume) {
        _player.volume = volume;
    }

    function play(track) {
        if (state.currentTrack == track) {
            _player.pause();
        }
        state.currentTrack = track;
        let streamUrl = getStreamUrl(track);
        if (!streamUrl) {
            console.error('stream url not found for track', track);
            return;
        }
        _player.src = streamUrl;
        _player.play();
        _player.onplay = () => {
            player.onPlay && player.onPlay(state.currentTrack);
        };
        _player.ontimeupdate = () => {
            player.onProgress && player.onProgress(state.currentTrack, _player.currentTime);
        };
        _player.onpause = () => {
            if (_player.ended) {
                // auto play next when this track ended
                next();
            } else {
                player.onPause && player.onPause();
            }
        };
        return _player;
    }

    function pause() {
        if (_player) {
            _player.pause();
        }
    }

    function next() {
        let currentIndex = state.tracks.indexOf(state.currentTrack);
        let nextTrack = state.tracks[currentIndex + 1];
        if (nextTrack) {
            play(nextTrack);
        }
    }

    function previous() {
        let currentIndex = state.tracks.indexOf(state.currentTrack);
        let previousTrack = state.tracks[currentIndex - 1];
        if (previousTrack) {
            play(previousTrack);
        }
    }

    function resume() {
        if (state.currentTrack) {
            _player.play();
        }
    }

    function seek(time) {
        _player.currentTime = time;
        if (_player.paused) {
            _player.play();
        }
    }

    function getStreamUrl(track) {
        return track.stream_url + '?client_id=' + API_KEY;
    }

    window.background = {
        state: state,
        player: player
    };
})();