(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === active);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === active);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 4800);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const empty = scope.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const searchValue = normalized(input ? input.value : '');
      const selectValues = selects.map(function (select) {
        return {
          key: select.getAttribute('data-filter-key'),
          value: normalized(select.value)
        };
      });
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalized(card.getAttribute('data-search'));
        let visible = !searchValue || haystack.indexOf(searchValue) !== -1;

        selectValues.forEach(function (item) {
          if (!item.key || !item.value) {
            return;
          }
          const cardValue = normalized(card.getAttribute('data-' + item.key));
          if (cardValue.indexOf(item.value) === -1) {
            visible = false;
          }
        });

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  });
})();
