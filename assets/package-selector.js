const packageCards = document.querySelectorAll(".package-card");
const packageSelect = document.querySelector("#selected-package");
const quoteLinks = document.querySelectorAll(".quote-link");
const revealItems = document.querySelectorAll(
  ".package-card, .before-after-section, .build-clean-section, .review-steps article, .review-copy, .notice, .question-grid p, .quote-shell"
);

function syncSelectedCard(packageValue) {
  packageCards.forEach((card) => {
    const isSelected = card.dataset.package === packageValue;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-current", isSelected ? "true" : "false");
  });
}

packageCards.forEach((card) => {
  const button = card.querySelector(".package-button");

  button.addEventListener("click", () => {
    syncSelectedCard(card.dataset.package);
    card.animate(
      [
        { transform: "translateY(-6px) scale(1)" },
        { transform: "translateY(-6px) scale(1.018)" },
        { transform: "translateY(-6px) scale(1)" }
      ],
      {
        duration: 260,
        easing: "ease-out"
      }
    );
  });
});

function selectPackage(packageValue) {
  if (!packageSelect || !packageValue) return;

  packageSelect.value = packageValue;
  syncSelectedCard(packageValue);
}

quoteLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    selectPackage(link.dataset.package);
    if (link.dataset.package) {
      const url = new URL(window.location.href);
      url.searchParams.set("package", link.dataset.package);
      url.hash = "quote";
      history.replaceState(null, "", url);
    }

    document.querySelector("#quote")?.scrollIntoView({ behavior: "smooth" });
  });
});

const packageFromUrl = new URLSearchParams(window.location.search).get("package");
selectPackage(packageFromUrl || packageSelect?.value);

const builder = document.querySelector("[data-clean-builder]");
const builderOptions = document.querySelectorAll("[data-builder-option]");
const builderRooms = document.querySelector("[data-builder-rooms]");
const roomButtons = document.querySelectorAll("[data-room-step]");

const builderState = {
  machine: "Enforcer 400",
  solution: "Targeted Pre Spray",
  agitation: "Mechanical Agitation",
  heat: "Fusion Heat Bomb Steam System"
};

const baseFirstRoom = 75;
const additionalRoom = 45;

function formatCurrency(value) {
  return `£${Math.max(value, 0).toFixed(0)}`;
}

function getRooms() {
  if (!builderRooms) return 1;
  const value = Number.parseInt(builderRooms.value, 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, 1), 12) : 1;
}

function getBuilderAdjustment() {
  return Array.from(builderOptions).reduce((total, option) => {
    return option.classList.contains("is-selected") ? total + Number(option.dataset.price || 0) : total;
  }, 0);
}

function getBuilderTotal() {
  const rooms = getRooms();
  const calculatedTotal = baseFirstRoom + (rooms - 1) * additionalRoom + getBuilderAdjustment();
  const minimumTotal = rooms * 30;
  return Math.max(calculatedTotal, minimumTotal);
}

function getCleanName() {
  const hasFullSpec = builderState.machine === "Enforcer 400"
    && builderState.solution === "Targeted Pre Spray"
    && builderState.agitation === "Mechanical Agitation"
    && builderState.heat === "Fusion Heat Bomb Steam System";

  return hasFullSpec ? "Professional Deep Clean" : "Custom Clean";
}

function updateBuilderDisplay(activeOption) {
  if (!builder) return;

  const rooms = getRooms();
  const total = formatCurrency(getBuilderTotal());
  const roomsLabel = rooms === 1 ? "1 room" : `${rooms} rooms`;

  document.querySelectorAll("[data-clean-total], [data-clean-total-bottom]").forEach((node) => {
    node.textContent = total;
  });

  document.querySelector("[data-clean-rooms-label]")?.replaceChildren(document.createTextNode(roomsLabel));
  document.querySelector("[data-clean-name]")?.replaceChildren(document.createTextNode(getCleanName()));

  document.querySelector("[data-summary-machine]")?.replaceChildren(document.createTextNode(builderState.machine));
  document.querySelector("[data-summary-solution]")?.replaceChildren(document.createTextNode(builderState.solution));
  document.querySelector("[data-summary-agitation]")?.replaceChildren(document.createTextNode(builderState.agitation));
  document.querySelector("[data-summary-heat]")?.replaceChildren(document.createTextNode(builderState.heat.replace(" Steam System", "")));

  document.querySelector("[data-selected-machine]")?.replaceChildren(document.createTextNode(builderState.machine));
  document.querySelector("[data-selected-solution]")?.replaceChildren(document.createTextNode(builderState.solution));
  document.querySelector("[data-selected-agitation]")?.replaceChildren(document.createTextNode(builderState.agitation));
  document.querySelector("[data-selected-heat]")?.replaceChildren(document.createTextNode(builderState.heat));

  if (activeOption?.dataset.image) {
    const image = document.querySelector("[data-builder-image]");
    const caption = document.querySelector("[data-builder-caption]");
    const stage = document.querySelector("[data-builder-stage]");
    const stepNumber = activeOption.closest(".builder-step")?.querySelector(".builder-step-heading span")?.textContent?.replace("Step ", "");

    if (image) {
      image.classList.add("is-changing");
      window.setTimeout(() => {
        image.src = activeOption.dataset.image;
        image.alt = activeOption.querySelector("strong")?.textContent || "Selected cleaning option";
        image.classList.remove("is-changing");
      }, 120);
    }
    if (caption) caption.textContent = activeOption.dataset.caption || "";
    if (stage && stepNumber) stage.textContent = `Step ${stepNumber} of 4`;
  }
}

builderOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const group = option.dataset.group;
    if (!group) return;

    document.querySelectorAll(`[data-builder-option][data-group="${group}"]`).forEach((groupOption) => {
      const isSelected = groupOption === option;
      groupOption.classList.toggle("is-selected", isSelected);
      groupOption.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    builderState[group] = option.dataset.value;
    updateBuilderDisplay(option);
  });
});

builderRooms?.addEventListener("input", () => {
  builderRooms.value = String(getRooms());
  updateBuilderDisplay();
});

roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!builderRooms) return;
    const nextValue = getRooms() + Number(button.dataset.roomStep || 0);
    builderRooms.value = String(Math.min(Math.max(nextValue, 1), 12));
    updateBuilderDisplay();
  });
});

updateBuilderDisplay(document.querySelector("[data-builder-option].is-selected"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
