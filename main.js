const menu = document.querySelector("#menu");
const nav = document.querySelector(".site-nav");

const primaryNavigation = [
  ["index.html", "Startsida"],
  ["sortiment.html", "Sortiment"],
  ["butiken.html", "Butiken"],
  ["om-bergfelds.html", "Om oss"],
  ["kontakta-oss.html", "Kontakt"],
];

if (nav) {
  nav.innerHTML = primaryNavigation
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("");
}

if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Stäng meny" : "Öppna meny");
    menu.textContent = open ? "×" : "☰";
  });

  nav.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Öppna meny");
    menu.textContent = "☰";
  });
}

const currentPage = location.pathname.split("/").pop() || "index.html";
const pageSlug = currentPage.replace(".html", "").replace("index", "home");
document.body.classList.add(`page-${pageSlug}`);
document.querySelectorAll(".site-nav a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

if (!document.body.classList.contains("home-page")) {
  document.body.classList.add("inner-page");
  const header = document.querySelector(".site-header");
  const headerInner = header?.querySelector(".header-inner");
  const legacyPhone = header?.querySelector(".header-phone");
  header?.classList.add("glass-header");
  legacyPhone?.classList.add("legacy-phone");

  if (header && !document.querySelector(".b2b-topbar")) {
    header.insertAdjacentHTML(
      "beforebegin",
      '<div class="b2b-topbar"><div class="container b2b-topbar-inner"><span>Din inköpskanal i Ludvika · Gatubacken 9</span><span>Öppet mån–tors 07–16, fre 07–13</span><span>Kommande flytt: större lokaler på Lyviksberget</span></div></div>',
    );
  }

  if (headerInner && menu) {
    const tools = document.createElement("div");
    tools.className = "header-tools";
    tools.innerHTML =
      '<span class="store-status" data-opening-status><i></i><span>Kontrollerar öppettid</span></span><a class="header-phone modern-phone" href="tel:+46240410210">0240-410 210</a><a class="header-cta" href="index.html#forfragan">Skicka förfrågan</a>';
    headerInner.insertBefore(tools, menu);
  }

  const dock = document.createElement("div");
  dock.className = "mobile-dock";
  dock.setAttribute("aria-label", "Snabbval");
  dock.innerHTML =
    '<a href="tel:+46240410210">Ring</a><a href="index.html#forfragan">Förfrågan</a>';
  document.body.append(dock);
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

function getStockholmTime() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return {
    weekday: values.weekday,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function updateOpeningStatus() {
  const { weekday, minutes } = getStockholmTime();
  const weekdayKey = weekday.replace(".", "").toLowerCase();
  const opening = {
    mån: [420, 960],
    tis: [420, 960],
    ons: [420, 960],
    tors: [420, 960],
    fre: [420, 780],
  };
  const hours = opening[weekdayKey];
  const open = Boolean(hours && minutes >= hours[0] && minutes < hours[1]);

  document.querySelectorAll("[data-opening-status]").forEach((status) => {
    status.classList.toggle("is-open", open);
    status.classList.toggle("is-closed", !open);
    const label = status.querySelector("span");
    if (label)
      label.textContent = open ? "Öppet i butiken i dag" : "Stängt just nu";
  });
}

updateOpeningStatus();

const quickForm = document.querySelector("#snabbforfragan");
if (quickForm) {
  let selectedArea = "Industri";
  const areaButtons = quickForm.querySelectorAll("[data-area]");

  areaButtons.forEach((button) => {
    button.addEventListener("click", () => {
      areaButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      selectedArea = button.dataset.area;
    });
  });

  quickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = quickForm.querySelector("#quick-message").value.trim();
    if (!message) return;
    const subject = encodeURIComponent(`Förfrågan – ${selectedArea}`);
    const body = encodeURIComponent(
      `Område: ${selectedArea}\n\nJag söker:\n${message}\n\nNamn/företag:\nTelefon:`,
    );
    location.href = `mailto:order@bergfelds.se?subject=${subject}&body=${body}`;
  });
}

const inquiryForm = document.querySelector("#forfragan");
if (inquiryForm) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(inquiryForm);
    const name = String(formData.get("name") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const area = String(formData.get("area") || "Annat").trim();
    const message = String(formData.get("message") || "").trim();
    const status = inquiryForm.querySelector(".b2b-form-status");

    if (!name || !company || !email || !message) {
      if (status) {
        status.textContent =
          "Fyll i namn, företag, e-post och vad du behöver hjälp med.";
      }
      return;
    }

    const subject = encodeURIComponent(`Förfrågan – ${area} – ${company}`);
    const body = encodeURIComponent(
      `Område: ${area}\n\n${message}\n\nNamn: ${name}\nFöretag: ${company}\nE-post: ${email}\nTelefon: ${phone || "Ej angivet"}`,
    );

    if (status) {
      status.textContent = "Ditt e-postprogram öppnas nu.";
    }
    location.href = `mailto:order@bergfelds.se?subject=${subject}&body=${body}`;
  });
}

const categoryData = [
  {
    slug: "kullager",
    name: "Kullager",
    icon: "◎",
    image: "assets/industry.jpg",
    description:
      "Kullager och relaterade komponenter för industrins drift och underhåll.",
    groups: [
      ["Kullager", "Kullager för olika behov inom drift och underhåll."],
      [
        "Lagerenheter",
        "Lagerenheter ingår i det verifierade sortimentsunderlaget.",
      ],
    ],
  },
  {
    slug: "vvs",
    name: "VVS",
    icon: "⌁",
    image: "assets/editorial/plumbing-pipes.jpg",
    description:
      "VVS-produkter, förbrukningsmaterial och tillbehör för professionell användning.",
    groups: [
      ["VVS-produkter", "Produkter för professionell VVS-användning."],
      ["Förbrukningsmaterial", "Förbrukningsmaterial för det dagliga arbetet."],
      ["Tillbehör", "Tillbehör inom det befintliga VVS-sortimentet."],
    ],
  },
  {
    slug: "kyla",
    name: "Kyla",
    icon: "✣",
    image: "assets/plumbing.jpg",
    description: "Kyla är ett av Bergfelds angivna produktområden.",
    groups: [],
  },
  {
    slug: "infastning",
    name: "Infästning",
    icon: "⌖",
    image: "assets/bergfelds-product-overview.jpg",
    description:
      "Infästningsprodukter för professionella verksamheter och montage.",
    groups: [
      ["Skruv", "Skruv ingår i det verifierade sortimentsunderlaget."],
      ["Mutter & bult", "Mutter och bult för professionell användning."],
      ["Gängstång", "Gängstång inom produktområdet fästelement."],
      ["Plugg & ankare", "Plugg och ankare för olika montagebehov."],
    ],
  },
  {
    slug: "kap-och-slip",
    name: "Kap & Slip",
    icon: "◒",
    image: "assets/editorial/workshop-tools.jpg",
    description: "Produkter för kapning, slipning och skärande bearbetning.",
    groups: [
      ["Klingor", "Klingor finns angivet under skärande verktyg."],
      ["Slipskivor", "Slipskivor finns angivet under skärande verktyg."],
      [
        "Skärande verktyg",
        "Borrar, fräsar och svarvverktyg ingår i underlaget.",
      ],
    ],
  },
  {
    slug: "svets",
    name: "Svets",
    icon: "⌁",
    image: "assets/editorial/cnc-workshop.jpg",
    description:
      "Svetsutrustning, material, gas och skydd för professionellt arbete.",
    groups: [
      ["Svetsutrustning", "Utrustning för svetsarbete."],
      ["Tillsatsmaterial", "Tillsatsmaterial ingår i sortimentsunderlaget."],
      ["Industrigas", "Industrigas är angivet inom svetsning och gas."],
      ["Skydd", "Skydd för arbete inom svetsning."],
    ],
  },
  {
    slug: "tatningar",
    name: "Tätningar",
    icon: "◌",
    image: "assets/industry.jpg",
    description: "Tätningar är ett av Bergfelds angivna produktområden.",
    groups: [],
  },
  {
    slug: "drivremmar",
    name: "Drivremmar",
    icon: "∞",
    image: "assets/industry.jpg",
    description: "Drivremmar är ett av Bergfelds angivna produktområden.",
    groups: [],
  },
  {
    slug: "verktyg",
    name: "Verktyg",
    icon: "⌕",
    image: "assets/editorial/workshop-tools.jpg",
    description:
      "Handverktyg, elverktyg, maskiner och skärande verktyg för arbetsdagen.",
    groups: [
      [
        "Handverktyg",
        "Nycklar, tänger, hylsor, bits, sågar och verktygssatser.",
      ],
      [
        "Elverktyg & maskiner",
        "Borr, slip, sågar, skruvdragare och tillbehör.",
      ],
      [
        "Skärande verktyg",
        "Borrar, fräsar, svarvverktyg, klingor och slipskivor.",
      ],
    ],
  },
  {
    slug: "tryckluft",
    name: "Tryckluft",
    icon: "≈",
    image: "assets/workshop.jpg",
    description: "Kompressorer, luftverktyg och tillbehör för tryckluft.",
    groups: [
      [
        "Kompressorer",
        "Kompressorer ingår i det verifierade sortimentsunderlaget.",
      ],
      ["Luftverktyg", "Verktyg för tryckluft."],
      ["Slang & tillbehör", "Slang och tillbehör för tryckluftssystem."],
    ],
  },
  {
    slug: "smorjmedel",
    name: "Smörjmedel",
    icon: "◢",
    image: "assets/industry.jpg",
    description:
      "Smörjmedel och kemprodukter för drift, underhåll och montage.",
    groups: [
      ["Oljor", "Oljor inom smörjmedel och kem."],
      ["Fett", "Fett för underhåll och professionell användning."],
      ["Avfettning", "Avfettning ingår i det angivna sortimentet."],
      [
        "Lim, fog & gänglåsning",
        "Lim, fog och gänglåsning finns angivet i underlaget.",
      ],
    ],
  },
  {
    slug: "mark-och-va",
    name: "Mark & VA",
    icon: "⌇",
    image: "assets/editorial/warehouse-logistics.jpg",
    description: "Mark & VA är ett av Bergfelds angivna produktområden.",
    groups: [],
  },
];

function categoryMapMarkup() {
  const cardPositions = [
    ["kullager", "left-one"],
    ["kap-och-slip", "left-two"],
    ["svets", "left-three"],
    ["verktyg", "left-four"],
    ["tryckluft", "left-five"],
    ["vvs", "top-center"],
    ["kyla", "right-one"],
    ["infastning", "right-two"],
    ["tatningar", "right-three"],
    ["drivremmar", "right-four"],
    ["mark-och-va", "right-five"],
    ["smorjmedel", "bottom-center"],
  ];
  const mapIcons = {
    kullager:
      '<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="5"/><circle cx="16" cy="7" r="1.5"/><circle cx="16" cy="25" r="1.5"/><circle cx="7" cy="16" r="1.5"/><circle cx="25" cy="16" r="1.5"/>',
    vvs: '<path d="M5 10h12v6h5v4h-8v-6H5zM8 10V6h6v4M24 20v4M21 24h6"/>',
    kyla: '<path d="M16 3v26M5 9l22 14M27 9L5 23M12 5l4 4 4-4M12 27l4-4 4 4M5 14l5 2-5 2M27 14l-5 2 5 2"/>',
    infastning:
      '<path d="M8 5l19 19-4 4L4 9zM10 7l-4 4M15 12l-4 4M20 17l-4 4M25 22l-4 4"/>',
    "kap-och-slip":
      '<circle cx="11" cy="18" r="6"/><circle cx="11" cy="18" r="2"/><path d="M16 14l9-9 2 2-9 9M19 20l9 3M20 24l6 5"/>',
    svets:
      '<path d="M7 6h14l3 13H10zM10 19v7h11v-7M4 24l-2 3M6 27l-1 3M26 24l3 2M25 28l2 2"/>',
    tatningar:
      '<ellipse cx="12" cy="17" rx="9" ry="5" transform="rotate(-25 12 17)"/><ellipse cx="21" cy="15" rx="9" ry="5" transform="rotate(25 21 15)"/>',
    drivremmar:
      '<circle cx="9" cy="21" r="5"/><circle cx="24" cy="10" r="4"/><path d="M6 17L21 7M12 25l15-12"/>',
    verktyg:
      '<path d="M5 5l8 8M19 19l8 8M10 22l-5 5M22 10l5-5M4 4l5 1 1 5-3 3M28 28l-5-1-1-5 3-3"/>',
    tryckluft:
      '<rect x="5" y="13" width="22" height="11" rx="4"/><path d="M10 13V9h8v4M22 13V7h4v6M9 24v3M23 24v3M2 17h3"/>',
    smorjmedel:
      '<path d="M5 13h18l-2 13H8zM8 13l3-6h8l4 6M24 20c4-5 6-2 4 1-1 2-3 2-4-1z"/>',
    "mark-och-va":
      '<path d="M5 24h22M8 24l3-8h10l3 8M12 16l2-7h5l2 7M16 9V5M13 5h6"/>',
  };
  const cards = cardPositions
    .map(([slug, position]) => {
      const category = categoryData.find((item) => item.slug === slug);
      return `<a class="map-category map-category-${position}" href="${category.slug}.html"><span class="map-icon"><svg viewBox="0 0 32 32" aria-hidden="true">${mapIcons[category.slug]}</svg></span><b>${category.name}</b><span class="map-arrow" aria-hidden="true">›</span></a>`;
    })
    .join("");
  return `<div class="category-map"><svg class="map-lines" viewBox="0 0 1120 610" preserveAspectRatio="none" aria-hidden="true"><path d="M560 98V258M560 352V512M368 305H752M368 305C325 305 320 132 268 132M368 305C325 305 320 220 268 220M368 305C325 305 320 305 268 305M368 305C325 305 320 390 268 390M368 305C325 305 320 478 268 478M752 305C795 305 800 132 852 132M752 305C795 305 800 220 852 220M752 305C795 305 800 305 852 305M752 305C795 305 800 390 852 390M752 305C795 305 800 478 852 478"/></svg><div class="map-center"><img src="assets/bergfelds-wordmark.svg" alt="Bergfelds – Industri, VVS och verkstad"></div>${cards}</div>`;
}

document.querySelectorAll("[data-category-map]").forEach((container) => {
  container.innerHTML = categoryMapMarkup();
});

if (document.body.classList.contains("page-sortiment")) {
  const productSection = document.querySelector(
    ".page-sortiment .page-hero + .section",
  );
  if (productSection) {
    const mapSection = document.createElement("section");
    mapSection.className = "section category-map-directory";
    mapSection.innerHTML = `<div class="container"><div class="catalog-heading"><em>12 PRODUKTOMRÅDEN</em><h2>Välj område och utforska vidare</h2><p>Varje område har en egen informationssida med verifierade produktgrupper och kontaktvägar.</p></div>${categoryMapMarkup()}</div>`;
    productSection.before(mapSection);
  }
}

const categoryRoot = document.querySelector("[data-category-page]");
if (categoryRoot) {
  const slug = document.body.dataset.category;
  const category = categoryData.find((item) => item.slug === slug);
  if (category) {
    document.title = `${category.name} | Bergfelds`;
    const groupCards = category.groups.length
      ? category.groups
          .map(
            ([name, description]) =>
              `<article class="product-group-card"><img src="${category.image}" alt="Illustrativ miljöbild för ${name}" loading="lazy"><div><h3>${name}</h3><p>${description}</p><a href="kontakta-oss.html?kategori=${encodeURIComponent(category.name)}">Fråga om ${name.toLowerCase()} →</a></div></article>`,
          )
          .join("")
      : `<article class="category-pending"><span>${category.icon}</span><div><h3>Produktgrupper kompletteras</h3><p>Detaljerad och verifierad gruppindelning saknas ännu för ${category.name}. Kontakta Bergfelds så hjälper vi dig utifrån ditt behov.</p></div></article>`;
    const related = categoryData
      .filter((item) => item.slug !== slug)
      .slice(0, 4)
      .map(
        (item) =>
          `<a href="${item.slug}.html"><span>${item.icon}</span>${item.name}</a>`,
      )
      .join("");
    categoryRoot.innerHTML = `<section class="category-hero"><img src="${category.image}" alt="Illustrativ miljöbild för ${category.name}"><div class="category-hero-shade"></div><div class="container"><a class="category-back" href="index.html#sortimentskarta">← Till sortimentsöversikten</a><p class="kicker">PRODUKTOMRÅDE</p><h1>${category.name}</h1><p>${category.description}</p><a class="button primary" href="kontakta-oss.html?kategori=${encodeURIComponent(category.name)}">Fråga oss om ${category.name}</a></div></section><section class="section category-groups"><div class="container"><div class="section-intro"><div><p class="kicker blue">PRODUKTGRUPPER</p><h2>Utforska området.</h2></div><p>Vi visar endast produktgrupper som stöds av befintligt underlag. Bilderna är illustrativa och visar inte lagerstatus.</p></div><div class="product-group-grid">${groupCards}</div></div></section><section class="section related-categories"><div class="container"><p class="kicker blue">FLER OMRÅDEN</p><h2>Fortsätt utforska sortimentet.</h2><div class="related-grid">${related}</div></div></section><section class="category-contact"><div class="container"><div><p class="kicker">PERSONLIG HJÄLP</p><h2>Hittar du inte exakt det du söker?</h2><p>Ring eller mejla Bergfelds och beskriv behovet, artikelnumret eller användningen.</p></div><div><a class="button primary" href="tel:+46240410210">Ring 0240-410 210</a><a class="button light" href="mailto:order@bergfelds.se?subject=${encodeURIComponent(`Förfrågan – ${category.name}`)}">Mejla en förfrågan</a></div></div></section>`;
  }
}

const suppliers = [
  {
    name: "Milwaukee",
    image: "assets/suppliers/milwaukee.png",
    category: "verktyg",
  },
  { name: "HiKOKI", image: "assets/suppliers/hikoki.svg", category: "verktyg" },
  {
    name: "Bosch Professional",
    image: "assets/suppliers/bosch.svg",
    category: "verktyg",
  },
  {
    name: "Kemppi",
    image: "assets/suppliers/kemppi.svg",
    category: "industri",
  },
  {
    name: "Kärcher",
    image: "assets/suppliers/karcher.svg",
    category: "verktyg",
  },
  { name: "Guide", image: "assets/suppliers/guide.svg", category: "skydd" },
  { name: "Arbesko", image: "assets/suppliers/arbesko.svg", category: "skydd" },
  { name: "Metabo", image: "assets/suppliers/metabo.png", category: "verktyg" },
  {
    name: "Loctite",
    image: "assets/suppliers/loctite.svg",
    category: "industri",
  },
  {
    name: "Fiskars",
    image: "assets/suppliers/fiskars.png",
    category: "verktyg",
  },
  { name: "SKF", image: "assets/suppliers/skf.svg", category: "industri" },
  {
    name: "Hultafors",
    image: "assets/suppliers/hultafors.svg",
    category: "verktyg",
  },
  {
    name: "Cederroth",
    image: "assets/suppliers/cederroth.svg",
    category: "skydd",
  },
  { name: "Luna", image: "assets/suppliers/luna.png", category: "verktyg" },
  {
    name: "Hitachi Energy",
    image: "assets/logos/hitachi-energy.png",
    category: "industri",
  },
  {
    name: "Nordic Iron",
    image: "assets/logos/nordic-iron.svg",
    category: "industri",
  },
  { name: "Log Max", image: "assets/logos/logmax.png", category: "industri" },
  {
    name: "Spendrups",
    image: "assets/logos/spendrups.jpg",
    category: "industri",
  },
  {
    name: "Dala Takentreprenader",
    image: "assets/logos/dalatak.png",
    category: "industri",
    url: "http://dalatak.se/",
  },
  {
    name: "Elbolaget Montage AB",
    image: "assets/logos/elbolaget.png",
    category: "industri",
    url: "https://elbolaget.se/",
  },
  {
    name: "Byggbolaget i Bergslagen AB",
    image: "assets/logos/byggbolaget.png",
    category: "industri",
    url: "https://bygg-bolaget.se/",
  },
  {
    name: "Trio Perfekta",
    image: "assets/logos/trio-perfekta.png",
    category: "industri",
    url: "https://www.trio-perfekta.se/",
  },
  {
    name: "LG IT AB",
    image: "assets/logos/lgit.png",
    category: "industri",
    url: "https://lgit.se/kontakt/",
  },
  {
    name: "DALACC",
    image: "assets/logos/dalacc.png",
    category: "industri",
    url: "https://www.dalacc.se/",
  },
  {
    name: "AKETEK",
    image: "assets/logos/aketek.webp",
    category: "industri",
    url: "https://www.aketek.com/sv-se/",
  },
];

const brandGrid = document.querySelector("[data-brand-grid]");
if (brandGrid) {
  suppliers.slice(0, 12).forEach((supplier) => {
    const tile = document.createElement("div");
    tile.className = "brand-tile";
    tile.dataset.name = supplier.name.toLowerCase();
    tile.dataset.category = supplier.category;
    const image = document.createElement("img");
    image.src = supplier.image;
    image.alt = supplier.name;
    image.loading = "lazy";
    tile.append(image);
    brandGrid.append(tile);
  });

  const search = document.querySelector("#brand-search");
  const filters = document.querySelectorAll("[data-filter]");
  let activeFilter = "all";

  const filterBrands = () => {
    const query = (search?.value || "").trim().toLowerCase();
    brandGrid.querySelectorAll(".brand-tile").forEach((tile) => {
      const matchesText = tile.dataset.name.includes(query);
      const matchesFilter =
        activeFilter === "all" || tile.dataset.category === activeFilter;
      tile.hidden = !(matchesText && matchesFilter);
    });
  };

  search?.addEventListener("input", filterBrands);
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      filterBrands();
    });
  });
}

const directory = document.querySelector(".supplier-directory");
if (directory) {
  suppliers.forEach((supplier) => {
    const card = document.createElement(supplier.url ? "a" : "article");
    card.className = "supplier-directory-card";
    if (supplier.url) {
      card.href = supplier.url;
      card.target = "_blank";
      card.rel = "noreferrer";
    }
    const visual = document.createElement("div");
    visual.className = "directory-logo";
    const image = document.createElement("img");
    image.src = supplier.image;
    image.alt = supplier.name;
    image.loading = "lazy";
    visual.append(image);
    const title = document.createElement("h3");
    title.textContent = supplier.name;
    const text = document.createElement("p");
    text.textContent = "Leverantör och varumärke i Bergfelds nätverk.";
    card.append(visual, title, text);
    directory.append(card);
  });
}

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const revealItems = document.querySelectorAll(
  "main > section:not(:first-child), .section-intro, .section-heading, .product-list > article, .category-catalog > article, .supplier-directory-card, .flow-grid > article, .service-editorial > article",
);

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("reveal-ready");
  revealItems.forEach((item) => item.setAttribute("data-reveal", ""));
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}
