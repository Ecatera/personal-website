/* Caterina Puca — personal site.
   Vanilla replacement for the React behaviour: theme toggle, scroll fade-ins,
   the origin-story carousel and the mobile CV-download toast. */
(function () {
  "use strict";

  /* ── Theme toggle ────────────────────────────────────────────────────── */
  var root = document.documentElement;
  var switchEl = document.getElementById("theme-switch");

  function isDark() {
    return root.classList.contains("dark");
  }

  function setTheme(dark) {
    root.classList.toggle("dark", dark);
    switchEl.setAttribute("aria-checked", String(dark));
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch (e) { /* storage unavailable — theme just won't persist */ }
  }

  setTheme(isDark());
  switchEl.addEventListener("click", function () {
    setTheme(!isDark());
  });

  /* ── Fade in on scroll ───────────────────────────────────────────────── */
  var faders = document.querySelectorAll(".fade-in");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    faders.forEach(function (el) { observer.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ── Origin story carousel ───────────────────────────────────────────── */
  var stage = document.getElementById("origin-stage");

  if (stage) {
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".origin__card"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".origin__dot"));
    var prevBtn = document.getElementById("origin-prev");
    var nextBtn = document.getElementById("origin-next");
    var doneEl = document.getElementById("origin-done");
    var total = cards.length;

    var current = 0;
    var isAnimating = false;
    var isHovered = false;

    var ACCENTS = cards.map(function (card) {
      return (card.className.match(/acc-[a-z]+/) || ["acc-teal"])[0];
    });

    function syncNav() {
      prevBtn.disabled = current === 0;
      nextBtn.hidden = current === total - 1;
      doneEl.hidden = current !== total - 1;

      stage.className = "origin__stage " + ACCENTS[current];

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-current", i === current);
      });
    }

    function goTo(index) {
      if (isAnimating || index === current || index < 0 || index >= total) return;

      var leaving = index > current ? "is-leaving-right" : "is-leaving-left";
      var from = cards[current];
      var to = cards[index];

      isAnimating = true;
      from.classList.add(leaving);

      setTimeout(function () {
        from.hidden = true;
        from.classList.remove(leaving);

        to.classList.add(leaving);
        to.hidden = false;
        void to.offsetWidth; // force a reflow so the class removal animates
        to.classList.remove(leaving);

        current = index;
        isAnimating = false;
        syncNav();
      }, 320);
    }

    prevBtn.addEventListener("click", function () { goTo(current - 1); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(parseInt(dot.getAttribute("data-index"), 10));
      });
    });

    /* Arrow-key navigation while the pointer is over the carousel */
    stage.addEventListener("mouseenter", function () { isHovered = true; });
    stage.addEventListener("mouseleave", function () { isHovered = false; });

    window.addEventListener("keydown", function (e) {
      if (!isHovered) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    });

    /* Swipe navigation */
    var touchStartX = null;

    stage.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    stage.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) goTo(delta < 0 ? current + 1 : current - 1);
      touchStartX = null;
    }, { passive: true });

    syncNav();
  }

  /* ── Toast ───────────────────────────────────────────────────────────── */
  var viewport = document.getElementById("toast-viewport");
  var activeToast = null;

  function dismiss(el) {
    if (!el || el.getAttribute("data-state") === "closed") return;
    el.setAttribute("data-state", "closed");
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (activeToast === el) activeToast = null;
    }, 200);
  }

  function toast(title, description) {
    dismiss(activeToast); // TOAST_LIMIT = 1

    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("data-state", "open");
    el.innerHTML =
      '<div><p class="toast__title"></p><p class="toast__description"></p></div>' +
      '<button type="button" class="toast__close" aria-label="Close">' +
      '<svg class="icon icon--base" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>' +
      "</button>";
    el.querySelector(".toast__title").textContent = title;
    el.querySelector(".toast__description").textContent = description;
    el.querySelector(".toast__close").addEventListener("click", function () { dismiss(el); });

    viewport.appendChild(el);
    activeToast = el;

    setTimeout(function () { dismiss(el); }, 5000);
  }

  var cvLink = document.getElementById("cv-link");
  if (cvLink) {
    cvLink.addEventListener("click", function () {
      if (window.innerWidth < 768) {
        toast("CV downloaded ✓", "The file has been saved to your device.");
      }
    });
  }

  /* ── Footer year ─────────────────────────────────────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
