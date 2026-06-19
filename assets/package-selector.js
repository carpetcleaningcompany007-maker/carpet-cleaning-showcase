const packageSelect = document.querySelector("#selected-package");
const quoteSection = document.querySelector("#quote");

function selectPackage(packageValue) {
  if (!packageSelect || !packageValue) return;
  packageSelect.value = packageValue;

  const url = new URL(window.location.href);
  url.searchParams.set("package", packageValue);
  url.hash = "quote";
  history.replaceState(null, "", url);
}

document.querySelectorAll(".quote-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    selectPackage(link.dataset.package || "not-sure");
    quoteSection?.scrollIntoView({ behavior: "smooth" });
  });
});

const packageFromUrl = new URLSearchParams(window.location.search).get("package");
if (["standard-clean", "professional-deep-clean", "not-sure"].includes(packageFromUrl)) {
  packageSelect.value = packageFromUrl;
}
