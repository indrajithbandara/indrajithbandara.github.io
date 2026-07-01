# Indrajith Bandara — Personal Portfolio

A premium, dark-themed, framework-free personal portfolio built with plain
HTML, CSS, and JavaScript. Designed around a terminal / network-security
visual language to reflect a cybersecurity and networking education career.

**Live site:** https://indrajithbandara.is-a.dev

---

## ✨ Features

- Fully responsive, mobile-first layout
- Dark theme — black / dark gray / white with a terminal-green accent
- Animated typing effect in a fake terminal window
- Ambient animated network-node canvas background in the hero
- Animated skill progress bars (triggered on scroll)
- Animated stat counters (triggered on scroll)
- Glassmorphism navigation bar with scroll state
- Scroll-reveal fade/slide animations throughout
- Accessible: visible focus states, semantic HTML, reduced-motion support
- SEO ready: Open Graph tags, Twitter Card tags, sitemap.xml, robots.txt
- Zero build step, zero dependencies, zero frameworks

## 📁 Project Structure

```
.
├── index.html              Main site
├── 404.html                 Custom error page
├── robots.txt
├── sitemap.xml
├── CNAME                    Custom domain (is-a.dev) placeholder
├── LICENSE
├── README.md
└── assets/
    ├── css/
    │   └── style.css        All styles & design tokens
    ├── js/
    │   └── main.js          All interactivity (vanilla JS)
    ├── icons/
    │   └── favicon.svg
    ├── images/
    │   ├── profile-placeholder.svg   ← replace with your real photo
    │   └── og-cover.svg              ← replace with a real og-cover.jpg
    └── cv/
        └── README.txt        ← drop your real CV PDF here
```

## 🛠 Setup

1. **Clone or fork** this repository.
2. Replace `assets/images/profile-placeholder.svg` with a real photo
   (`profile.jpg`) and update the `src` in `index.html`'s About section.
3. Replace `assets/images/og-cover.svg` with a real `og-cover.jpg`
   (1200×630px) and update the Open Graph `<meta>` tags in `<head>`.
4. Drop your real CV into `assets/cv/Indrajith_Bandara_CV.pdf` — the
   "Download CV" button is already wired to that exact path.
5. Update social links (GitHub, LinkedIn, email, WhatsApp) — search for
   `href="#"` / placeholder URLs in `index.html` and swap in your real ones.
6. (Optional) Wire the contact form to a real backend such as
   [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) —
   currently it's client-side only and shows a placeholder confirmation.

## 🚀 Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source** and select your default branch.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## 🌐 Custom domain via is-a.dev

This repo includes a `CNAME` file pre-filled with
`indrajithbandara.is-a.dev`. To activate it:

1. Fork [`is-a-dev/register`](https://github.com/is-a-dev/register).
2. Add a JSON file under `domains/` (e.g. `indrajithbandara.json`):
   ```json
   {
     "owner": { "username": "your-github-username" },
     "records": { "CNAME": "your-github-username.github.io" }
   }
   ```
3. Open a Pull Request to `is-a-dev/register` and wait for it to be merged.
4. Once merged, your custom domain will resolve to this GitHub Pages site.

## 📄 License

Released under the [MIT License](LICENSE).
