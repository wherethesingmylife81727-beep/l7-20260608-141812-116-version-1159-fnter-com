(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startAuto() {
            stopAuto();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
                startAuto();
            });
        });

        hero.addEventListener('mouseenter', stopAuto);
        hero.addEventListener('mouseleave', startAuto);
        startAuto();
    }

    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    var noResult = document.querySelector('[data-no-result]');

    function readParam(name) {
        try {
            var params = new URLSearchParams(window.location.search);
            return params.get(name) || '';
        } catch (error) {
            return '';
        }
    }

    if (input) {
        var preset = readParam('q');
        if (preset) {
            input.value = preset;
        }
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = typeSelect ? typeSelect.value : '';
        var regionValue = regionSelect ? regionSelect.value : '';
        var yearValue = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var search = (card.getAttribute('data-search') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var region = card.getAttribute('data-region') || '';
            var year = card.getAttribute('data-year') || '';
            var matched = true;

            if (keyword && search.indexOf(keyword) === -1) {
                matched = false;
            }
            if (typeValue && type !== typeValue) {
                matched = false;
            }
            if (regionValue && region !== regionValue) {
                matched = false;
            }
            if (yearValue && year !== yearValue) {
                matched = false;
            }

            card.classList.toggle('is-hidden', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.classList.toggle('active', visible === 0);
        }
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    filterCards();
})();
