/* MODU — moduportugal.eu */
(function () {
  "use strict";

  // Form endpoints: Google Apps Script web app URLs (see /apps-script/README.md).
  // Leave empty until the scripts are deployed; the forms then show a notice instead of sending.
  var ENDPOINTS = {
    client: "",
    supplier: ""
  };
  var CALENDLY = "https://calendly.com/modu-house05/production-fit-call-30-min";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero wordmark entrance
  requestAnimationFrame(function () { document.documentElement.classList.add("loaded"); });

  // Reveal on scroll
  var els = document.querySelectorAll(".rv");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
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
