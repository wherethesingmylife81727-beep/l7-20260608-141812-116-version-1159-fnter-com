import { H as Hls } from "./hls-vendor.js";

export function setupMoviePlayer(videoId, coverId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var prepared = false;

    function prepare() {
        if (prepared || !video || !sourceUrl) {
            return;
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function begin() {
        if (!video) {
            return;
        }
        prepare();
        if (cover) {
            cover.classList.add('hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', begin);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!prepared || video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
            hls = null;
        }
    });
}
