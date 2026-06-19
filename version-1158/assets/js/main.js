(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        show(0);
        start();
    }

    var searchRoot = document.querySelector('[data-search-root]');
    if (searchRoot) {
        var input = searchRoot.querySelector('#movie-search');
        var typeSelect = searchRoot.querySelector('#filter-type');
        var regionSelect = searchRoot.querySelector('#filter-region');
        var yearSelect = searchRoot.querySelector('#filter-year');
        var chips = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-filter-genre]'));
        var clear = searchRoot.querySelector('[data-clear-search]');
        var empty = searchRoot.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('.movie-card'));
        var activeGenre = '';
        var params = new URLSearchParams(window.location.search);

        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function cardValue(card, key) {
            return (card.getAttribute(key) || '').toLowerCase();
        }

        function applyFilters() {
            var query = valueOf(input);
            var type = valueOf(typeSelect);
            var region = valueOf(regionSelect);
            var year = valueOf(yearSelect);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    cardValue(card, 'data-title'),
                    cardValue(card, 'data-year'),
                    cardValue(card, 'data-region'),
                    cardValue(card, 'data-type'),
                    cardValue(card, 'data-genre'),
                    cardValue(card, 'data-tags')
                ].join(' ');
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (type && cardValue(card, 'data-type') !== type) {
                    matched = false;
                }
                if (region && cardValue(card, 'data-region') !== region) {
                    matched = false;
                }
                if (year && cardValue(card, 'data-year') !== year) {
                    matched = false;
                }
                if (activeGenre && cardValue(card, 'data-genre').indexOf(activeGenre) === -1 && cardValue(card, 'data-tags').indexOf(activeGenre) === -1) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var value = (chip.getAttribute('data-filter-genre') || '').toLowerCase();
                activeGenre = activeGenre === value ? '' : value;
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip && activeGenre === value);
                });
                applyFilters();
            });
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                activeGenre = '';
                chips.forEach(function (chip) {
                    chip.classList.remove('is-active');
                });
                applyFilters();
            });
        }

        applyFilters();
    }
}());
