(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var siteNav = document.querySelector(".site-nav");
        var headerSearch = document.querySelector(".header-search");

        if (menuToggle && siteNav) {
            menuToggle.addEventListener("click", function () {
                var open = siteNav.classList.toggle("is-open");
                if (headerSearch) {
                    headerSearch.classList.toggle("is-open", open);
                }
                menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        setupCarousel();
        setupFilters();
        setupPlayers();
    });

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var globalInput = document.querySelector("#global-search");
        var pageSearch = document.querySelector("#page-search");
        var localFilters = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
        var sortSelects = Array.prototype.slice.call(document.querySelectorAll(".sort-select"));

        if (globalInput) {
            globalInput.value = query;
        }

        if (pageSearch) {
            pageSearch.value = query;
        }

        localFilters.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
            input.addEventListener("input", function () {
                applyFilter(input.closest(".section-block") || document, input.value);
            });
            if (input.value) {
                applyFilter(input.closest(".section-block") || document, input.value);
            }
        });

        sortSelects.forEach(function (select) {
            select.addEventListener("change", function () {
                sortCards(select.closest(".section-block") || document, select.value);
            });
        });
    }

    function applyFilter(scope, value) {
        var keyword = String(value || "").trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
            card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
    }

    function sortCards(scope, value) {
        var grid = scope.querySelector(".movie-grid");
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        cards.sort(function (a, b) {
            if (value === "year") {
                return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
            }
            if (value === "title") {
                return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
            }
            return 0;
        });
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    function setupPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        boxes.forEach(function (box) {
            var video = box.querySelector("video");
            var cover = box.querySelector(".player-cover");
            if (!video || !cover) {
                return;
            }

            function activate() {
                attachStream(video);
                box.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        box.classList.remove("is-playing");
                    });
                }
            }

            cover.addEventListener("click", activate);
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    box.classList.remove("is-playing");
                }
            });
        });
    }

    function attachStream(video) {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        var streamUrl = video.getAttribute("data-src");
        if (!streamUrl) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
        } else {
            video.src = streamUrl;
        }

        video.setAttribute("data-ready", "1");
    }
}());
