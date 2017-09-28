(function() {
    console.log('here is the fucking background script')

    window.background = {
        player: null,
        url: null,
        play: function(newUrl) {
            console.log('background play', newUrl);
            if (this.url == newUrl) {
                console.log('resume', newUrl)
                this.player.play();
            } else {
                this.url = newUrl;
                if (this.player) {
                    this.player.pause();
                }
                this.player = new Audio(this.url);
                this.player.play();
            }
            return this.player;
        },
        pause: function pause() {
            console.log('background pause')
            if (this.player) {
                this.player.pause();
            }
        }
    }
})();
