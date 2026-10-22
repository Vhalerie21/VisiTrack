import { submitCheckIn } from "./api.js";

const gate = new URLSearchParams(window.location.search).get("gate");

const navigation = performance.getEntriesByType("navigation")[0];
const savedScrollPosition = sessionStorage.getItem("visitrack-scroll-y");

window.addEventListener(
  "scroll",
  () => {
    sessionStorage.setItem(
      "visitrack-scroll-y",
      String(window.scrollY),
    );
  },
  { passive: true },
);

if (navigation?.type === "reload" && savedScrollPosition) {
  window.requestAnimationFrame(() => {
    window.scrollTo(0, Number(savedScrollPosition));
  });
}

const form = document.querySelector("#checkin-form");
const input = document.querySelector("#reference-number");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#form-message");
const successState = document.querySelector("#success-state");

const VALID_REFERENCE = /^[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function formatReference(value) {
  const clean = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

  return [
    clean.slice(0, 2),
    clean.slice(2, 6),
    clean.slice(6, 10),
  ]
    .filter(Boolean)
    .join("-");
}

function setMessage(text) {
  message.textContent = text;
  input.setAttribute("aria-invalid", text ? "true" : "false");
}

function errorMessage(error) {
  const messages = {
    INVALID: "Enter a valid reference number in the format AB-XXXX-XXXX.",
    NOT_FOUND: "We couldn't find that reference number. Check it and try again.",
    DUPLICATE: "This reference is already checked in or has a pending request.",
    NETWORK: "We couldn't send your request. Check your connection and try again.",
  };

  return messages[error] || messages.NETWORK;
}

input.addEventListener("input", () => {
  input.value = formatReference(input.value);
  setMessage("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const referenceNumber = formatReference(input.value);
  input.value = referenceNumber;

  if (!VALID_REFERENCE.test(referenceNumber)) {
    setMessage(errorMessage("INVALID"));
    input.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  setMessage("");

  const result = await submitCheckIn(referenceNumber, gate);

  if (result.ok) {
    form.hidden = true;
    document.querySelector(".register-prompt").hidden = true;
    successState.hidden = false;
    successState.focus();
  } else {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    setMessage(errorMessage(result.error));
  }
});
