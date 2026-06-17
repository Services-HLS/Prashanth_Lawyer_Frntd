// Published Work & Analysis — articles + books from MySQL
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function timeAgo(dateString) {
    if (!dateString) return "";
    // Replace dashes with slashes for date parsing compatibility
    var date = new Date(dateString.replace(/-/g, "/"));
    var now = new Date();
    var seconds = Math.floor((now - date) / 1000);
    if (seconds < 0) seconds = 0;
    
    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? "1 year ago" : interval + " years ago";
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? "1 month ago" : interval + " months ago";
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? "yesterday" : interval + " days ago";
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? "1 hour ago" : interval + " hours ago";
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? "1 minute ago" : interval + " minutes ago";
    
    return "just now";
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
    if (s.indexOf("data:image/") === 0) return true;
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

  function thumbHtml(src, alt, kind, slug) {
    if (!src) return "";
    var dataKind = kind ? ' data-kind="' + esc(kind) + '"' : "";
    var dataSlug = slug ? ' data-slug="' + esc(slug) + '"' : "";
    return (
      '<div class="a-thumb-wrap"><img class="a-thumb" src="' +
      esc(src) +
      '" alt="' +
      esc(alt || "") +
      '" loading="lazy"' +
      dataKind +
      dataSlug +
      ' onerror="window.cmsThumbFallback && window.cmsThumbFallback(this)" /></div>'
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
      thumbHtml(thumb, field(a, "title"), "article", slug) +
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
      thumbHtml(thumb, field(b, "title"), "book", slug) +
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
      thumbHtml(isUsableImage(thumb) ? thumb : "", field(p, "title"), "podcast", slug) +
      body +
      "</a>"
    );
  }

  window.cmsThumbFallback = function (img) {
    try {
      if (!img || img.dataset.retried === "1") return;
      var kind = img.dataset.kind || "";
      var slug = img.dataset.slug || "";
      if (!slug || (kind !== "article" && kind !== "book")) return;
      img.dataset.retried = "1";
      fetch(apiBase() + "/images/" + (kind === "article" ? "articles/" : "books/") + encodeURIComponent(slug), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          if (!json || !json.success || !json.data) return;
          var candidate = "";
          if (kind === "article") {
            candidate = json.data.featured_image || "";
            if (!isUsableImage(candidate)) {
              var gallery = parseGallery(json.data.gallery_images);
              candidate = gallery[0] || "";
            }
          } else {
            candidate = json.data.cover_image || "";
          }
          if (isUsableImage(candidate)) {
            img.src = candidate;
          }
        })
        .catch(function () {
          /* ignore */
        });
    } catch (e) {
      /* ignore */
    }
  };

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
    var json = parseJsonResponse(await res.text());
    if (!res.ok) throw new Error(apiErrorMessage(json, res.status));
    if (json.success && json.data) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  }

  async function fetchPodcastsFeed(base) {
    var res = await fetch(base + "/podcasts", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    var json = parseJsonResponse(await res.text());
    if (!res.ok) throw new Error(apiErrorMessage(json, res.status));
    var list = [];
    if (json.success && json.data) list = json.data;
    else if (Array.isArray(json)) list = json;
    list = (list || []).filter(function (p) {
      var status = String(field(p, "status") || "").toLowerCase();
      return !status || status === "published";
    });
    return list;
  }

  function parseJsonResponse(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(text && text.trim() ? text.trim().slice(0, 160) : "Invalid JSON response");
    }
  }

  function apiErrorMessage(json, status) {
    if (!json) return "HTTP " + status;
    if (typeof json.error === "string") return json.error;
    if (json.error && typeof json.error.message === "string") return json.error.message;
    return "HTTP " + status;
  }

  async function fetchFromDatabase() {
    var base = apiBase();
    var res = await fetch(base + "/site/writing", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    var json = parseJsonResponse(await res.text());
    if (!res.ok) throw new Error(apiErrorMessage(json, res.status));
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

  async function loadReviews() {
    try {
      var base = apiBase();
      var res = await fetch(base + "/reviews", {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      var json = parseJsonResponse(await res.text());
      var reviews = [];
      if (json && json.success && json.data) reviews = json.data;
      else if (Array.isArray(json)) reviews = json;
      else if (json && Array.isArray(json.data)) reviews = json.data;

      var displayReviews = reviews.length > 0 ? reviews : [
        {
          name: "S.K.",
          email: "startup.founder@gmail.com",
          rating: 5,
          comment: "Prasanth's rare combination of IIM business acumen and legal expertise made all the difference in our commercial dispute. He didn't just argue the law — he understood our business.",
          avatar_url: ""
        },
        {
          name: "M.R.",
          email: "mfg.director@yahoo.com",
          rating: 5,
          comment: "Our GST audit was a nightmare until Prasanth stepped in. His understanding of both the commercial and legal dimensions resolved a year-long dispute in three months.",
          avatar_url: ""
        },
        {
          name: "J.L.",
          email: "gc.europe@mnc.com",
          rating: 5,
          comment: "As a foreign company entering India, we needed a lawyer who could bridge international arbitration norms with Indian legal reality. Prasanth was exactly that.",
          avatar_url: ""
        }
      ];

      var totalRating = 0;
      for (var i = 0; i < displayReviews.length; i++) {
        totalRating += displayReviews[i].rating;
      }
      var avgRating = displayReviews.length > 0 ? (totalRating / displayReviews.length).toFixed(1) : "5.0";
      
      var avgNumberEl = document.getElementById("reviews-average-number");
      var avgStarsEl = document.getElementById("reviews-average-stars");
      var countLabelEl = document.getElementById("reviews-count-label");

      if (avgNumberEl) avgNumberEl.innerText = avgRating;
      if (avgStarsEl) {
        var starsStr = "";
        var rounded = Math.round(Number(avgRating));
        for (var s = 0; s < 5; s++) {
          starsStr += s < rounded ? "★" : "☆";
        }
        avgStarsEl.innerText = starsStr;
      }
      if (countLabelEl) {
        countLabelEl.innerText = "Based on " + displayReviews.length + " " + (displayReviews.length === 1 ? "review" : "reviews");
      }

      var track = document.getElementById("reviews-marquee-track");
      if (track) {
        // Build repeated cards list for infinite scrolling
        var repeatedReviews = [];
        var repetitions = 3;
        if (displayReviews.length > 0) {
          // Make sure we have enough cards to fill the screen width and enable smooth looping
          repetitions = Math.max(3, Math.ceil(8 / displayReviews.length));
          for (var rIndex = 0; rIndex < repetitions; rIndex++) {
            repeatedReviews = repeatedReviews.concat(displayReviews);
          }
        }

        var cardsHtml = repeatedReviews.map(function(r) {
          var initials = r.name ? r.name.split(" ").map(function(n) { return n[0]; }).join("").toUpperCase().slice(0, 2) : "C";
          var avatarHtml = "";
          if (r.avatar_url) {
            avatarHtml = '<img class="author-avatar" src="' + esc(r.avatar_url) + '" alt="' + esc(r.name) + '" style="object-fit:cover; width:42px; height:42px;" />';
          } else {
            avatarHtml = '<div class="author-avatar">' + esc(initials) + '</div>';
          }

          var stars = "";
          for (var k = 0; k < 5; k++) {
            stars += k < r.rating ? "★" : "☆";
          }

          return (
            '<div class="testimonial-card review-marquee-card" style="width: 85vw; max-width: 380px; flex-shrink: 0;">' +
              '<div class="testimonial-stars" style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span>' + stars + '</span>' +
                '<span style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-mono); font-weight:500;">' + timeAgo(r.created_at) + '</span>' +
              '</div>' +
              '<p class="testimonial-text">"' + esc(r.comment) + '"</p>' +
              '<div class="testimonial-author">' +
                avatarHtml +
                '<div>' +
                  '<div class="author-name">' + esc(r.name) + '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }).join("");
        track.innerHTML = cardsHtml;

        // Initialize the infinite scrolling logic
        initReviewsScroller(repetitions);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  }

  function initReviewsScroller(repetitions) {
    var container = document.getElementById("reviews-scroll-container");
    var track = document.getElementById("reviews-marquee-track");
    if (!container || !track) return;

    // Clear previous loops
    if (window.__reviewsAnimationFrame) {
      cancelAnimationFrame(window.__reviewsAnimationFrame);
      window.__reviewsAnimationFrame = null;
    }
    if (window.__reviewsScrollTimeout) {
      clearTimeout(window.__reviewsScrollTimeout);
      window.__reviewsScrollTimeout = null;
    }

    var isHovered = false;
    var isInteracting = false;
    var interactionTimeout = null;
    var lastAutoScrollTime = 0;

    function handleMouseEnter() {
      isHovered = true;
    }
    function handleMouseLeave() {
      isHovered = false;
    }
    function handleTouchStart() {
      isHovered = true;
      isInteracting = true;
      if (interactionTimeout) clearTimeout(interactionTimeout);
    }
    function handleTouchEnd() {
      isHovered = false;
      if (interactionTimeout) clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(function() {
        isInteracting = false;
      }, 3000);
    }
    function handleInteraction() {
      isInteracting = true;
      if (interactionTimeout) clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(function() {
        isInteracting = false;
      }, 3000);
    }

    // Clean up existing listeners if any
    if (container.__cleanupListeners) {
      container.__cleanupListeners();
    }

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Listen to manual scrolling (wheel, trackpad, drag)
    function handleScrollEvent() {
      var now = Date.now();
      // If scroll was manual (not our auto-scroll step)
      if (now - lastAutoScrollTime > 60) {
        handleInteraction();
      }
      
      // Perform instant boundary checks so user can scroll indefinitely
      var currentScroll = container.scrollLeft;
      var widthOfOneSet = track.scrollWidth / repetitions;
      if (widthOfOneSet > 0) {
        if (currentScroll < widthOfOneSet - 100) {
          instantScrollTo(currentScroll + widthOfOneSet);
        } else if (currentScroll >= widthOfOneSet * 2 + 100) {
          instantScrollTo(currentScroll - widthOfOneSet);
        }
      }
    }
    container.addEventListener("scroll", handleScrollEvent, { passive: true });

    var navButtons = document.querySelectorAll(".reviews-nav-btn");
    navButtons.forEach(function(btn) {
      btn.addEventListener("click", handleInteraction);
    });

    container.__cleanupListeners = function() {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scroll", handleScrollEvent);
      navButtons.forEach(function(btn) {
        btn.removeEventListener("click", handleInteraction);
      });
    };

    function instantScrollTo(left) {
      var oldBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto";
      container.scrollLeft = left;
      var dummy = container.scrollLeft; // force reflow
      container.style.scrollBehavior = oldBehavior;
    }

    // Initialize layout setup after browser layout calculation
    window.__reviewsScrollTimeout = setTimeout(function() {
      var widthOfOneSet = track.scrollWidth / repetitions;
      if (widthOfOneSet > 0) {
        container.scrollLeft = widthOfOneSet;
      }

      var lastTime = null;
      var scrollAccumulator = 0;
      var pixelsPerSecond = 35; // smooth slow crawl

      function step(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var delta = timestamp - lastTime;
        lastTime = timestamp;

        if (container && track) {
          if (!isHovered && !isInteracting) {
            scrollAccumulator += (pixelsPerSecond * delta) / 1000;
            if (scrollAccumulator >= 1) {
              var pixelsToScroll = Math.floor(scrollAccumulator);
              scrollAccumulator -= pixelsToScroll;

              var currentScroll = container.scrollLeft;
              var widthOfOneSet = track.scrollWidth / repetitions;

              if (widthOfOneSet > 0) {
                if (currentScroll < widthOfOneSet) {
                  instantScrollTo(currentScroll + widthOfOneSet);
                } else if (currentScroll >= widthOfOneSet * 2) {
                  instantScrollTo(currentScroll - widthOfOneSet);
                }
              }

              lastAutoScrollTime = Date.now();
              container.scrollLeft += pixelsToScroll;
            }
          } else {
            scrollAccumulator = 0;
          }
          window.__reviewsAnimationFrame = requestAnimationFrame(step);
        }
      }

      window.__reviewsAnimationFrame = requestAnimationFrame(step);
    }, 150);
  }

  window.addEventListener("message", function (event) {
    if (!event.data) return;
    if (event.data.type === "CMS_WRITING") {
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
    } else if (event.data.type === "RELOAD_REVIEWS") {
      loadReviews();
    }
  });

  // Track interactions in the iframe and report to parent
  (function () {
    var hasReported = false;
    function reportAction() {
      if (hasReported) return;
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "USER_ACTION" }, "*");
          hasReported = true;
          // Clean up listeners immediately to avoid spamming messages
          window.removeEventListener("click", reportAction);
          window.removeEventListener("scroll", reportAction);
          window.removeEventListener("keydown", reportAction);
          window.removeEventListener("touchstart", reportAction);
        }
      } catch (e) {
        // Ignore cross-origin issues
      }
    }

    // Wait a short delay to avoid catching the initial load scroll or layout shifts
    setTimeout(function () {
      window.addEventListener("click", reportAction, { passive: true });
      window.addEventListener("scroll", reportAction, { passive: true });
      window.addEventListener("keydown", reportAction, { passive: true });
      window.addEventListener("touchstart", reportAction, { passive: true });
    }, 1000);
  })();

  window.loadWritingFromMysql = loadWriting;
  window.cmsRenderWriting = render;
  window.loadReviewsFromMysql = loadReviews;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      loadWriting();
      loadReviews();
    });
  } else {
    loadWriting();
    loadReviews();
  }
})();
