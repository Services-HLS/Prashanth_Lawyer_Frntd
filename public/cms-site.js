// Published Work & Analysis — articles + books from MySQL
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stripHtml(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return (d.textContent || d.innerText || "").trim();
  }

  function isOutlineOrToc(text) {
    if (!text) return false;
    var t = text.replace(/\s+/g, " ").trim();
    if (/^table of contents$/i.test(t)) return true;
    if (/table of contents/i.test(t.slice(0, 80)) && t.length < 500) return true;
    if ((t.match(/\bmeaning of\b/gi) || []).length >= 2) return true;
    if ((t.match(/\bsection\s+\d+/gi) || []).length >= 2) return true;
    return false;
  }

  function isOutlineLine(line) {
    if (!line || /^table of contents$/i.test(line)) return true;
    if (/^\d+\.\s/.test(line) && line.length < 100 && !/[.!?]$/.test(line)) return true;
    if (/^meaning of\b/i.test(line) && line.length < 120) return true;
    return isOutlineOrToc(line);
  }

  function firstReadableParagraph(htmlOrText, minLen) {
    minLen = minLen || 50;
    var raw = String(htmlOrText || "").replace(/<!--\s*METADATA_START[\s\S]*?-->\s*$/i, "").trim();
    if (!raw) return "";
    if (raw.indexOf("<p") >= 0) {
      var parts = raw.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
      for (var i = 0; i < parts.length; i++) {
        var text = stripHtml(parts[i]).trim();
        if (text.length >= minLen && !isOutlineLine(text)) return text;
      }
    }
    var plain = stripHtml(raw);
    var chunks = plain.split(/\n\n+/);
    for (var j = 0; j < chunks.length; j++) {
      var c = chunks[j].trim();
      if (c.length >= minLen && !isOutlineLine(c)) return c;
    }
    return "";
  }

  function cleanExcerpt(row, maxLen) {
    var desc = field(row, "description") || "";
    var content = field(row, "content") || "";
    var text = "";
    if (desc && !isOutlineOrToc(stripHtml(desc))) text = stripHtml(desc);
    else text = firstReadableParagraph(content, 50);
    if (!text && desc) text = stripHtml(desc);
    if (!text) text = firstReadableParagraph(content, 40);
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > maxLen) text = text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
    return text;
  }

  function field(row, key) {
    return row[key];
  }

  function formatDate(d) {
    if (!d) return "";
    var dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  }

  function siteOrigin() {
    var origin = window.location.origin || "";
    try {
      if (window.parent && window.parent !== window && window.parent.location.origin) {
        origin = window.parent.location.origin;
      }
    } catch (e1) {
      /* ignore */
    }
    return origin.replace(/\/$/, "");
  }

  function detailPageUrl(kind, slug) {
    if (!slug) return "#contact";
    var path = kind === "book" ? "/book/" : kind === "podcast" ? "/podcast/" : "/article/";
    return siteOrigin() + path + encodeURIComponent(slug);
  }

  function isHttpImage(src) {
    if (!src) return false;
    var s = String(src).trim();
    return (
      s.indexOf("http://") === 0 ||
      s.indexOf("https://") === 0 ||
      s.indexOf("/uploads/") === 0
    );
  }

  function isUsableImage(src) {
    if (!src) return false;
    var s = String(src).trim();
    if (isHttpImage(s)) return true;
    if (s.indexOf("data:image/") === 0 && s.length < 600000) return true;
    return false;
  }

  function parseGallery(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).filter(isUsableImage);
    var str = String(raw).trim();
    if (!str) return [];
    if (str.charAt(0) === "[") {
      try {
        var arr = JSON.parse(str);
        if (Array.isArray(arr)) return arr.map(String).filter(isUsableImage);
      } catch (e2) {
        /* ignore */
      }
    }
    return isUsableImage(str) ? [str] : [];
  }

  function listThumb(row, kind) {
    if (kind === "book") {
      var cover = field(row, "cover_image") || field(row, "coverImage");
      if (isUsableImage(cover)) return cover;
      return "";
    }
    var featured = field(row, "featured_image") || field(row, "featuredImage");
    if (isUsableImage(featured)) return featured;
    var gallery = parseGallery(field(row, "gallery_images") || field(row, "galleryImages"));
    if (gallery.length) return gallery[0];
    return "";
  }

  function thumbHtml(src, alt) {
    if (!src) return "";
    return (
      '<div class="a-thumb-wrap"><img class="a-thumb" src="' +
      esc(src) +
      '" alt="' +
      esc(alt || "") +
      '" loading="lazy" /></div>'
    );
  }

  function articleCat(a) {
    var c = String(field(a, "category") || "").toLowerCase();
    if (c.indexOf("oxford") >= 0) return "oxford";
    if (c.indexOf("lexis") >= 0) return "lexis";
    var t = String(field(a, "type") || "").toLowerCase();
    if (t === "legal_opinion" || c.indexOf("opinion") >= 0) return "opinion";
    if (t === "guide" || c.indexOf("guide") >= 0) return "guide";
    return "all";
  }

  function cardBodyHtml(parts) {
    return '<div class="article-card-body">' + parts + "</div>";
  }

  function articleCard(a, featured) {
    var cat = articleCat(a);
    var tagCls = cat === "all" ? "guide" : cat;
    var desc = cleanExcerpt(a, featured ? 220 : 160);
    var slug = field(a, "slug");
    var href = detailPageUrl("article", slug);
    var date = formatDate(field(a, "publish_date"));
    var tag = esc(field(a, "category") || field(a, "type") || "Article");
    var author = esc(field(a, "author") || "Prasanth Raju");
    var thumb = listThumb(a, "article");
    var extra = featured ? " oxford-featured featured" : "";
    var withImg = thumb ? " with-image" : "";
    var body = cardBodyHtml(
      '<span class="a-tag ' +
        tagCls +
        '">' +
        tag +
        (date ? " · " + date : "") +
        "</span>" +
        "<h3 class=\"a-title\">" +
        esc(field(a, "title")) +
        "</h3>" +
      '<p class="a-excerpt">' +
      esc(desc) +
      "</p>" +
        '<div class="a-meta"><span class="a-pub">' +
        author +
        '</span></div><span class="a-read">Read full article →</span>',
    );
    return (
      '<a href="' +
      href +
      '" target="_blank" rel="noopener" class="article-card fade-up visible' +
      extra +
      withImg +
      '" style="opacity:1;transform:none;color:inherit" data-cat="' +
      cat +
      '" data-kind="article" data-slug="' +
      esc(slug) +
      '">' +
      thumbHtml(thumb, field(a, "title")) +
      body +
      "</a>"
    );
  }

  function bookCard(b) {
    var slug = field(b, "slug");
    var href = detailPageUrl("book", slug);
    var date = formatDate(field(b, "publication_date"));
    var desc = field(b, "excerpt") || cleanExcerpt(b, 140);
    var thumb = listThumb(b, "book");
    var withImg = thumb ? " with-image" : "";
    var body = cardBodyHtml(
      '<span class="a-tag guide">Book' +
        (date ? " · " + date : "") +
        "</span>" +
        "<h3 class=\"a-title\">" +
        esc(field(b, "title")) +
        "</h3>" +
      '<p class="a-excerpt">' +
      esc(desc) +
      "</p>" +
        '<div class="a-meta"><span class="a-pub">' +
        esc(field(b, "author") || field(b, "publisher") || "Prasanth Raju") +
        '</span></div><span class="a-read">View book →</span>',
    );
    return (
      '<a href="' +
      href +
      '" target="_blank" rel="noopener" class="article-card fade-up visible' +
      withImg +
      '" style="opacity:1;transform:none;color:inherit" data-cat="all" data-kind="book" data-slug="' +
      esc(slug) +
      '">' +
      thumbHtml(thumb, field(b, "title")) +
      body +
      "</a>"
    );
  }

  function podcastCard(p) {
    var slug = field(p, "slug");
    var href = slug ? detailPageUrl("podcast", slug) : siteOrigin() + "/podcast";
    var date = formatDate(field(p, "publish_date") || field(p, "created_at"));
    var desc = stripHtml(field(p, "summary") || "") || cleanExcerpt(p, 140);
    var thumb = field(p, "cover_image") || field(p, "coverImage");
    var withImg = isUsableImage(thumb) ? " with-image" : "";
    var body = cardBodyHtml(
      '<span class="a-tag guide">Podcast' +
        (date ? " · " + date : "") +
        "</span>" +
        "<h3 class=\"a-title\">" +
        esc(field(p, "title")) +
        "</h3>" +
      '<p class="a-excerpt">' +
      esc(desc) +
      "</p>" +
        '<div class="a-meta"><span class="a-pub">' +
        esc(field(p, "guest_name") || field(p, "author") || "Prasanth Raju") +
        '</span></div><span class="a-read">Read podcast →</span>',
    );
    return (
      '<a href="' +
      href +
      '" target="_blank" rel="noopener" class="article-card fade-up visible' +
      withImg +
      '" style="opacity:1;transform:none;color:inherit" data-cat="all" data-kind="podcast" data-slug="' +
      esc(slug || "") +
      '">' +
      thumbHtml(isUsableImage(thumb) ? thumb : "", field(p, "title")) +
      body +
      "</a>"
    );
  }

  function fallbackPodcasts() {
    return [
      {
        slug: "",
        title: "Legal Insights Weekly",
        publish_date: new Date().toISOString(),
        guest_name: "Prasanth Raju",
        description:
          "Short legal commentary on arbitration, GST, and corporate disputes. New episodes are being prepared and will appear here soon.",
      },
      {
        slug: "",
        title: "Practical Law Notes",
        publish_date: new Date().toISOString(),
        guest_name: "Prasanth Raju",
        description:
          "Case-based practical guidance for businesses and individuals. This is a text-only preview card until backend podcast entries are added.",
      },
    ];
  }

  function applyMysqlArticleImages(row, data) {
    if (!data) return;
    var img = data.featured_image || data.featuredImage;
    if (isUsableImage(img)) row.featured_image = img;
    else {
      var gal = parseGallery(data.gallery_images || data.galleryImages);
      if (gal.length) row.featured_image = gal[0];
    }
    if (data.gallery_images != null) row.gallery_images = data.gallery_images;
  }

  function applyMysqlBookCover(row, data) {
    if (!data) return;
    var cover = data.cover_image || data.coverImage;
    if (isUsableImage(cover)) row.cover_image = cover;
  }

  async function loadArticleImagesFromMysql(articleList) {
    var base = apiBase();
    var tasks = articleList
      .filter(function (a) {
        return field(a, "slug") && !listThumb(a, "article");
      })
      .map(function (a) {
        var slug = field(a, "slug");
        return fetch(base + "/images/articles/" + encodeURIComponent(slug), {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (json) {
            if (json.success && json.data) applyMysqlArticleImages(a, json.data);
          })
          .catch(function () {
            /* ignore */
          });
      });
    await Promise.all(tasks);
  }

  async function loadBookCoversFromMysql(bookList) {
    var base = apiBase();
    var tasks = bookList
      .filter(function (b) {
        return field(b, "slug") && !listThumb(b, "book");
      })
      .map(function (b) {
        var slug = field(b, "slug");
        return fetch(base + "/images/books/" + encodeURIComponent(slug), {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (json) {
            if (json.success && json.data) applyMysqlBookCover(b, json.data);
          })
          .catch(function () {
            /* ignore */
          });
      });
    await Promise.all(tasks);
  }

  function renderBooksSection(bookList) {
    var section = document.getElementById("writing-books-section");
    var grid = document.getElementById("writing-books-grid");
    if (!section || !grid) return;
    if (!bookList.length) {
      section.hidden = true;
      grid.innerHTML = "";
      return;
    }
    section.hidden = false;
    section.classList.add("visible");
    section.style.opacity = "1";
    grid.innerHTML = bookList.map(bookCard).join("");
    grid.classList.add("visible");
    grid.style.opacity = "1";
  }

  function renderPodcastsSection(podcastList) {
    var section = document.getElementById("writing-podcasts-section");
    var grid = document.getElementById("writing-podcasts-grid");
    if (!section || !grid) return;
    if (!podcastList.length) {
      section.hidden = true;
      grid.innerHTML = "";
      return;
    }
    section.hidden = false;
    section.classList.add("visible");
    section.style.opacity = "1";
    grid.innerHTML = podcastList.map(podcastCard).join("");
    grid.classList.add("visible");
    grid.style.opacity = "1";
  }

  var HOME_PREVIEW_ARTICLES = 2;
  var HOME_PREVIEW_BOOKS = 2;
  var HOME_PREVIEW_PODCASTS = 2;

  function render(articles, books, podcasts, options) {
    if (arguments.length === 3 && typeof podcasts === "object" && !Array.isArray(podcasts)) {
      options = podcasts;
      podcasts = [];
    }
    options = options || {};
    var preview = options.preview !== false;

    var primary = document.getElementById("writing-grid-primary");
    var secondary = document.getElementById("writing-grid-secondary");
    if (!primary) {
      console.warn("CMS: #writing-grid-primary not found");
      return;
    }

    var articleList = (articles || []).filter(function (a) {
      return field(a, "type") !== "legal_opinion";
    });
    var bookList = books || [];
    var podcastList = podcasts || [];

    // Keep layout unchanged; only prevent duplicate records from API/cache merges.
    function normalizedKey(row, type) {
      var slug = String(field(row, "slug") || "").trim().toLowerCase();
      var id = String(field(row, "id") || "").trim().toLowerCase();
      var title = String(field(row, "title") || "").trim().toLowerCase();
      var date =
        String(field(row, type === "book" ? "publication_date" : "publish_date") || "")
          .trim()
          .toLowerCase();
      if (slug) return type + ":slug:" + slug;
      if (id) return type + ":id:" + id;
      if (title) return type + ":title:" + title + ":" + date;
      return "";
    }

    var seenArticle = {};
    articleList = articleList.filter(function (a) {
      var key = normalizedKey(a, "article");
      if (!key) return true;
      if (seenArticle[key]) return false;
      seenArticle[key] = true;
      return true;
    });

    var seenBook = {};
    bookList = bookList.filter(function (b) {
      var key = normalizedKey(b, "book");
      if (!key) return true;
      if (seenBook[key]) return false;
      seenBook[key] = true;
      return true;
    });

    if (preview) {
      articleList = articleList.slice(0, HOME_PREVIEW_ARTICLES);
      bookList = bookList.slice(0, HOME_PREVIEW_BOOKS);
      podcastList = podcastList.slice(0, HOME_PREVIEW_PODCASTS);
    }

    renderBooksSection(bookList);
    renderPodcastsSection(podcastList);

    if (!articleList.length && !bookList.length && !podcastList.length) {
      primary.innerHTML =
        '<p style="grid-column:1/-1;padding:2rem;color:var(--text-muted);opacity:1">' +
        "No published items. Admin → Articles or Books → set status to <strong>published</strong>, then refresh." +
        "</p>";
      if (secondary) secondary.innerHTML = "";
      return;
    }

    if (articleList.length) {
      if (preview) {
        // Home preview: show first two article cards in equal boxes (same style as books grid feel)
        primary.className = "writing-grid writing-grid--more fade-up visible";
        primary.innerHTML = articleList
          .slice(0, 2)
          .map(function (a) {
            return articleCard(a, false);
          })
          .join("");
        primary.style.opacity = "1";
        if (secondary) {
          secondary.innerHTML = "";
          secondary.hidden = true;
        }
      } else {
        var featured = articleCard(articleList[0], true);
        var side = articleList
          .slice(1, 3)
          .map(function (a) {
            return articleCard(a, false);
          })
          .join("");
        primary.className = "writing-grid fade-up";
        primary.innerHTML =
          '<div class="writing-hero-row">' +
          featured +
          (side ? '<div class="articles-side">' + side + "</div>" : "") +
          "</div>";
        primary.classList.add("visible");
        primary.style.opacity = "1";

        if (secondary) {
          secondary.hidden = false;
          secondary.className = "writing-grid writing-grid--more fade-up visible";
          secondary.innerHTML = articleList.slice(3).map(articleCard).join("");
          secondary.style.opacity = "1";
        }
      }
    } else {
      primary.innerHTML =
        '<p style="grid-column:1/-1;padding:2rem;color:var(--text-muted);opacity:1">' +
        "Browse published books below." +
        "</p>";
      primary.classList.add("visible");
      primary.style.opacity = "1";
      if (secondary) secondary.innerHTML = "";
    }

    if (typeof window.filterArticles === "function") {
      var activeBtn = document.querySelector("#writing .filter-btn.active");
      if (activeBtn) {
        var cat = activeBtn.getAttribute("data-cat") || "all";
        window.filterArticles(cat, activeBtn);
      }
    }

    window.__cmsWritingLoaded = true;
  }

  function showError(msg) {
    var primary = document.getElementById("writing-grid-primary");
    if (!primary) return;
    primary.innerHTML =
      '<p style="grid-column:1/-1;padding:2rem;color:#b91c1c;opacity:1">' + esc(msg) + "</p>";
  }

  function apiBase() {
    var origin = "";
    try {
      if (window.parent && window.parent !== window && window.parent.location.origin) {
        origin = window.parent.location.origin;
      }
    } catch (e1) {
      /* ignore */
    }
    if (!origin) origin = window.location.origin || "";
    return origin.replace(/\/$/, "") + "/api/v1";
  }

  async function fetchBooksFeed(base) {
    var res = await fetch(base + "/books/feed", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    var json = await res.json();
    if (!res.ok) throw new Error((json && json.error) || "HTTP " + res.status);
    if (json.success && json.data) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  }

  async function fetchPodcastsFeed(base) {
    var res = await fetch(base + "/podcasts", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    var json = await res.json();
    if (!res.ok) throw new Error((json && json.error) || "HTTP " + res.status);
    var list = [];
    if (json.success && json.data) list = json.data;
    else if (Array.isArray(json)) list = json;
    list = (list || []).filter(function (p) {
      var status = String(field(p, "status") || "").toLowerCase();
      return !status || status === "published";
    });
    return list;
  }

  async function fetchFromDatabase() {
    var base = apiBase();
    var res = await fetch(base + "/site/writing", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    var json = await res.json();
    if (!res.ok) throw new Error((json && json.error) || "HTTP " + res.status);
    if (!json.success || !json.data) throw new Error("Bad API response");
    var articles = json.data.articles || [];
    var books = json.data.books || [];
    var podcasts = [];
    if (!books.length) {
      try {
        books = await fetchBooksFeed(base);
      } catch (eBooks) {
        console.warn("CMS: books feed fallback failed", eBooks);
      }
    }
    try {
      podcasts = await fetchPodcastsFeed(base);
    } catch (ePodcasts) {
      console.warn("CMS: podcasts feed failed", ePodcasts);
    }
    if (!podcasts.length) {
      podcasts = fallbackPodcasts();
    }
    return { articles: articles, books: books, podcasts: podcasts };
  }

  async function loadWriting() {
    try {
      var data = await fetchFromDatabase();
      var articleList = (data.articles || []).filter(function (a) {
        return field(a, "type") !== "legal_opinion";
      });
      await loadArticleImagesFromMysql(articleList);
      await loadBookCoversFromMysql(data.books || []);
      render(data.articles, data.books, data.podcasts || []);
    } catch (e) {
      console.error("Published Work load failed:", e);
      showError(
        "Could not load from database. Ensure backend is on port 3001 (npm run build && npm start in backend/), then refresh. " +
          (e && e.message ? e.message : ""),
      );
    }
  }

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "CMS_WRITING") return;
    var articles = event.data.articles || [];
    var books = event.data.books || [];
    var podcasts = event.data.podcasts || [];
    var articleList = articles.filter(function (a) {
      return field(a, "type") !== "legal_opinion";
    });
    Promise.all([
      loadArticleImagesFromMysql(articleList),
      loadBookCoversFromMysql(books),
    ]).then(function () {
      render(articles, books, podcasts);
    });
  });

  window.loadWritingFromMysql = loadWriting;
  window.cmsRenderWriting = render;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWriting);
  } else {
    loadWriting();
  }
})();
