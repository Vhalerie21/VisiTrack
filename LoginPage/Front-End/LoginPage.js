// Login API and dashboard destinations.
const API_URL = "/api/admin/login";
const PASSWORD_CHANGE_URL = "/api/password/change";
const ADMIN_URL = "../../admin-dashboard/FRONTEND/dashboard.html";
const SECURITY_URL = "../../SecurityDB/Front-End/SecurityDB.html";

// Password-change API request; configure its route with the PHP back end.
// The PHP endpoint must hash passwords with password_hash, verify the temporary
// password server-side, clear the must-change flag, and refuse access to every
// protected page until the password change is complete. This modal alone can
// be bypassed in the browser and is not an access-control mechanism.
async function submitPasswordChange(newPassword) {
  const response = await fetch(PASSWORD_CHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newPassword }),
  });

  const responseData = response.headers
    .get("content-type")
    ?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || responseData?.ok === false) {
    throw new Error(
      responseData?.message || "The password could not be updated. Please try again."
    );
  }

  return { ok: true };
}

// Login page and password-change dialog behavior.
const roleParam = new URLSearchParams(window.location.search).get("role");
const isSecurity = roleParam === "security";
const activeRole = isSecurity ? "Security" : "Admin";
let redirectRole = activeRole;
const loginPage = document.getElementById("login-page-content");
const loginForm = document.querySelector(".login-form");
const loginError = document.getElementById("login-error");
const loginButton = document.getElementById("login-submit");
const identityInput = document.getElementById("identity");
const loginPassword = document.getElementById("login-password");
const dialogBackdrop = document.getElementById("password-dialog-backdrop");
const dialog = document.getElementById("password-dialog");
const changeForm = document.getElementById("password-change-form");
const changeFields = document.getElementById("password-change-fields");
const temporaryPassword = document.getElementById("temporary-password");
const newPassword = document.getElementById("new-password");
const confirmPassword = document.getElementById("confirm-password");
const confirmError = document.getElementById("confirm-error");
const changeError = document.getElementById("password-change-error");
const changeSuccess = document.getElementById("password-change-success");
const saveButton = document.getElementById("password-save");
const strengthMeter = document.getElementById("strength-meter");
const strengthLabel = document.getElementById("strength-label");
const requirementItems = Array.from(
  document.querySelectorAll("[data-requirement]")
);
const logoutLink = document.getElementById("password-logout");
let isSaving = false;
let dialogIsOpen = false;
let redirectTimer;
let previousDocumentOverflow = "";

document.title = `VisiTrack | ${activeRole} Log-in`;
document.getElementById("login-title").textContent = `${activeRole} Log-in`;
document.getElementById("login-subtitle").textContent = isSecurity
  ? "Check visitors in and out at the gate."
  : "Manage Users, Reports, and Audits.";
document.getElementById("identity-label").textContent =
  `${activeRole} ID or email`;
loginButton.textContent = `Log in as ${activeRole}`;

const activeTab = document.getElementById(
  isSecurity ? "security-tab" : "admin-tab"
);
activeTab.classList.add("is-active");
activeTab.setAttribute("aria-current", "page");

function getRedirectUrl(role) {
  return role === "Security" ? SECURITY_URL : ADMIN_URL;
}

function getResponseRole(role) {
  if (typeof role !== "string") {
    return activeRole;
  }
  if (role.toLowerCase() === "security") {
    return "Security";
  }
  return role.toLowerCase() === "admin" ? "Admin" : activeRole;
}

function openPasswordDialog(password) {
  temporaryPassword.value = password;
  loginPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  changeError.hidden = true;
  changeError.textContent = "";
  changeSuccess.hidden = true;
  changeFields.disabled = false;
  isSaving = false;
  dialogIsOpen = true;
  saveButton.textContent = "Save new password";
  dialogBackdrop.hidden = false;
  previousDocumentOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";
  loginPage.inert = true;
  loginPage.setAttribute("aria-hidden", "true");
  updatePasswordState();
  temporaryPassword.focus();
}

function clearPasswordDialog() {
  temporaryPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

function closePasswordDialog() {
  window.clearTimeout(redirectTimer);
  dialogIsOpen = false;
  redirectRole = activeRole;
  clearPasswordDialog();
  dialogBackdrop.hidden = true;
  document.documentElement.style.overflow = previousDocumentOverflow;
  loginPage.inert = false;
  loginPage.removeAttribute("aria-hidden");
  loginForm.reset();
  loginError.hidden = true;
  loginError.textContent = "";
  loginButton.disabled = false;
  loginButton.textContent = `Log in as ${activeRole}`;
  identityInput.focus();
}

function getPasswordChecks(value) {
  const temporaryValue = temporaryPassword.value;
  return {
    length: Array.from(value).length >= 10,
    uppercase: /\p{Lu}/u.test(value),
    lowercase: /\p{Ll}/u.test(value),
    number: /\p{N}/u.test(value),
    different: value.length > 0 && value !== temporaryValue,
  };
}

function updatePasswordState() {
  const value = newPassword.value;
  const checks = getPasswordChecks(value);
  const allRequirementsMet = Object.values(checks).every(Boolean);

  requirementItems.forEach((item) => {
    const isMet = checks[item.dataset.requirement];
    item.classList.toggle("is-met", isMet);
    item.querySelector(".requirement-icon").textContent = isMet ? "✓" : "○";
    item.querySelector(".requirement-status").textContent = isMet
      ? "Met"
      : "Not met";
  });

  const characterTypes = [
    /\p{Lu}/u.test(value),
    /\p{Ll}/u.test(value),
    /\p{N}/u.test(value),
    /[^\p{L}\p{N}]/u.test(value),
  ].filter(Boolean).length;
  const strength = value.length === 0
    ? 0
    : Math.min(
      4,
      (Array.from(value).length >= 10 ? 1 : 0) + characterTypes
    );
  const strengthText = value.length === 0
    ? "—"
    : ["Weak", "Weak", "Fair", "Good", "Strong"][strength];
  strengthMeter.classList.remove(
    "strength-weak",
    "strength-fair",
    "strength-good",
    "strength-strong"
  );
  if (value.length > 0) {
    strengthMeter.classList.add(`strength-${strengthText.toLowerCase()}`);
  }
  Array.from(strengthMeter.children).forEach((segment, index) => {
    segment.classList.toggle("is-filled", index < strength);
  });
  strengthLabel.textContent = strengthText;
  strengthMeter.setAttribute(
    "aria-label",
    value.length === 0 ? "Strength not entered" : `Strength: ${strengthText}`
  );

  const passwordsMatch =
    confirmPassword.value.length > 0 &&
    confirmPassword.value === newPassword.value;
  confirmError.hidden =
    confirmPassword.value.length === 0 || passwordsMatch;
  confirmPassword.setAttribute(
    "aria-invalid",
    String(confirmPassword.value.length > 0 && !passwordsMatch)
  );
  saveButton.disabled =
    isSaving ||
    !allRequirementsMet ||
    !passwordsMatch ||
    temporaryPassword.value.length === 0;
}

// Login API request and existing status-specific feedback.
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Logging in...";

  try {
    const credentials = {
      identity: identityInput.value,
      password: loginPassword.value,
      remember: loginForm.elements.namedItem("remember").checked,
    };
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (response.status === 200) {
      const responseData = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : {};
      redirectRole = getResponseRole(responseData.role);

      if (responseData.mustChangePassword === true) {
        openPasswordDialog(credentials.password);
      } else {
        window.location.assign(getRedirectUrl(redirectRole));
      }
    } else if (response.status === 401) {
      loginError.textContent = "Wrong ID/email or password.";
      loginError.hidden = false;
    } else if (response.status === 429) {
      loginError.textContent = "Too many attempts. Try again later.";
      loginError.hidden = false;
    } else {
      loginError.textContent = "Something went wrong. Please try again.";
      loginError.hidden = false;
    }
  } catch {
    loginError.textContent = "Something went wrong. Please try again.";
    loginError.hidden = false;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = `Log in as ${activeRole}`;
  }
});

// Live password checks, confirmation matching, and reveal controls.
newPassword.addEventListener("input", updatePasswordState);
confirmPassword.addEventListener("input", updatePasswordState);

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.passwordToggle);
    const isVisible = input.type === "password";
    const fieldLabel = button.dataset.passwordName;
    input.type = isVisible ? "text" : "password";
    button.textContent = isVisible ? "Hide" : "Show";
    button.setAttribute("aria-pressed", String(isVisible));
    button.setAttribute(
      "aria-label",
      `${isVisible ? "Hide" : "Show"} ${fieldLabel}`
    );
  });
});

// Submit valid changes, report failures, and redirect after confirmation.
changeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  updatePasswordState();
  if (saveButton.disabled) {
    return;
  }

  isSaving = true;
  changeFields.disabled = true;
  changeForm.setAttribute("aria-busy", "true");
  saveButton.textContent = "Saving...";
  changeError.hidden = true;
  changeError.textContent = "";

  try {
    const response = await submitPasswordChange(newPassword.value);
    if (!dialogIsOpen) {
      return;
    }

    if (!response.ok) {
      throw new Error("The password could not be updated.");
    }

    changeSuccess.hidden = false;
    changeForm.setAttribute("aria-busy", "false");
    saveButton.textContent = "Password updated";
    clearPasswordDialog();
    redirectTimer = window.setTimeout(() => {
      window.location.assign(getRedirectUrl(redirectRole));
    }, 1500);
  } catch (error) {
    if (!dialogIsOpen) {
      return;
    }

    changeError.textContent =
      error instanceof Error
        ? error.message
        : "The password could not be updated. Please try again.";
    changeError.hidden = false;
    changeFields.disabled = false;
    isSaving = false;
    changeForm.setAttribute("aria-busy", "false");
    saveButton.textContent = "Save new password";
    updatePasswordState();
  }
});

// Keep keyboard focus in the modal; Escape and backdrop clicks cannot dismiss it.
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = Array.from(
    dialog.querySelectorAll(
      'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hidden);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (focusable.length === 0) {
    event.preventDefault();
    dialog.focus();
  }
});

logoutLink.addEventListener("click", (event) => {
  event.preventDefault();
  closePasswordDialog();
});
