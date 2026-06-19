(function () {
  const configElement = document.getElementById('player-config');
  const video = document.getElementById('movie-video');
  const overlay = document.getElementById('play-overlay');
  const shell = document.querySelector('[data-player-shell]');

  if (!configElement || !video) {
    return;
  }

  let config = {};

  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  const videoUrl = config.url || '';
  let prepared = false;
  let hls = null;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  }

  function prepareVideo() {
    if (prepared || !videoUrl) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      }, { once: true });
      return;
    }

    video.src = videoUrl;
  }

  function requestPlay() {
    hideOverlay();
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showOverlay();
      });
    }
  }

  function startPlayback() {
    prepareVideo();

    if (video.readyState > 0) {
      requestPlay();
      return;
    }

    const delayedPlay = function () {
      requestPlay();
    };

    video.addEventListener('loadedmetadata', delayedPlay, { once: true });
    video.addEventListener('canplay', delayedPlay, { once: true });
    window.setTimeout(delayedPlay, 420);
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      startPlayback();
    });
  }

  if (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target === overlay || (overlay && overlay.contains(event.target))) {
        return;
      }
      if (!prepared) {
        startPlayback();
      }
    });
  }

  video.addEventListener('play', hideOverlay);
  video.addEventListener('ended', showOverlay);
})();
