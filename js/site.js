/* MODU — moduportugal.eu */
(function () {
  "use strict";

  // Form endpoints: Google Apps Script web app URLs (see /apps-script/README.md).
  // Leave empty until the scripts are deployed; the forms then show a notice instead of sending.
  var ENDPOINTS = {
    client: "https://script.google.com/macros/s/AKfycbzE1r6EriVHgGuQEYRFLgD0UQfWa144a05KRYFNURHIX6S-CcPwhw9oAq6VRPG7ASTs/exec",
    supplier: "https://script.google.com/macros/s/AKfycbxs4q9IJjBpXxayaqcv2SgP7GZN4eeV_bnU4VCkotorho48R6pOg2d2gkrUd-UEzPBOQw/exec"
  };
  var CALENDLY = "https://calendly.com/modu-house05/production-fit-call-30-min";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero wordmark entrance
  requestAnimationFrame(function () { document.documentElement.classList.add("loaded"); });

  // Split headings into words (keeps inner spans such as italics)
  function splitWords(root, cls, counter) {
    Array.prototype.slice.call(root.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement("span");
          s.className = cls; s.textContent = part;
          s.style.setProperty("--i", counter.n++);
          frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) {
        splitWords(n, cls, counter);
      }
    });
  }
  if (!reduce) {
    document.querySelectorAll(".split").forEach(function (h) { splitWords(h, "w", { n: 0 }); });
  }
  var quoteWords = [];
  document.querySelectorAll(".hl").forEach(function (q) {
    if (reduce) return;
    splitWords(q, "qw", { n: 0 });
    quoteWords = quoteWords.concat(Array.prototype.slice.call(q.querySelectorAll(".qw")));
  });

  // Count-up for facts (final numbers stay in the HTML for search engines)
  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), suf = el.getAttribute("data-suffix") || "";
    if (reduce || !end) return;
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = "0" + suf;
    requestAnimationFrame(step);
  }

  // Scroll-linked effects
  var wm = document.getElementById("wm");
  var wmLetters = wm ? wm.querySelectorAll("span") : [];
  var topline = document.querySelector(".topline");
  var stepsLine = document.querySelector(".steps-line");
  var portraitImg = document.querySelector(".portrait img");
  var bar = document.querySelector(".bar");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.setProperty("--sp", docH > 0 ? (y / docH).toFixed(4) : 0);
    if (reduce) return;
    if (wm && y < vh * 1.2) {
      var k = y / vh;
      for (var i = 0; i < wmLetters.length; i++) {
        wmLetters[i].style.transform = document.documentElement.classList.contains("loaded")
          ? "translateY(" + (k * (40 + i * 38)).toFixed(1) + "px)" : "";
      }
      if (topline) topline.style.opacity = Math.max(0, 1 - k * 1.6).toFixed(3);
    }
    if (stepsLine) {
      var r = stepsLine.parentNode.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      stepsLine.style.setProperty("--p", p.toFixed(3));
    }
    if (portraitImg) {
      var pr = portraitImg.parentNode.getBoundingClientRect();
      var c = (pr.top + pr.height / 2 - vh / 2) / vh;
      portraitImg.style.setProperty("--py", (c * -30).toFixed(1) + "px");
    }
    if (quoteWords.length) {
      var qr = quoteWords[0].parentNode.getBoundingClientRect();
      var qp = Math.min(1, Math.max(0, (vh * 0.8 - qr.top) / (qr.height + vh * 0.25)));
      var lit = Math.round(qp * quoteWords.length);
      for (var j = 0; j < quoteWords.length; j++) quoteWords[j].classList.toggle("on", j < lit);
    }
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  // After the entrance, let the wordmark letters follow the scroll without delay
  setTimeout(function () { wmLetters.forEach && wmLetters.forEach(function (s) { s.style.transitionDelay = "0s"; s.style.transition = "transform .1s linear"; }); onScroll(); }, 1300);
  onScroll();

  // Reveal on scroll
  var els = document.querySelectorAll(".rv");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); e.target.querySelectorAll("[data-count]").forEach(countUp); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // Self-hosted video: play with sound on click
  document.querySelectorAll(".video").forEach(function (box) {
    var v = box.querySelector("video"), b = box.querySelector(".play");
    if (!v || !b) return;
    b.addEventListener("click", function () {
      v.controls = true; v.muted = false; b.remove(); v.play();
    });
  });

  // YouTube: load the player only after a click (no third-party requests before that)
  document.querySelectorAll(".yt[data-id]").forEach(function (box) {
    var id = box.getAttribute("data-id");
    box.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    box.addEventListener("click", function () {
      if (box.querySelector("iframe")) return;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = box.getAttribute("data-title") || "MODU video";
      f.allow = "autoplay; encrypted-media; picture-in-picture";
      f.allowFullscreen = true;
      box.innerHTML = ""; box.appendChild(f);
    });
  });

  // Forms
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var kind = form.getAttribute("data-form");
    var started = Date.now();
    var status = form.querySelector(".status");
    var button = form.querySelector("button[type=submit]");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      status.className = "status"; status.textContent = "";

      // Required checkbox groups
      var groups = form.querySelectorAll("fieldset[data-required]");
      for (var i = 0; i < groups.length; i++) {
        if (!groups[i].querySelector("input:checked")) {
          status.className = "status err";
          status.textContent = "Please choose at least one option in “" + groups[i].querySelector("legend").textContent.replace("*", "").trim() + "”.";
          groups[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
          return;
        }
      }
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      // Spam checks: honeypot filled, or sent faster than a person can type
      if (data.get("company_website") || Date.now() - started < 3000) { finish(); return; }

      var body = new URLSearchParams();
      data.forEach(function (value, key) {
        if (key === "company_website") return;
        body.append(key, value);
      });
      body.append("form", kind);
      body.append("page", location.href);

      var url = ENDPOINTS[kind];
      if (!url) {
        status.className = "status err";
        status.textContent = "This form is not connected yet. Please email modu@house05.eu.";
        return;
      }

      button.disabled = true; button.textContent = "Sending…";
      fetch(url, { method: "POST", mode: "no-cors", body: body })
        .then(finish)
        .catch(function () {
          button.disabled = false; button.textContent = "Send";
          status.className = "status err";
          status.textContent = "Something went wrong. Please try again or email modu@house05.eu.";
        });

      function finish() {
        form.style.display = "none";
        var done = document.getElementById(kind + "-done");
        if (done) {
          done.classList.add("show");
          done.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
          if (kind === "client") loadCalendly(data.get("name"), data.get("email"));
        }
      }
    });
  });

  function loadCalendly(name, email) {
    var box = document.getElementById("calendly");
    if (!box) return;
    var q = "?hide_gdpr_banner=1&primary_color=314a43";
    if (name) q += "&name=" + encodeURIComponent(name);
    if (email) q += "&email=" + encodeURIComponent(email);
    var f = document.createElement("iframe");
    f.src = CALENDLY + q;
    f.title = "Book a Strategy Call";
    f.style.cssText = "width:100%;height:760px;border:0;display:block";
    box.appendChild(f);
  }

  // Year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
