const dialog = document.querySelector("[data-quote-dialog]");
const steps = Array.from(document.querySelectorAll("[data-step]"));
const progressItems = Array.from(document.querySelectorAll("[data-progress]"));
const stepArea = document.querySelector(".step-area");
const roomInput = document.querySelector("[data-room-count]");
const hslToggle = document.querySelector("[data-hsl-toggle]");
const preSpray = document.querySelector('[data-upgrade="pre-spray"]');
const agitation = document.querySelector('[data-upgrade="agitation"]');
const protection = document.querySelector('[data-upgrade="protection"]');
const backButton = document.querySelector("[data-builder-back]");
const nextButton = document.querySelector("[data-builder-next]");
let currentStep = 1;

function setText(selector, value) {
  document.querySelector(selector)?.replaceChildren(document.createTextNode(value));
}

function setHidden(selector, hidden) {
  const element = document.querySelector(selector);
  if (element) element.hidden = hidden;
}

function money(value) {
  return `£${Math.round(value)}`;
}

function roomCount() {
  const parsed = Number.parseInt(roomInput?.value || "0", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 12) : 0;
}

function state() {
  const rooms = roomCount();
  const hsl = Boolean(hslToggle?.checked);
  const areas = rooms + (hsl ? 3 : 0);
  return {
    rooms,
    hsl,
    areas,
    preSpray: Boolean(preSpray?.checked),
    agitation: Boolean(agitation?.checked),
    protection: Boolean(protection?.checked)
  };
}

function standardPrice(areas) {
  return areas * 30;
}

function targetedPrice(areas) {
  return areas > 0 ? 50 + (areas - 1) * 35 : 0;
}

function professionalPrice(areas) {
  return areas > 0 ? 75 + (areas - 1) * 45 : 0;
}

function pricing(current) {
  const base = standardPrice(current.areas);
  const targeted = targetedPrice(current.areas);
  const professionalNormal = professionalPrice(current.areas);
  const preAddition = current.preSpray ? Math.max(targeted - base, 0) : 0;
  const agitationAddition = current.agitation ? Math.max(professionalNormal - targeted, 0) : 0;
  const hallSaving = current.agitation && current.hsl ? 90 : 0;
  const cleaning = current.agitation
    ? professionalNormal - hallSaving
    : current.preSpray
      ? targeted
      : base;
  const protectionRate = current.agitation ? 15 : 30;
  const protectionPrice = current.protection ? current.areas * protectionRate : 0;
  const protectionSaving = current.protection && current.agitation ? current.areas * 15 : 0;
  return {
    base,
    targeted,
    professionalNormal,
    preAddition,
    agitationAddition,
    hallSaving,
    cleaning,
    protectionRate,
    protectionPrice,
    protectionSaving,
    saving: hallSaving + protectionSaving,
    total: cleaning + protectionPrice
  };
}

function cleanName(current) {
  if (current.agitation) return "Professional Deep Clean";
  if (current.preSpray) return "Targeted Pre-Spray Clean";
  return "Standard Spray & Extract";
}

function describeAreas(current) {
  if (!current.areas) return "None selected";
  const parts = [];
  if (current.rooms) parts.push(`${current.rooms} ${current.rooms === 1 ? "room" : "rooms"}`);
  if (current.hsl) parts.push("Hall, Stairs & Landing");
  return `${parts.join(" + ")} (${current.areas} ${current.areas === 1 ? "area" : "areas"})`;
}

function selectedServices(current) {
  const services = ["Standard Spray & Extract"];
  if (current.preSpray) services.push("Targeted Pre-Spray", "Dwell Time");
  if (current.agitation) services.push("Mechanical Agitation (CRB)", "Pile Lifting");
  if (current.protection) services.push("Carpet Protection");
  return services;
}

function selectedExtras(current) {
  const extras = [];
  if (current.agitation) extras.push("Complimentary odour neutraliser", "Protection at 50% off");
  if (current.agitation && current.hsl) extras.unshift("Hall & Landing included free");
  return extras;
}

function syncUpgradeCards(current) {
  document.querySelector('[data-upgrade-card="pre-spray"]')?.classList.toggle("is-selected", current.preSpray);
  document.querySelector('[data-upgrade-card="agitation"]')?.classList.toggle("is-selected", current.agitation);
  document.querySelector('[data-upgrade-card="protection"]')?.classList.toggle("is-selected", current.protection);
}

function updateIncludedList(current) {
  const list = document.querySelector("[data-included-list]");
  if (!list) return;
  const items = selectedServices(current);
  if (current.agitation) items.push("Complimentary odour neutraliser");
  if (current.agitation && current.hsl) items.push("Hall & Landing included free");
  list.replaceChildren(...items.map((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    return li;
  }));
}

function updateBuilder() {
  const current = state();
  const price = pricing(current);
  if (roomInput) roomInput.value = String(current.rooms);
  syncUpgradeCards(current);

  setText("[data-standard-total]", money(price.base));
  setHidden("[data-standard-minimum]", current.areas === 0 || current.areas >= 3);

  setText('[data-upgrade-price="pre-spray"]', current.areas ? `Add ${money(Math.max(price.targeted - price.base, 0))}` : "Add £20 for the first area");
  setText(
    '[data-upgrade-price="agitation"]',
    current.areas
      ? current.hsl
        ? `Add ${money(Math.max(price.professionalNormal - price.targeted, 0))} before £90 promotion`
        : `Add ${money(Math.max(price.professionalNormal - price.targeted, 0))}`
      : "Add £25 for the first area"
  );
  setText('[data-upgrade-price="protection"]', current.agitation ? "Add £15 per area (50% off)" : "Add £30 per area");
  setHidden("[data-professional-message]", !current.agitation);

  setText("[data-line-base]", money(price.base));
  setText("[data-line-pre]", `+${money(price.preAddition)}`);
  setText("[data-line-agitation]", `+${money(price.agitationAddition)}`);
  setText("[data-line-saving]", `−${money(price.hallSaving)}`);
  setText("[data-line-protection]", `+${money(price.protectionPrice)}`);
  setText("[data-final-total]", money(price.total));
  setHidden('[data-line="pre-spray"]', !current.preSpray);
  setHidden('[data-line="agitation"]', !current.agitation);
  setHidden('[data-line="hsl-saving"]', !price.hallSaving);
  setHidden('[data-line="protection"]', !current.protection);

  setHidden("[data-saving-offer]", !(current.agitation && current.hsl));
  setText("[data-normal-price]", money(price.professionalNormal));
  setText("[data-promo-pay]", money(price.professionalNormal - price.hallSaving));

  const services = selectedServices(current);
  const extras = selectedExtras(current);
  const savingLabels = [];
  if (price.hallSaving) savingLabels.push(`Hall & Landing ${money(price.hallSaving)}`);
  if (price.protectionSaving) savingLabels.push(`Protection ${money(price.protectionSaving)}`);
  setText("[data-live-total]", money(price.total));
  setText("[data-live-name]", cleanName(current));
  setText("[data-live-areas]", describeAreas(current));
  setText("[data-live-services]", services.join(" · "));
  setText("[data-live-savings]", savingLabels.length ? savingLabels.join(" · ") : "No savings yet");
  setText("[data-live-extras]", extras.length ? extras.join(" · ") : "No extras unlocked");

  updateIncludedList(current);
  const formPackage = document.querySelector("[data-form-package]");
  const formOptions = document.querySelector("[data-form-options]");
  if (formPackage) formPackage.value = current.agitation ? "professional-deep-clean" : current.preSpray ? "targeted-pre-spray" : "standard-clean";
  if (formOptions) formOptions.value = `${cleanName(current)}; ${describeAreas(current)}; ${services.join("; ")}; savings ${money(price.saving)}; extras ${extras.join("; ") || "none"}; estimated total ${money(price.total)}`;
}

function showStep(nextStep) {
  currentStep = Math.min(Math.max(nextStep, 1), 3);
  steps.forEach((step) => {
    const active = Number.parseInt(step.dataset.step, 10) === currentStep;
    step.hidden = !active;
    step.classList.toggle("is-active", active);
  });
  progressItems.forEach((item) => {
    const number = Number.parseInt(item.dataset.progress, 10);
    item.classList.toggle("is-current", number === currentStep);
    item.classList.toggle("is-complete", number < currentStep);
  });
  if (backButton) backButton.disabled = currentStep === 1;
  if (nextButton) {
    nextButton.hidden = currentStep === 3;
    nextButton.textContent = currentStep === 1 ? "Review Quote" : "Review & Finish";
  }
  setText("[data-step-status]", `Step ${currentStep} of 3`);
  if (stepArea) stepArea.scrollTop = 0;
  updateBuilder();
}

function openBuilder() {
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "");
  showStep(1);
}

function closeBuilder() {
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

document.querySelectorAll("[data-open-builder]").forEach((button) => button.addEventListener("click", openBuilder));
document.querySelector("[data-close-builder]")?.addEventListener("click", closeBuilder);
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) closeBuilder();
});

document.querySelectorAll("[data-room-change]").forEach((button) => {
  button.addEventListener("click", () => {
    const change = Number.parseInt(button.dataset.roomChange || "0", 10);
    if (roomInput) roomInput.value = String(roomCount() + change);
    updateBuilder();
  });
});
roomInput?.addEventListener("input", updateBuilder);
hslToggle?.addEventListener("change", updateBuilder);

preSpray?.addEventListener("change", () => {
  if (!preSpray.checked && agitation) agitation.checked = false;
  updateBuilder();
});
agitation?.addEventListener("change", () => {
  if (agitation.checked && preSpray) preSpray.checked = true;
  updateBuilder();
});
protection?.addEventListener("change", updateBuilder);

backButton?.addEventListener("click", () => showStep(currentStep - 1));
nextButton?.addEventListener("click", () => {
  if (currentStep === 1 && state().areas < 1) {
    setHidden("[data-room-validation]", false);
    return;
  }
  setHidden("[data-room-validation]", true);
  showStep(currentStep + 1);
});

updateBuilder();
if (window.location.hash === "#quote") openBuilder();
