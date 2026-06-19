const packageSelect = document.querySelector("#selected-package");
const selectedOptionsInput = document.querySelector("#selected-options");
const quoteLinks = document.querySelectorAll(".quote-link");
const buildOptions = document.querySelectorAll(".build-option");
const buildStages = document.querySelectorAll(".build-stage");
const buildRooms = document.querySelector("[data-build-rooms]");

const cleanTypes = {
  standard: {
    value: "standard-clean",
    name: "Standard Clean",
    tier: "Standard Clean",
    firstRoom: 30,
    additionalRoom: 30,
    description: "This uses a generic in-tank detergent and a rinse with the wand. It is ideal for a basic freshen-up.",
    summary: "A straightforward maintenance clean for lightly soiled carpet.",
    rate: "£30 per room"
  },
  targeted: {
    value: "targeted-pre-spray",
    name: "Targeted Pre-Spray Clean",
    tier: "Pre-Spray Clean",
    firstRoom: 50,
    additionalRoom: 35,
    description: "Targeted pre-spray is applied separately and allowed to dwell before the carpet is rinsed with hot water extraction.",
    summary: "Extra preparation for carpets needing more than a basic freshen-up.",
    rate: "£50 first room, £35 each additional room"
  },
  professional: {
    value: "professional-deep-clean",
    name: "Professional Deep Clean",
    tier: "Professional Deep Clean",
    firstRoom: 75,
    additionalRoom: 45,
    recommended: true,
    description: "The complete process: targeted pre-spray, dwell time, deep mechanical agitation and 220° superheated hot water extraction.",
    summary: "The most thorough clean and our recommendation for lived-in carpets.",
    rate: "£75 first room, £45 each additional room"
  }
};

function setText(selector, value) {
  document.querySelector(selector)?.replaceChildren(document.createTextNode(value));
}

function selectedAddOns() {
  return Array.from(buildOptions).filter((option) => option.checked).map((option) => option.dataset.buildOption);
}

function normaliseOptions(changedOption) {
  const preSpray = document.querySelector('[data-build-option="pre-spray"]');
  const agitation = document.querySelector('[data-build-option="agitation"]');

  if (changedOption?.dataset.buildOption === "pre-spray" && !changedOption.checked && agitation) {
    agitation.checked = false;
    return;
  }
  if (agitation?.checked && preSpray) preSpray.checked = true;
}

function roomCount() {
  const parsed = Number.parseInt(buildRooms?.value || "1", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 12) : 1;
}

function currentClean() {
  const addOns = selectedAddOns();
  if (addOns.includes("agitation")) return { ...cleanTypes.professional, addOns };
  if (addOns.includes("pre-spray")) return { ...cleanTypes.targeted, addOns };
  return { ...cleanTypes.standard, addOns };
}

function cleanTotal(clean, rooms) {
  const cleaningPrice = clean.firstRoom + (rooms - 1) * clean.additionalRoom;
  if (!clean.addOns.includes("stain-guard")) return cleaningPrice;
  const protectionRate = clean.value === "professional-deep-clean" ? 15 : 30;
  return cleaningPrice + protectionRate * rooms;
}

function updateBuilder() {
  const clean = currentClean();
  const rooms = roomCount();
  const total = cleanTotal(clean, rooms);
  const roomLabel = rooms === 1 ? "1 room" : `${rooms} rooms`;
  const hasProtection = clean.addOns.includes("stain-guard");

  if (buildRooms) buildRooms.value = String(rooms);
  if (packageSelect) packageSelect.value = clean.value;

  setText("[data-build-name]", clean.name);
  setText("[data-build-tier]", clean.tier);
  setText("[data-build-price]", `£${total}`);
  setText("[data-build-price-suffix]", `for ${roomLabel}`);
  setText("[data-build-description]", clean.description);
  setText("[data-build-summary]", clean.name);
  setText("[data-build-summary-copy]", clean.summary);
  setText("[data-build-total]", `£${total}`);
  setText("[data-build-rate]", clean.rate);

  const recommended = document.querySelector("[data-build-recommended]");
  if (recommended) recommended.hidden = !clean.recommended;

  const offers = document.querySelector("[data-build-offers]");
  if (offers) offers.hidden = clean.value !== "professional-deep-clean";

  let visibleStageCount = 0;
  buildStages.forEach((stage) => {
    const show = stage.dataset.stage === "standard" || clean.addOns.includes(stage.dataset.stage);
    stage.hidden = !show;
    stage.classList.toggle("is-visible", show);
    if (show) visibleStageCount += 1;
  });
  const stageList = document.querySelector(".builder-stage-list");
  if (stageList) stageList.className = `builder-stage-list stage-count-${visibleStageCount}`;

  const labels = [];
  if (clean.addOns.includes("pre-spray")) labels.push("Targeted pre-spray and dwell time");
  if (clean.addOns.includes("agitation")) labels.push("Deep mechanical agitation");
  if (hasProtection) labels.push(`Stain guard at £${clean.value === "professional-deep-clean" ? 15 : 30} per room`);
  if (selectedOptionsInput) selectedOptionsInput.value = `${clean.name}; ${roomLabel}; ${labels.join("; ") || "no add-ons"}; estimated total £${total}`;

  document.querySelector("[data-build-quote]")?.setAttribute("data-package", clean.value);
}

buildOptions.forEach((option) => {
  option.addEventListener("change", () => {
    normaliseOptions(option);
    updateBuilder();
  });
});

buildRooms?.addEventListener("input", updateBuilder);

quoteLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const packageValue = link.dataset.buildQuote !== undefined ? currentClean().value : link.dataset.package;
    if (packageSelect && packageValue) packageSelect.value = packageValue;

    if (packageValue) {
      const url = new URL(window.location.href);
      url.searchParams.set("package", packageValue);
      url.hash = "quote";
      history.replaceState(null, "", url);
    }

    document.querySelector("#quote")?.scrollIntoView({ behavior: "smooth" });
  });
});

const packageFromUrl = new URLSearchParams(window.location.search).get("package");
if (packageFromUrl === "targeted-pre-spray") document.querySelector('[data-build-option="pre-spray"]')?.setAttribute("checked", "");
if (packageFromUrl === "professional-deep-clean") {
  document.querySelector('[data-build-option="pre-spray"]')?.setAttribute("checked", "");
  document.querySelector('[data-build-option="agitation"]')?.setAttribute("checked", "");
}

normaliseOptions();
updateBuilder();

const revealItems = document.querySelectorAll(".clean-builder, .review-steps article, .review-copy, .notice, .question-grid p, .quote-shell");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
