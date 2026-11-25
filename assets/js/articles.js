document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("articles-container");
  if (!container) return;
  const status = message => { container.textContent = message; };
  status("Loading latest articles…");
  fetch("https://dev.to/api/articles?username=indrajithbandara&per_page=3")
    .then(response => { if (!response.ok) throw Error("Feed unavailable"); return response.json(); })
    .then(articles => {
      if (!Array.isArray(articles) || !articles.length) { status("No articles found."); return; }
      container.textContent = "";
      articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "book-card";
        const info = document.createElement("div");
        info.className = "book-info";
        const title = document.createElement("h3");
        title.textContent = article.title || "";
        const description = document.createElement("p");
        description.className = "article-excerpt";
        description.textContent = article.description || "";
        const date = document.createElement("p");
        date.textContent = article.published_at ? article.published_at.slice(0, 10) : "Publication date unavailable";
        info.append(title, date, description);
        try {
          const url = new URL(article.url);
          if (url.protocol === "https:" && url.hostname === "dev.to") {
            const link = document.createElement("a");
            link.href = url.href; link.target = "_blank"; link.rel = "noopener noreferrer";
            link.className = "btn btn-primary"; link.textContent = "Read on DEV.to";
            info.appendChild(link);
          }
        } catch (_) {}
        card.appendChild(info); container.appendChild(card);
      });
    }).catch(() => status("Unable to load articles. Please try again later."));
});

