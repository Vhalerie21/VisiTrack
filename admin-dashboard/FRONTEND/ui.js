/* Purpose: safe DOM and shared formatting helpers. Pages using it: all admin controllers. API stubs: none. */
(function () {
  const ui = {
    el(tag, text, cls) {
      const e = document.createElement(tag);
      if (text !== undefined) e.textContent = text;
      if (cls) e.className = cls;
      return e;
    }, clear(e) {
      while (e.firstChild) e.removeChild(e.firstChild);
    }, formatTime(value) {
      return value ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";
    }, formatDateTime(value) {
      return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—";
    }, fieldErrors(form, fields = {}) {
      form.querySelectorAll(".vt-admin-field-error").forEach(e => e.remove());
      form.querySelectorAll("[aria-invalid]").forEach(e => e.removeAttribute("aria-invalid"));
      Object.entries(fields).forEach(([name, message]) => {
        const input = Array.from(form.elements).find(e => e.name === name);
        if (!input) return;
        input.setAttribute("aria-invalid", "true");
        input.parentElement.appendChild(ui.el("div", message, "vt-admin-field-error"));
      });
    }, toast(message, type = "success") {
      const t = ui.el("div", message, `vt-admin-toast ${type}`);
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }, error(error) {
      if (error.status === 401) {
        sessionStorage.clear();
        ui.toast("Session expired", "error");
        setTimeout(() => { window.location.href = "login-placeholder.html"; }, 500);
      } else if (error.status === 403) ui.toast("You don't have permission", "error");
      else if (error.status === 422) ui.toast("Please correct the highlighted fields.", "error");
      else ui.toast("Something went wrong. Try again.", "error");
    }
  };
  window.VisiTrackUI = ui;
}());
