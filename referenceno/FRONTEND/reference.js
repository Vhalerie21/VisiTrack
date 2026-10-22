// This is the one place to replace with a real API or database call later; the rest of this file should not need to change.
function loadRegistration() {
  const params = new URLSearchParams(window.location.search);

  return {
    referenceNumber: params.get("ref") || "AB-XXXX-XXXX",
    visitor: params.get("visitor") || "John Dela Cruz",
    date: params.get("date") || "Oct. 12, 2026",
    destination: params.get("destination") || "Registrar's Office",
    idType: params.get("idType") || "National ID"
  };
}

function renderRegistration(registration) {
  document.getElementById("reference-number").textContent =
    registration.referenceNumber;

  document.getElementById("visitor-name").textContent =
    registration.visitor;

  document.getElementById("visit-date").textContent =
    registration.date;

  document.getElementById("destination").textContent =
    registration.destination;

  document.getElementById("id-type").textContent =
    registration.idType;
}

function copyTextWithFallback(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard
      .writeText(text)
      .catch(() => copyWithTextarea(text));
  }

  return copyWithTextarea(text);
}

function copyWithTextarea(text) {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    try {
      if (!document.execCommand("copy")) {
        throw new Error("Copy command failed");
      }

      resolve();
    } catch (error) {
      reject(error);
    } finally {
      textarea.remove();
    }
  });
}

function setupCopyButton() {
  const button = document.getElementById("copy-button");
  const label = button.querySelector("span");
  const status = document.getElementById("copy-status");

  let resetTimer;

  button.addEventListener("click", () => {
    const referenceNumber =
      document.getElementById("reference-number").textContent;

    copyTextWithFallback(referenceNumber)
      .then(() => {
        label.textContent = "Copied!";
        status.textContent = "Reference number copied to clipboard.";

        clearTimeout(resetTimer);

        resetTimer = setTimeout(() => {
          label.textContent = "Copy Reference Number";
          status.textContent = "";
        }, 2000);
      })
      .catch(() => {
        label.textContent = "Copy failed";
        status.textContent =
          "Unable to copy automatically. Please copy the reference number manually.";
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          label.textContent = "Copy Reference Number";
          status.textContent = "";
        }, 2000);
      })
      .finally(() => button.focus());
  });
}

// If loading later returns a Promise, init() can become async without changing the rendering code.
function init() {
  const registration = loadRegistration();
  renderRegistration(registration);
  setupCopyButton();
}

init();