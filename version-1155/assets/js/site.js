
(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var button = document.querySelector('.nav-toggle');
        var panel = document.querySelector('[data-mobile-nav]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            button.textContent = isOpen ? '×' : '☰';
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', root);
        var dots = selectAll('[data-hero-dot]', root);
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var categorySelect = scope.querySelector('[data-filter-category]');
            var grid = scope.parentElement.querySelector('.filter-grid');
            var cards = grid ? selectAll('[data-movie-card]', grid) : [];
            if (!cards.length) {
                return;
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var category = categorySelect ? categorySelect.value : '';
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    var okQuery = !query || text.indexOf(query) !== -1;
                    var okType = !type || card.getAttribute('data-type') === type;
                    var okYear = !year || card.getAttribute('data-year') === year;
                    var okCategory = !category || card.getAttribute('data-category') === category;
                    card.classList.toggle('is-hidden', !(okQuery && okType && okYear && okCategory));
                });
            }
            [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !sourceUrl) {
            return;
        }
        var shell = video.closest('.player-shell');
        var hlsInstance = null;
        function markPlaying() {
            if (shell) {
                shell.classList.add('is-playing');
            }
        }
        function prepare() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            video.setAttribute('data-ready', '1');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        function play() {
            prepare();
            markPlaying();
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }
        prepare();
        button.addEventListener('click', function (event) {
            event.preventDefault();
            play();
        });
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                play();
            });
        }
        video.addEventListener('play', markPlaying);
        video.addEventListener('pause', function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
})();
