const products = [
  {
    name: "4 Channel CCTV Starter Kit",
    type: "cctv",
    description: "DVR, four HD cameras, power supply, storage, and installation basics.",
    price: 18500,
  },
  {
    name: "IP Camera with NVR",
    type: "cctv",
    description: "High clarity camera package for shops, homes, and offices.",
    price: 7200,
  },
  {
    name: "Cat6 Network Point",
    type: "network",
    description: "Structured cable run with faceplate, patching, and signal testing.",
    price: 1450,
  },
  {
    name: "Business Wi-Fi Access Point",
    type: "network",
    description: "Ceiling or wall access point configured for stable coverage.",
    price: 6200,
  },
  {
    name: "UPS Backup Unit",
    type: "it",
    description: "Backup power for camera systems, routers, and computer equipment.",
    price: 3900,
  },
  {
    name: "Printer and Desktop Setup",
    type: "it",
    description: "Device installation, sharing, drivers, and basic user setup.",
    price: 2500,
  },
];

const formatRupees = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const productList = document.querySelector("#productList");
const filters = document.querySelectorAll(".filter");
const quoteInputs = document.querySelectorAll("#quoteForm input, #quoteForm select");
const estimateTotal = document.querySelector("#estimateTotal");
const estimateSummary = document.querySelector("#estimateSummary");
const copyEstimate = document.querySelector("#copyEstimate");
const requirement = document.querySelector("#requirement");
const serviceButtons = document.querySelectorAll("[data-service]");
const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");
const brandMark = document.querySelector("#brandMark");
const logoUpload = document.querySelector("#logoUpload");

let activeFilter = "all";
let currentSummary = "";
let selectedProducts = [];

function setLogoPreview(src) {
  brandMark.classList.add("has-logo");
  brandMark.innerHTML = `<img class="brand-logo" src="${src}" alt="Octalink Network logo" />`;
}

function restoreLogo() {
  const savedLogo = localStorage.getItem("octalinkLogo");

  if (savedLogo) {
    setLogoPreview(savedLogo);
  }
}

function renderProducts() {
  const visibleProducts =
    activeFilter === "all" ? products : products.filter((product) => product.type === activeFilter);

  productList.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-item">
          <div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
          <div class="product-actions">
            <span class="price">${formatRupees(product.price)}</span>
            <button class="mini-button" data-product="${product.name}" type="button">Add</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function syncRequirement() {
  if (!selectedProducts.length) return;

  requirement.value = `Interested products: ${selectedProducts.join(", ")}. Please share availability, installation, and final pricing.`;
}

function calculateEstimate() {
  const projectType = document.querySelector("#projectType").value;
  const cameras = Number(document.querySelector("#cameraCount").value);
  const networkPoints = Number(document.querySelector("#networkPoints").value);
  const wifiPoints = Number(document.querySelector("#wifiPoints").value);
  const supportPlan = document.querySelector("#supportPlan").value;

  const supportRates = {
    Basic: 1500,
    Priority: 4500,
    Premium: 8500,
  };

  const total = 3500 + cameras * 4200 + networkPoints * 1450 + wifiPoints * 6200 + supportRates[supportPlan];
  const low = Math.round(total * 0.92);
  const high = Math.round(total * 1.14);

  currentSummary = `${projectType} project: ${cameras} cameras, ${networkPoints} network points, ${wifiPoints} Wi-Fi access points, ${supportPlan} support. Estimated range ${formatRupees(low)} to ${formatRupees(high)}.`;

  estimateTotal.textContent = `${formatRupees(low)} - ${formatRupees(high)}`;
  estimateSummary.textContent = currentSummary;
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("active", isActive);
      filter.setAttribute("aria-selected", String(isActive));
    });
    renderProducts();
  });
});

productList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (!button) return;

  if (!selectedProducts.includes(button.dataset.product)) {
    selectedProducts = [...selectedProducts, button.dataset.product];
  }

  button.textContent = "Added";
  syncRequirement();
});

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    requirement.value = `Interested in ${button.dataset.service}. Please arrange a site survey and pricing.`;
    document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
  });
});

quoteInputs.forEach((input) => input.addEventListener("input", calculateEstimate));

copyEstimate.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentSummary);
    copyEstimate.textContent = "Copied";
    setTimeout(() => {
      copyEstimate.textContent = "Copy estimate";
    }, 1400);
  } catch {
    requirement.value = currentSummary;
    document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#customerName").value.trim();
  const phone = document.querySelector("#customerPhone").value.trim();
  const need = requirement.value.trim() || currentSummary;
  const enquiry = `New Octalink enquiry from ${name}, phone ${phone}. Requirement: ${need}`;

  formStatus.textContent = "Enquiry prepared. You can paste it into WhatsApp, email, or your CRM.";
  navigator.clipboard?.writeText(enquiry).catch(() => undefined);
});

logoUpload.addEventListener("change", () => {
  const [file] = logoUpload.files;

  if (!file) return;

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    const result = reader.result;

    if (typeof result !== "string") return;

    setLogoPreview(result);
    localStorage.setItem("octalinkLogo", result);
  });

  reader.readAsDataURL(file);
});

restoreLogo();
renderProducts();
calculateEstimate();
