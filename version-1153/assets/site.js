(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-nav-toggle]");
        if (toggle) {
            toggle.addEventListener("click", function() {
                document.body.classList.toggle("is-nav-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function() {
                    show(index + 1);
                }, 5000);
            }

            dots.forEach(function(dot, i) {
                dot.addEventListener("click", function() {
                    show(i);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener("click", function() {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    show(index + 1);
                    restart();
                });
            }

            show(0);
            restart();
        }

        var heroSearch = document.querySelector("[data-hero-search]");
        if (heroSearch) {
            heroSearch.addEventListener("submit", function(event) {
                var input = heroSearch.querySelector("input[name='q']");
                if (input && input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = heroSearch.getAttribute("action") || "search.html";
            });
        }

        document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
            var target = panel.getAttribute("data-target");
            var grid = target ? document.querySelector(target) : null;
            if (!grid) {
                return;
            }
            var input = panel.querySelector("[data-filter-input]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var sort = panel.querySelector("[data-sort-select]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function text(card, name) {
                return (card.getAttribute(name) || "").toLowerCase();
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var selectedType = type ? type.value.toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                cards.forEach(function(card) {
                    var haystack = text(card, "data-text") + " " + text(card, "data-title") + " " + text(card, "data-tags") + " " + text(card, "data-region") + " " + text(card, "data-genre");
                    var typeOk = !selectedType || text(card, "data-type") === selectedType;
                    var yearOk = !selectedYear || (card.getAttribute("data-year") || "") === selectedYear;
                    var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                    card.classList.toggle("is-hidden", !(typeOk && yearOk && keywordOk));
                });
                if (sort) {
                    sortCards(sort.value);
                }
            }

            function sortCards(mode) {
                var sorted = cards.slice().sort(function(a, b) {
                    var ay = parseInt(a.getAttribute("data-year") || "0", 10);
                    var by = parseInt(b.getAttribute("data-year") || "0", 10);
                    var at = a.getAttribute("data-title") || "";
                    var bt = b.getAttribute("data-title") || "";
                    if (mode === "year-asc") {
                        return ay - by || at.localeCompare(bt, "zh-Hans-CN");
                    }
                    if (mode === "title-asc") {
                        return at.localeCompare(bt, "zh-Hans-CN") || by - ay;
                    }
                    return by - ay || at.localeCompare(bt, "zh-Hans-CN");
                });
                sorted.forEach(function(card) {
                    grid.appendChild(card);
                });
            }

            [input, type, year, sort].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    });
}());
