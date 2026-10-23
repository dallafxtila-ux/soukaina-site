/* Soukaina — scripts du site (galerie, ateliers, contact) */

// ⚙️ Clé gratuite Web3Forms (https://web3forms.com) : les messages arrivent dans la boîte mail de Soukaina.
const WEB3FORMS_KEY = "A_REMPLACER";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const safeUrl = (u = "") => (/^https?:\/\//i.test(u) ? u : "");

async function loadJSON(path) {
  const res = await fetch(path + "?v=" + Date.now());
  if (!res.ok) throw new Error(path);
  return res.json();
}

/* ---------- Apparition au scroll ---------- */
function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  // Sécurité : rien ne reste invisible si l'animation ne se déclenche pas
  setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in")), 1200);
}

/* =========================================================
   GALERIE
   ========================================================= */
async function initGalerie() {
  const grid = document.getElementById("gallery");
  if (!grid) return;
  let oeuvres = await loadJSON("data/oeuvres.json");
  if (!Array.isArray(oeuvres)) oeuvres = oeuvres.oeuvres || [];
  let filtre = "toutes";

  const render = () => {
    const list = oeuvres.filter((o) => filtre === "toutes" || (filtre === "dispo" && o.disponible));
    grid.innerHTML = list.map((o) => `
      <figure class="piece reveal" data-i="${oeuvres.indexOf(o)}" tabindex="0" role="button" aria-label="Découvrir ${esc(o.titre)}">
        <div class="frame"><img src="${esc(o.image)}" alt="${esc(o.titre)}" loading="lazy"></div>
        <figcaption>
          <h3>${esc(o.titre)}</h3>
          <p class="meta">${esc(o.technique)} · ${esc(o.dimensions)} · ${esc(o.annee)}</p>
          <span class="tag ${o.disponible ? "dispo" : ""}">${o.disponible ? "Disponible" : "Vendue"}</span>
        </figcaption>
      </figure>`).join("");
    reveal();
  };

  document.querySelectorAll(".filters button").forEach((b) =>
    b.addEventListener("click", () => {
      filtre = b.dataset.f;
      document.querySelectorAll(".filters button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      render();
    })
  );

  // Visionneuse
  const lb = document.getElementById("lightbox");
  const open = (o) => {
    lb.querySelector("img").src = o.image;
    lb.querySelector("img").alt = o.titre;
    lb.querySelector("h2").textContent = o.titre;
    lb.querySelector(".lb-tech").textContent = `${o.technique} · ${o.annee}`;
    lb.querySelector(".lb-dim").textContent = o.dimensions;
    const btn = lb.querySelector(".btn");
    lb.querySelector(".lb-price").textContent = o.disponible ? "Œuvre disponible · Prix sur demande" : "Œuvre vendue · Collection privée";
    btn.textContent = o.disponible ? "Demander des informations" : "Commander une œuvre similaire";
    btn.onclick = () => {
      close();
      const sujet = document.getElementById("sujet");
      const msg = document.getElementById("message");
      if (sujet) sujet.value = o.disponible ? "acquisition" : "commande";
      if (msg) msg.value = o.disponible
        ? `Bonjour,\n\nJe souhaiterais obtenir des informations sur l'œuvre « ${o.titre} » (${o.technique}, ${o.dimensions}).\n\nBien cordialement,`
        : `Bonjour,\n\nL'œuvre « ${o.titre} » m'a beaucoup plu. Serait-il possible d'envisager une commande dans le même esprit ?\n\nBien cordialement,`;
    };
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  grid.addEventListener("click", (e) => { const p = e.target.closest(".piece"); if (p) open(oeuvres[p.dataset.i]); });
  grid.addEventListener("keydown", (e) => { const p = e.target.closest(".piece"); if (p && e.key === "Enter") open(oeuvres[p.dataset.i]); });

  render();
}

/* =========================================================
   ATELIERS (remplis par Soukaina depuis le back office)
   ========================================================= */
// Identifiant d'un atelier dans l'URL : date + titre (ex. 2026-09-27-l-entreprenariat-des-femmes)
const slug = (a) => (String(a.date || "").slice(0, 10) + "-" + String(a.titre || ""))
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function loadAteliers() {
  let list = await loadJSON("data/ateliers.json");
  if (!Array.isArray(list)) list = list.ateliers || [];
  return list.filter((a) => a.date && a.titre);
}

// Nom du lieu, cliquable s'il a un site
const lieuHTML = (a) => {
  const url = safeUrl(a.lien_lieu);
  return url ? `<a class="lieu-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(a.lieu)}</a>` : esc(a.lieu);
};

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

async function initAteliers() {
  const futurs = document.getElementById("ateliers");
  if (!futurs) return;
  const passes = document.getElementById("passes");
  let ateliers = await loadAteliers();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const asDate = (a) => new Date((a.date || "").slice(0, 10) + "T00:00:00");
  ateliers = ateliers.sort((a, b) => asDate(a) - asDate(b));
  const aVenir = ateliers.filter((a) => asDate(a) >= today);
  const finis = ateliers.filter((a) => asDate(a) < today).reverse();

  const longDate = (d) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  futurs.innerHTML = aVenir.length
    ? aVenir.map((a) => {
        const d = asDate(a);
        const lien = safeUrl(a.lien_reservation);
        const bouton = a.complet
          ? `<span class="btn off">Complet</span>`
          : lien
            ? `<a class="btn" href="${esc(lien)}" target="_blank" rel="noopener">Je réserve ma place →</a>`
            : `<a class="btn" href="#contact">Me renseigner</a>`;
        return `
        <article class="poster reveal">
          <div class="poster-img">
            ${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : ""}
            <div class="poster-date"><strong>${d.getDate()}</strong><span>${MOIS[d.getMonth()]}</span></div>
          </div>
          <div class="poster-body">
            <span class="kicker">${esc(a.theme || "Atelier d'art")}</span>
            <h3 class="tila">${esc(a.titre)}</h3>
            <div class="infos">
              <span>📅 ${esc(longDate(d))}${a.heure ? " · " + esc(a.heure) : ""}</span>
              ${a.lieu ? `<span>☕ ${lieuHTML(a)}${a.adresse ? ", " + esc(a.adresse) : ""}</span>` : ""}
              ${a.places ? `<span>👥 ${esc(a.places)}</span>` : ""}
            </div>
            ${a.description ? `<p>${esc(a.description)}</p>` : ""}
            <div class="poster-foot">
              <span class="price">${esc(a.prix || "")}</span>
              ${bouton}
            </div>
          </div>
        </article>`;
      }).join("")
    : `<div class="empty">Pas de date pour le moment, les prochains ateliers arrivent très vite. Écris-moi pour être prévenu·e !</div>`;

  if (passes) {
    passes.innerHTML = finis.slice(0, 12).map((a) => `
      <a class="past-card reveal" href="atelier.html?a=${encodeURIComponent(slug(a))}">
        <div class="past-img">
          ${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : ""}
          ${a.photos && a.photos.length ? `<span class="past-count">📸 ${a.photos.length} photo${a.photos.length > 1 ? "s" : ""}</span>` : ""}
        </div>
        <div class="past-body">
          <h3 class="tila">${esc(a.titre)}</h3>
          <small>${esc(asDate(a).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }))}${a.lieu ? " · " + esc(a.lieu) : ""}</small>
          <span class="past-more">Voir le récap →</span>
        </div>
      </a>`).join("");
    document.getElementById("passes-bloc").hidden = !finis.length;
  }

  // Cafés partenaires : déduits automatiquement des ateliers
  const cafes = document.getElementById("cafes");
  if (cafes) {
    const lieux = new Map();
    ateliers.forEach((a) => {
      const n = (a.lieu || "").trim();
      if (!n || /partenaire/i.test(n)) return;
      if (!lieux.has(n) || (!lieux.get(n) && a.lien_lieu)) lieux.set(n, safeUrl(a.lien_lieu));
    });
    const noms = [...lieux.keys()];
    cafes.innerHTML = noms.map((n) => {
      const url = lieux.get(n);
      return url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(n)} <i>↗</i></a>` : `<span>${esc(n)}</span>`;
    }).join("");
    document.getElementById("cafes-bloc").hidden = !noms.length;
  }
  reveal();
}

/* =========================================================
   PAGE RÉCAP D'UN ATELIER (atelier.html?a=...)
   ========================================================= */
async function initRecap() {
  const root = document.getElementById("recap");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("a");
  const ateliers = await loadAteliers();
  const a = ateliers.find((x) => slug(x) === id);
  if (!a) {
    root.innerHTML = `<div class="wrap recap-head"><h1 class="t-title tila">Atelier introuvable</h1><p class="t-lead">Cet atelier n'existe plus ou le lien est incorrect.</p><a class="btn btn-main" href="ateliers.html#passes-bloc">Voir tous les ateliers</a></div>`;
    return;
  }
  const d = new Date(a.date.slice(0, 10) + "T00:00:00");
  document.title = `${a.titre} · Tila Art Club`;
  const photos = (a.photos || []).filter(Boolean);
  root.innerHTML = `
    <div class="wrap recap-head reveal">
      <a class="recap-back" href="ateliers.html#passes-bloc">← Tous les ateliers</a>
      <span class="kicker">Retour sur l'atelier</span>
      <h1 class="t-title tila">« ${esc(a.titre)} »</h1>
      <div class="recap-infos">
        <span>📅 ${esc(d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</span>
        ${a.lieu ? `<span>☕ ${lieuHTML(a)}${a.adresse ? ", " + esc(a.adresse) : ""}</span>` : ""}
      </div>
    </div>
    <div class="wrap recap-grid">
      ${a.image ? `<figure class="recap-cover reveal"><img src="${esc(a.image)}" alt=""></figure>` : ""}
      <div class="recap-text reveal">
        <h2 class="tila">Le débrief</h2>
        ${a.debrief
          ? a.debrief.split(/\n\s*\n/).map((para) => `<p>${esc(para)}</p>`).join("")
          : `<p class="recap-soon">Le récap de cet atelier arrive très bientôt 🧡</p>`}
      </div>
    </div>
    ${photos.length ? `
    <section class="wrap recap-photos">
      <h2 class="t-title tila">En <em>images</em></h2>
      <div class="photo-grid">
        ${photos.map((src, i) => `<button class="photo reveal" data-i="${i}" aria-label="Agrandir la photo ${i + 1}"><img src="${esc(src)}" alt="Photo ${i + 1} de l'atelier" loading="lazy"></button>`).join("")}
      </div>
    </section>` : ""}
    <div class="wrap recap-cta reveal">
      <h2 class="tila">Envie de participer au prochain ?</h2>
      <a class="btn btn-main" href="ateliers.html#dates">Voir les prochains ateliers</a>
    </div>`;

  // Visionneuse photos
  const lb = document.getElementById("photo-lb");
  let cur = 0;
  const show = (i) => { cur = (i + photos.length) % photos.length; lb.querySelector("img").src = photos[cur]; lb.classList.add("open"); document.body.style.overflow = "hidden"; };
  const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
  root.addEventListener("click", (e) => { const b = e.target.closest(".photo"); if (b) show(+b.dataset.i); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(cur - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  reveal();
}

/* =========================================================
   COUP DE PINCEAU SOUS « COMMENT SE DÉROULE UN ATELIER »
   ========================================================= */
function initBrush() {
  const list = document.querySelector(".steps-path");
  if (!list) return;
  const steps = [...list.querySelectorAll("li")];
  const svg = document.querySelector(".brush-line");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Version téléphone : trait vertical + étapes qui s'allument une à une
  const playVertical = () => {
    list.classList.add("drawn");
    steps.forEach((li, i) => setTimeout(() => li.classList.add("lit"), reduce ? 0 : 400 + i * 600));
  };

  // Version ordinateur : le trait se dessine, le pinceau suit, une tache par étape
  const playDesktop = () => {
    const main = svg.querySelector(".brush-main");
    const shine = svg.querySelector(".brush-shine");
    const tip = svg.querySelector(".brush-tip");
    const dotsG = svg.querySelector(".brush-dots");
    const len = main.getTotalLength();
    [main, shine].forEach((p) => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });

    // Une tache sous le centre de chaque carte (10 %, 30 %, 50 %, 70 %, 90 %)
    const targets = steps.map((_, i) => 100 + i * 200);
    const at = targets.map((x) => {
      let best = 0, bestD = Infinity;
      for (let l = 0; l <= len; l += 4) { const d = Math.abs(main.getPointAtLength(l).x - x); if (d < bestD) { bestD = d; best = l; } }
      return best;
    });
    const dots = at.map((l) => {
      const p = main.getPointAtLength(l);
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", 12);
      dotsG.appendChild(c);
      return c;
    });

    if (reduce) {
      [main, shine].forEach((p) => (p.style.strokeDashoffset = 0));
      dots.forEach((d) => d.classList.add("on"));
      return;
    }
    const dur = 4200, t0 = performance.now();
    svg.classList.add("drawing");
    const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // départ et arrivée en douceur
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const l = len * ease(t);
      main.style.strokeDashoffset = len - l;
      shine.style.strokeDashoffset = len - l;
      const p = main.getPointAtLength(l);
      tip.setAttribute("x", p.x - 6);
      tip.setAttribute("y", p.y - 2);
      at.forEach((a, i) => {
        if (l >= a && !dots[i].classList.contains("on")) { dots[i].classList.add("on"); steps[i].classList.add("lit"); }
      });
      if (t < 1) requestAnimationFrame(frame);
      else setTimeout(() => svg.classList.remove("drawing"), 400);
    };
    requestAnimationFrame(frame);
  };

  const desktop = () => svg && getComputedStyle(svg).display !== "none";
  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    io.disconnect();
    removeEventListener("scroll", onScroll);
    desktop() ? playDesktop() : playVertical();
  };
  // Lancement quand la liste arrive aux 2/3 de l'écran (observer + secours au scroll)
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) play(); }, { rootMargin: "0px 0px -30% 0px" });
  const onScroll = () => { if (list.getBoundingClientRect().top < innerHeight * 0.7) play(); };
  io.observe(list);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* =========================================================
   CONTACT (Web3Forms, gratuit)
   ========================================================= */
function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const msg = form.querySelector(".form-msg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.botcheck.checked) return;
    const btn = form.querySelector("button");
    const vous = form.dataset.ton === "vous";
    btn.disabled = true; msg.textContent = "Envoi en cours…";
    const data = Object.fromEntries(new FormData(form));
    data.access_key = WEB3FORMS_KEY;
    data.subject = (vous ? "DALLAF · " : "Tila Art Club · ") + "Nouvelle demande : " + (data.sujet || "contact");
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message);
      form.reset();
      msg.textContent = vous
        ? "Merci, votre demande a bien été envoyée. Nous vous répondrons sous 48 heures."
        : "Merci ! Ton message est bien parti, je te réponds très vite.";
    } catch {
      msg.textContent = vous
        ? "L'envoi n'a pas pu aboutir. Vous pouvez nous écrire directement par e-mail."
        : "Oups, l'envoi n'a pas marché. Tu peux m'écrire directement par e-mail ou Instagram.";
    }
    btn.disabled = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  reveal();
  initGalerie().catch(console.error);
  initAteliers().catch(console.error);
  initRecap().catch(console.error);
  initBrush();
  initContact();
});
