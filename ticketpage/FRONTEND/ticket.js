const ticketData = {
  visitorName: "Dela Cruz, Juan S.",
  idSlot: "A11",
  status: "checked-in",
};

const statusLabels = {
  "checked-in": "Checked-in",
  pending: "Pending",
};

function renderTicket(data = {}) {
  const nameElement = document.querySelector("[data-ticket-name]");
  const slotElement = document.querySelector("[data-ticket-slot]");
  const statusElement = document.querySelector("[data-ticket-status]");

  if (!nameElement || !slotElement || !statusElement) return;

  nameElement.textContent = data.visitorName || "—";
  slotElement.textContent = data.idSlot || "—";

  const status = data.status || "pending";

  statusElement.className = `ticket__status ticket__status--${status}`;
  statusElement.textContent = statusLabels[status] || "Pending";
  statusElement.setAttribute("data-status", status);
}

const referenceNumber = new URLSearchParams(window.location.search).get("ref");

// TODO(back-end): replace ticketData with the visitor record returned for referenceNumber.
renderTicket(ticketData);