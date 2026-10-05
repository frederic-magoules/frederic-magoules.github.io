/*
 * Menu commun du site.
 *
 * Pour modifier la colonne de gauche sur toutes les pages, modifiez seulement
 * le texte ou les liens ci-dessous. Ce fichier fonctionne aussi lorsque le
 * site est ouvert directement depuis le disque, sans serveur web.
 */
(function () {
  "use strict";

  var navigationPages = [
    "index.html", "cv.html", "honours-leadership.html", "publications.html",
    "books.html", "authored-books.html", "edited-books.html",
    "edited-conference-proceedings.html", "special-issues.html",
    "press-coverage.html", "research.html", "pictures.html", "teaching.html",
    "contact.html", "404.html"
  ];
  function pageOf(selection) { return selection.split("#")[0]; }
  function selectionForHref(href) {
    try {
      var url = new URL(href, document.baseURI);
      var page = url.pathname.split("/").pop();
      if (navigationPages.indexOf(page) === -1) return null;
      var expected = new URL(page, document.baseURI);
      if (url.protocol !== expected.protocol || url.origin !== expected.origin ||
          url.pathname !== expected.pathname) return null;
      return page + url.hash;
    } catch (error) { return null; }
  }
  function acceptsOrigin(origin) {
    if (window.location.protocol === "file:") {
      return origin === "null" || origin === "file://";
    }
    return origin === window.location.origin;
  }
  function position(value) {
    value = Number(value);
    return Number.isFinite(value) ? Math.max(0, Math.min(value, 10000000)) : 0;
  }
  function safeView(view) {
    view = view || {};
    var result = { x: position(view.x), y: position(view.y) };
    if (Array.isArray(view.details)) result.details = view.details.slice(0, 1000).map(Boolean);
    return result;
  }
  function contentView() {
    var view = safeView({ x: window.scrollX, y: window.scrollY });
    view.details = Array.prototype.map.call(
      document.querySelectorAll(".main-column > .content-card details"), function (item) { return item.open; }
    );
    return view;
  }
  function restoreDetails(view) {
    if (!view || !Array.isArray(view.details)) return;
    document.querySelectorAll(".main-column > .content-card details").forEach(function (item, index) {
      if (index < view.details.length) item.open = Boolean(view.details[index]);
    });
  }
  function instantScroll(x, y) {
    window.scrollTo({ left: position(x), top: position(y), behavior: "instant" });
  }
  function plainClick(event, link) {
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        link.hasAttribute("download")) return false;
    var destination = link.getAttribute("target");
    return !destination || ["_self", "_top", "_parent"].indexOf(destination) !== -1;
  }

  /* Impression du contenu, sans le bandeau ni les menus.
   * Les descriptions dépliables sont ouvertes le temps de l'impression. */
  var printedDetails = [];
  window.addEventListener("beforeprint", function () {
    printedDetails = [];
    var mirror = document.querySelector(".print-content-mirror");
    if (mirror) mirror.setAttribute("aria-hidden", "false");
    document.querySelectorAll(".content-card details").forEach(function (item) {
      printedDetails.push({ item: item, open: item.open });
      item.open = true;
    });
  });
  window.addEventListener("afterprint", function () {
    var mirror = document.querySelector(".print-content-mirror");
    if (mirror) mirror.setAttribute("aria-hidden", "true");
    printedDetails.forEach(function (state) { state.item.open = state.open; });
    printedDetails = [];
  });

  /* La sous-page transmet son défilement ; aucun lien de rubrique ne
   * recharge le bandeau, le menu ou la fenêtre principale. */
  if (window.self !== window.top) {
    var embeddedPage = document.body.getAttribute("data-shell-page");
    function sendContent(type, fields) {
      var message = Object.assign({ type: type, page: embeddedPage }, fields || {});
      window.parent.postMessage(message, "*");
    }
    function reportHeight() {
      var article = document.querySelector(".content-card");
      var height = article
        ? Math.max(article.getBoundingClientRect().bottom + window.scrollY, document.body.offsetHeight)
        : document.documentElement.scrollHeight;
      sendContent("fm-content-height", { height: Math.ceil(height) });
    }
    function reportPrintContent() {
      var article = document.querySelector(".content-card");
      if (article) sendContent("fm-print-content", { content: article.outerHTML });
    }
    var stateQueued = false;
    function reportView() {
      if (stateQueued) return;
      stateQueued = true;
      window.requestAnimationFrame(function () {
        stateQueued = false;
        sendContent("fm-view", { view: contentView() });
      });
    }
    document.addEventListener("DOMContentLoaded", function () {
      reportHeight();
      reportPrintContent();
      sendContent("fm-ready");
      if (window.ResizeObserver) new ResizeObserver(reportHeight).observe(document.body);
    });
    window.addEventListener("load", function () { reportHeight(); reportPrintContent(); });
    window.addEventListener("scroll", reportView, { passive: true });
    document.addEventListener("toggle", function () { reportHeight(); reportPrintContent(); reportView(); }, true);
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (!plainClick(event, link)) return;
      var selection = selectionForHref(link.getAttribute("href") || "");
      if (!selection) return;
      event.preventDefault();
      sendContent("fm-navigate", { selection: selection, view: contentView() });
    });
    window.addEventListener("message", function (event) {
      if (event.source !== window.parent || !acceptsOrigin(event.origin) || !event.data ||
          event.data.type !== "fm-restore-view" || event.data.page !== embeddedPage) return;
      var view = safeView(event.data.view);
      restoreDetails(view);
      window.requestAnimationFrame(function () {
        var offset = null;
        var anchor = event.data.anchor;
        if (typeof anchor === "string" && anchor) {
          try { anchor = decodeURIComponent(anchor); } catch (error) { anchor = ""; }
          var destination = anchor ? document.getElementById(anchor) : null;
          if (destination) offset = position(destination.getBoundingClientRect().top + window.scrollY);
        }
        instantScroll(view.x, offset === null ? view.y : offset);
        reportHeight();
        reportPrintContent();
        sendContent("fm-restored", { view: contentView(), anchorOffset: offset, restoreId: event.data.restoreId });
      });
    });
    return;
  }

  var target = document.getElementById("site-sidebar");
  var header = document.getElementById("site-header");
  if (!target || !header) return;

  header.innerHTML = `
    <a class="header-mark" href="index.html" aria-label="Frédéric Magoulès — home">
      <img src="assets/images/site-header-01.png" alt="" width="152" height="150">
      <img src="assets/images/site-header-02.png" alt="" width="149" height="150">
      <img src="assets/images/site-header-03.png" alt="" width="148" height="150">
    </a>
    <div class="header-identity">
      <a class="header-name" href="index.html" aria-label="Frédéric Magoulès BSc, MSc, PhD, FIMA, FBCS">Frédéric Magoulès<span class="header-credentials">BSc, MSc, PhD, FIMA, FBCS</span></a>
      <p>Professor of Applied Mathematics and Scientific Computing</p>
      <p>Numerical Analysis · Scientific Computing · Scientific Machine Learning</p>
    </div>`;

  target.innerHTML = `
    <nav class="site-nav" aria-label="Main navigation">
      <details class="nav-group">
        <summary>Curriculum Vitae</summary>
        <ul>
          <li><a data-nav="biosketch" href="index.html">Biosketch</a></li>
          <li><a href="pdfs/biosketch.pdf" target="_blank" rel="noopener">Biosketch (PDF)</a></li>
          <li><a data-nav="cv" href="pdfs/curriculum.pdf" target="_blank" rel="noopener">Curriculum Vitae (PDF)</a></li>
          <li><a data-nav="honours-leadership" href="honours-leadership.html">Academic Recognition</a></li>
        </ul>
      </details>

      <details class="nav-group">
        <summary>Publications</summary>
        <ul>
          <li><a data-nav="publications" href="publications.html">Selected publications</a></li>
          <li><a href="pdfs/publications.pdf" target="_blank" rel="noopener">Complete List (PDF)</a></li>
        </ul>
      </details>

      <details class="nav-group books">
        <summary>Books</summary>
        <ul>
          <li><a data-nav="authored-books" href="authored-books.html">Authored books</a></li>
          <li><a data-nav="edited-books" href="edited-books.html">Edited books</a></li>
          <li><a data-nav="edited-proceedings" href="edited-conference-proceedings.html">Edited Conference Proceedings</a></li>
        </ul>
      </details>

      <details class="nav-group issues">
        <summary>Special Issues</summary>
        <ul>
          <li><a data-nav="issues" href="special-issues.html">Guest-Edited Journal Issues</a></li>
        </ul>
      </details>

      <details class="nav-group">
        <summary>Press Coverage</summary>
        <ul>
          <li><a data-nav="press" href="press-coverage.html">Media and Press Coverage</a></li>
          <li><a href="pdfs/press-coverage.pdf" target="_blank" rel="noopener">Complete Coverage (PDF)</a></li>
        </ul>
      </details>

      <!-- Research menu temporarily hidden.
      <details class="nav-group">
        <summary>Research</summary>
        <ul>
          <li><a data-nav="research" href="research.html">Research themes</a></li>
        </ul>
      </details>
      -->


      <details class="nav-group galleries">
        <summary>Galleries</summary>
        <ul>
          <li><a data-nav="pictures" href="pictures.html">Scientific gallery</a></li>
        </ul>
      </details>

      <details class="nav-group">
        <summary>Teaching</summary>
        <ul>
          <li><a data-nav="teaching" href="teaching.html">Teaching resources</a></li>
        </ul>
      </details>

      <!-- Contact menu temporarily hidden.
      <details class="nav-group">
        <summary>Contact</summary>
        <ul>
          <li><a data-nav="contact" href="contact.html">Contact information</a></li>
        </ul>
      </details>
      -->
    </nav>

    <div class="profile-links" aria-label="Academic profiles">
      <a href="https://cv.hal.science/magoulesf" rel="me noopener" target="_blank">HAL</a>
      <a href="https://orcid.org/0000-0002-1198-7539" rel="me noopener" target="_blank">ORCID</a>
      <a href="https://scholar.google.com/citations?user=Nqu5zWwAAAAJ" rel="me noopener" target="_blank">Google Scholar</a>
    </div>`;

  /* Même comportement que l'accordéon du site historique : une seule
   * rubrique peut être ouverte. La géométrie du menu reste ainsi identique
   * avant et après le chargement d'un sous-menu. */
  var groups = target.querySelectorAll("details.nav-group");
  groups.forEach(function (group) {
    group.addEventListener("toggle", function () {
      if (!group.open) return;
      groups.forEach(function (other) {
        if (other !== group) other.open = false;
      });
    });
  });

  function activate(active) {
    target.querySelectorAll(".nav-group a.active").forEach(function (link) {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
    groups.forEach(function (group) {
      group.classList.remove("nav-group-active");
      group.open = false;
    });

    if (active) {
      active.classList.add("active");
      active.setAttribute("aria-current", "page");
      var group = active.closest(".nav-group");
      if (group) {
        group.classList.add("nav-group-active");
        group.open = true;
      }
    }
  }

  var current = document.body.getAttribute("data-nav-key");
  var active = current
    ? target.querySelector('[data-nav="' + current + '"]')
    : null;
  activate(active);

  /* Navigation commune, positions mémorisées en mémoire et dans l'historique.
   * Le même panneau droit sert aux menus et aux liens dans les pages. */
  if (document.body.getAttribute("data-frame-shell") === "true") {
    document.addEventListener("DOMContentLoaded", function () {
      var main = document.querySelector(".main-column");
      var home = main ? main.querySelector(".content-card") : null;
      var footer = main ? main.querySelector(".site-footer") : null;
      if (!main || !home) return;
      var frame = document.createElement("iframe");
      frame.id = "site-content-frame";
      frame.name = "site-content-frame";
      frame.className = "content-frame";
      frame.title = "Page content";
      frame.hidden = true;
      frame.setAttribute("loading", "eager");
      main.insertBefore(frame, footer || null);
      var printMirror = document.createElement("div");
      printMirror.className = "print-content-mirror";
      printMirror.setAttribute("aria-hidden", "true");
      document.body.appendChild(printMirror);
      var links = Array.prototype.slice.call(target.querySelectorAll(".site-nav a[data-nav]"));
      var allowed = {};
      links.forEach(function (link) { allowed[link.getAttribute("href")] = link; });
      var shellPage = document.body.getAttribute("data-shell-page") || "index.html";
      var currentSelection = shellPage;
      var currentContent = contentView();
      var currentEntry = "";
      var pageViews = {};
      var entryViews = {};
      var serial = 0;
      var entryPrefix = String(Date.now()) + "-";
      var loadedPage = null;
      var pendingRestore = null;
      var restoreSerial = 0;
      try { window.history.scrollRestoration = "manual"; } catch (error) {}

      function windowView() { return safeView({ x: window.scrollX, y: window.scrollY }); }
      function copyState(state) {
        return { outer: safeView(state && state.outer), content: safeView(state && state.content) };
      }
      function capture(view) {
        var state = { outer: windowView(), content: frame.hidden ? contentView() : safeView(view || currentContent) };
        pageViews[pageOf(currentSelection)] = copyState(state);
        if (currentEntry) entryViews[currentEntry] = copyState(state);
        currentContent = state.content;
        return state;
      }
      function historyData(selection, state, entry) {
        return { selection: selection, view: copyState(state), entry: entry };
      }
      function record(method, data, url) {
        try {
          var state = Object.assign({}, window.history.state || {});
          state.fmNavigation = data;
          if (url === undefined) window.history[method](state, "");
          else window.history[method](state, "", url);
          return true;
        } catch (error) { return false; }
      }
      function pageFromHash() {
        var value = window.location.hash.replace(/^#/, "");
        try { value = decodeURIComponent(value); } catch (error) { value = ""; }
        if (navigationPages.indexOf(pageOf(value)) !== -1) return value;
        return value && document.getElementById(value) ? shellPage + "#" + value : shellPage;
      }
      function restoreWindow(view) {
        window.requestAnimationFrame(function () {
          var maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          instantScroll(view.x, Math.min(position(view.y), maxY));
        });
      }
      function requestRestore() {
        if (!pendingRestore || loadedPage !== pageOf(currentSelection)) return;
        frame.contentWindow.postMessage({
          type: "fm-restore-view", page: loadedPage,
          view: pendingRestore.state.content, anchor: pendingRestore.anchor, restoreId: pendingRestore.id
        }, window.location.protocol === "file:" ? "*" : window.location.origin);
      }
      function showPage(selection, state, followAnchor) {
        currentSelection = selection;
        var page = pageOf(selection);
        var anchor = !followAnchor || selection.indexOf("#") === -1 ? "" : selection.slice(selection.indexOf("#") + 1);
        var activeLink = allowed[page] || null;
        activate(activeLink);
        currentContent = safeView(state.content);
        if (page === shellPage) {
          pendingRestore = null;
          frame.hidden = true;
          home.hidden = false;
          document.body.classList.remove("print-frame-active");
          restoreDetails(state.content);
          if (anchor) {
            try { anchor = decodeURIComponent(anchor); } catch (error) { anchor = ""; }
            var destination = anchor ? document.getElementById(anchor) : null;
            if (destination) state.outer.y = destination.getBoundingClientRect().top + window.scrollY;
          }
          restoreWindow(state.outer);
          return;
        }
        home.hidden = true;
        frame.hidden = false;
        frame.title = activeLink ? activeLink.textContent.trim() : "Page content";
        pendingRestore = { state: copyState(state), anchor: anchor, id: ++restoreSerial };
        if (frame.getAttribute("src") !== page) {
          loadedPage = null;
          printMirror.innerHTML = "";
          document.body.classList.remove("print-frame-active");
          // Keep the previous height while the next page loads. Collapsing
          // it here would clamp the outer window's scroll position.
          frame.src = page;
        } else requestRestore();
      }
      function navigate(selection, view) {
        if (navigationPages.indexOf(pageOf(selection)) === -1) return;
        var previous = capture(view);
        record("replaceState", historyData(currentSelection, previous, currentEntry));
        var destination = pageViews[pageOf(selection)];
        if (!destination) destination = {
          outer: previous.outer, content: { x: previous.content.x, y: previous.content.y }
        };
        if (selection !== currentSelection) {
          currentEntry = entryPrefix + (++serial);
          var hash = "#" + encodeURIComponent(selection);
          if (!record("pushState", historyData(selection, destination, currentEntry), hash)) {
            window.location.hash = hash;
          }
        }
        showPage(selection, copyState(destination), true);
      }
      document.addEventListener("click", function (event) {
        var link = event.target.closest("a");
        if (!plainClick(event, link)) return;
        var href = link.getAttribute("href") || "";
        // The skip link focuses the current pane without replacing the
        // selected page with the shell's own inline content.
        if (href === "#main-content") {
          event.preventDefault();
          var content = document.getElementById("main-content");
          if (content) {
            if (typeof content.focus === "function") content.focus({ preventScroll: true });
            instantScroll(window.scrollX, content.getBoundingClientRect().top + window.scrollY);
          }
          return;
        }
        // Other anchors in the top document remain ordinary HTML links.
        if (href.charAt(0) === "#") return;
        var selection = selectionForHref(href);
        if (!selection) return;
        event.preventDefault();
        navigate(selection);
      });
      function traverse(event) {
        var selection = pageFromHash();
        if (event.type === "hashchange" && selection === currentSelection) return;
        capture();
        var data = (event.state || window.history.state || {}).fmNavigation;
        var state = data && data.selection === selection
          ? entryViews[data.entry] || data.view : pageViews[pageOf(selection)];
        currentEntry = data && data.entry ? data.entry : entryPrefix + (++serial);
        showPage(selection, copyState(state || { outer: windowView(), content: currentContent }), event.type === "hashchange" || !state);
      }
      window.addEventListener("popstate", traverse);
      window.addEventListener("hashchange", traverse);
      window.addEventListener("scroll", function () { if (!pendingRestore) capture(); }, { passive: true });
      window.addEventListener("message", function (event) {
        if (event.source !== frame.contentWindow || !acceptsOrigin(event.origin) || !event.data ||
            event.data.page !== pageOf(currentSelection) || frame.hidden) return;
        var data = event.data;
        if (data.type === "fm-navigate") {
          if (typeof data.selection === "string") {
            var selection = selectionForHref(data.selection);
            if (selection) navigate(selection, safeView(data.view));
          }
          return;
        }
        if (data.type === "fm-ready") { loadedPage = data.page; requestRestore(); return; }
        if (data.type === "fm-view") {
          if (!pendingRestore) capture(safeView(data.view));
          return;
        }
        if (data.type === "fm-restored") {
          if (!pendingRestore || data.restoreId !== pendingRestore.id) return;
          var desired = pendingRestore.state.outer;
          currentContent = safeView(data.view);
          if (data.anchorOffset !== null && Number.isFinite(data.anchorOffset)) {
            var frameTop = frame.getBoundingClientRect().top + window.scrollY;
            // A full-height mobile frame scrolls with the outer page. A
            // desktop frame keeps its own scroll and the surrounding shell.
            if (window.matchMedia("(max-width: 800px)").matches) {
              desired.y = frameTop + position(data.anchorOffset);
            } else desired.y = Math.min(desired.y, Math.max(0, frameTop));
          }
          pendingRestore = null;
          pageViews[data.page] = { outer: safeView(desired), content: safeView(currentContent) };
          restoreWindow(desired);
          return;
        }
        if (data.type === "fm-content-height") {
          var height = Number(data.height);
          if (Number.isFinite(height) && height > 0 && height < 10000000) {
            frame.style.setProperty("--frame-content-height", Math.ceil(height) + "px");
          }
          return;
        }
        if (data.type === "fm-print-content" && typeof data.content === "string" && data.content.length < 1000000) {
          printMirror.innerHTML = data.content;
          printMirror.querySelectorAll("script, iframe, object, embed").forEach(function (item) { item.remove(); });
          printMirror.querySelectorAll("[id]").forEach(function (item) { item.removeAttribute("id"); });
          document.body.classList.add("print-frame-active");
        }
      });
      var initialSelection = pageFromHash();
      var initialData = (window.history.state || {}).fmNavigation;
      var initialState = initialData && initialData.selection === initialSelection
        ? copyState(initialData.view) : { outer: windowView(), content: contentView() };
      currentEntry = initialData && initialData.entry ? initialData.entry : entryPrefix + (++serial);
      record("replaceState", historyData(initialSelection, initialState, currentEntry));
      showPage(initialSelection, initialState, !initialData || initialData.selection !== initialSelection);
    });
  }
}());
