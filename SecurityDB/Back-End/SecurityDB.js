/*place holder data for the dashboard, will 
be replaced with actual data from database when ready*/
const requests = [
  {
    reference: "REF-90231",
    name: "J. Dela Cruz",
    office: "Registrar's Office",
  },
  {
    reference: "REF-90244",
    name: "A. Comeros",
    office: "College of Science",
  },
];

const visitors = [
  {
    reference: "REF-90221",
    name: "K. Aquino",
    slot: "A-02",
    timeIn: "8:15 AM",
    timeOutRequested: false,
    idAlert: "past-pickup",
  },
  {
    reference: "REF-90222",
    name: "S. Lim",
    slot: "B-05",
    timeIn: "8:40 AM",
    timeOutRequested: false,
  },
  {
    reference: "REF-90230",
    name: "H. Ocampo",
    slot: "C-02",
    timeIn: "8:58 AM",
    timeOutRequested: false,
    idAlert: "flagged",
  },
  {
    reference: "REF-90235",
    name: "G. Mercado",
    slot: "D-02",
    timeIn: "9:05 AM",
    timeOutRequested: false,
  },
  {
    reference: "REF-90241",
    name: "N. Pascual",
    slot: "D-05",
    timeIn: "9:22 AM",
    timeOutRequested: false,
    idAlert: "past-pickup",
  },
];

const logs = [
  { name: "M. Santos", status: "Timed In", slot: "A-02", time: "09:55 AM" },
  { name: "J. dela Cruz", status: "Timed Out", slot: "---", time: "09:03 AM" },
  { name: "A. Reyes", status: "Timed In", slot: "C-11", time: "09:10 AM" },
];

const slots = Array.from({ length: 20 }, (_, index) => {
  const row = String.fromCharCode(65 + Math.floor(index / 5));
  const number = String((index % 5) + 1).padStart(2, "0");
  return `${row}-${number}`;
});

let liveCount = 42;
let selectedSlot = null;

const liveCountElement = document.getElementById("live-count");
const pendingCountElement = document.getElementById("pending-count");
const feedbackElement = document.getElementById("dashboard-feedback");
const requestRows = document.getElementById("time-in-rows");
const visitorRows = document.getElementById("time-out-rows");
const logRows = document.getElementById("log-rows");
const slotGrid = document.getElementById("slot-grid");
const slotDetails = document.getElementById("slot-details");

function announce(message) {
  feedbackElement.textContent = message;
  feedbackElement.hidden = false;
}

function updateCounts() {
  liveCountElement.textContent = String(liveCount);
  pendingCountElement.textContent = String(requests.length);
}

function renderRequests() {
  if (requests.length === 0) {
    requestRows.innerHTML =
      '<tr class="empty-row"><td colspan="4">No pending time-in requests.</td></tr>';
    return;
  }

  requestRows.innerHTML = requests
    .map(
      (request) => `
        <tr>
          <td>${request.reference}</td>
          <td>${request.name}</td>
          <td>${request.office}</td>
          <td>
            <div class="table-actions">
              <button class="dashboard-button dashboard-button-primary" type="button" data-request-action="accept" data-reference="${request.reference}">Accept</button>
              <button class="dashboard-button dashboard-button-danger" type="button" data-request-action="reject" data-reference="${request.reference}">Reject</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderVisitors() {
  const query = document.getElementById("time-out-search").value.trim().toLowerCase();
  const filteredVisitors = visitors.filter((visitor) =>
    [visitor.reference, visitor.name, visitor.slot, visitor.timeIn]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  if (filteredVisitors.length === 0) {
    visitorRows.innerHTML =
      '<tr class="empty-row"><td colspan="5">No visitors match your search.</td></tr>';
    return;
  }

  visitorRows.innerHTML = filteredVisitors
    .map((visitor) => {
      const alert = renderIdAlert(visitor.idAlert);
      const actions = visitor.timeOutRequested
        ? `<button class="dashboard-button dashboard-button-primary" type="button" data-visitor-action="confirm" data-reference="${visitor.reference}">ID Returned, confirm</button>
           <button class="dashboard-button" type="button" data-visitor-action="reject" data-reference="${visitor.reference}">Reject</button>`
        : `<button class="dashboard-button" type="button" data-visitor-action="time-out" data-reference="${visitor.reference}">Time out</button>`;

      return `
        <tr>
          <td>${visitor.reference}</td>
          <td>${visitor.name}${alert}</td>
          <td>${visitor.slot}</td>
          <td>${visitor.timeIn}</td>
          <td><div class="table-actions">${actions}</div></td>
        </tr>
      `;
    })
    .join("");
}

function renderLogs() {
  const query = document.getElementById("logs-search").value.trim().toLowerCase();
  const filteredLogs = logs.filter((entry) =>
    [entry.name, entry.status, entry.slot, entry.time]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  if (filteredLogs.length === 0) {
    logRows.innerHTML =
      '<tr class="empty-row"><td colspan="4">No visitor logs match your search.</td></tr>';
    return;
  }

  logRows.innerHTML = filteredLogs
    .map(
      (entry) => `
        <tr>
          <td>${entry.name}</td>
          <td><span class="status-pill">${entry.status}</span></td>
          <td>${entry.slot}</td>
          <td>${entry.time}</td>
        </tr>
      `,
    )
    .join("");
}

function findVisitor(reference) {
  return visitors.find((visitor) => visitor.reference === reference);
}

function renderIdAlert(idAlert) {
  if (idAlert !== "flagged" && idAlert !== "past-pickup") {
    return "";
  }

  const label = idAlert === "flagged" ? "Flagged ID" : "Past pickup";
  return `<span class="id-alert" title="${label}"><span aria-hidden="true">!</span><span>${label}</span></span>`;
}

function findVacantSlot() {
  return slots.find((slot) => !visitors.some((visitor) => visitor.slot === slot));
}

function formatCurrentTime() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date())
    .toUpperCase();
}

function renderSlots() {
  slotGrid.innerHTML = slots
    .map((slot) => {
      const visitor = visitors.find((activeVisitor) => activeVisitor.slot === slot);
      const occupiedClass = visitor ? " is-occupied" : "";
      const pressed = selectedSlot === slot ? "true" : "false";
      const alertLabel = visitor?.idAlert === "flagged"
        ? ", flagged ID"
        : visitor?.idAlert === "past-pickup"
          ? ", past pickup ID"
          : "";
      const label = visitor
        ? `${slot}, occupied by ${visitor.name}${alertLabel}`
        : `${slot}, vacant`;
      return `
        <button class="slot-button${occupiedClass}" type="button" data-slot="${slot}" aria-label="${label}" aria-pressed="${pressed}">
          ${slot}
        </button>
      `;
    })
    .join("");

  renderSlotDetails();
}

function renderSlotDetails() {
  if (!selectedSlot) {
    slotDetails.innerHTML = "<span>Select a slot to see who is using it.</span>";
    return;
  }

  const visitor = visitors.find((activeVisitor) => activeVisitor.slot === selectedSlot);
  if (!visitor) {
    slotDetails.innerHTML = `<span>${selectedSlot} is vacant and ready for the next visitor.</span>`;
    return;
  }

  const actions = visitor.timeOutRequested
    ? `<button class="dashboard-button dashboard-button-primary" type="button" data-slot-action="confirm" data-reference="${visitor.reference}">ID Returned, confirm</button>
       <button class="dashboard-button" type="button" data-slot-action="reject" data-reference="${visitor.reference}">Reject</button>`
    : `<button class="dashboard-button" type="button" data-slot-action="time-out" data-reference="${visitor.reference}">Time out</button>`;

  slotDetails.innerHTML = `
    <span><strong>${selectedSlot}</strong> is assigned to ${visitor.name} (${visitor.reference}).${renderIdAlert(visitor.idAlert)}</span>
    <div class="table-actions">${actions}</div>
  `;
}

function renderDashboard() {
  updateCounts();
  renderRequests();
  renderVisitors();
  renderLogs();
  renderSlots();
}

function completeTimeOut(reference) {
  const index = visitors.findIndex((visitor) => visitor.reference === reference);
  if (index === -1) {
    announce("That visitor is no longer checked in. Refresh the dashboard before trying again.");
    return;
  }

  const [visitor] = visitors.splice(index, 1);
  logs.unshift({
    name: visitor.name,
    status: "Timed Out",
    slot: visitor.slot,
    time: formatCurrentTime(),
  });
  liveCount = Math.max(0, liveCount - 1);
  selectedSlot = null;
  renderDashboard();
  announce(`${visitor.name} has timed out. Slot ${visitor.slot} is now vacant.`);
}

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    document.querySelectorAll(".nav-link").forEach((navButton) => {
      const isActive = navButton === button;
      navButton.classList.toggle("is-active", isActive);
      if (isActive) {
        navButton.setAttribute("aria-current", "page");
      } else {
        navButton.removeAttribute("aria-current");
      }
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== view;
    });
    feedbackElement.hidden = true;
  });
});

requestRows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-request-action]");
  if (!button) {
    return;
  }

  const requestIndex = requests.findIndex(
    (request) => request.reference === button.dataset.reference,
  );
  if (requestIndex === -1) {
    announce("That request is no longer pending. Refresh the dashboard before trying again.");
    return;
  }

  const [request] = requests.splice(requestIndex, 1);
  if (button.dataset.requestAction === "accept") {
    const slot = findVacantSlot();
    if (!slot) {
      requests.splice(requestIndex, 0, request);
      announce("No storage slots are available. Free a slot before accepting this request.");
      return;
    }

    visitors.push({
      reference: request.reference,
      name: request.name,
      slot,
      timeIn: formatCurrentTime(),
      timeOutRequested: false,
    });
    logs.unshift({
      name: request.name,
      status: "Timed In",
      slot,
      time: formatCurrentTime(),
    });
    liveCount += 1;
    renderDashboard();
    announce(`${request.name} has been checked in and assigned to slot ${slot}.`);
    return;
  }

  renderDashboard();
  announce(`Time-in request ${request.reference} was rejected.`);
});

visitorRows.addEventListener("click", (event) => {
  const button = event.target.closest("[data-visitor-action]");
  if (!button) {
    return;
  }

  const visitor = findVisitor(button.dataset.reference);
  if (!visitor) {
    announce("That visitor is no longer checked in. Refresh the dashboard before trying again.");
    return;
  }

  if (button.dataset.visitorAction === "confirm") {
    completeTimeOut(visitor.reference);
  } else if (button.dataset.visitorAction === "reject") {
    visitor.timeOutRequested = false;
    renderVisitors();
    announce(`Time-out for ${visitor.name} was cancelled. The visitor remains checked in.`);
  } else if (button.dataset.visitorAction === "time-out") {
    visitor.timeOutRequested = true;
    renderVisitors();
    announce(`Confirm that ${visitor.name}'s ID has been returned, or reject to cancel time-out.`);
  } else {
    completeTimeOut(visitor.reference);
  }
});

slotGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-slot]");
  if (!button) {
    return;
  }
  selectedSlot = button.dataset.slot;
  renderSlots();
});

slotDetails.addEventListener("click", (event) => {
  const button = event.target.closest("[data-slot-action]");
  if (!button) {
    return;
  }

  const visitor = findVisitor(button.dataset.reference);
  if (!visitor) {
    announce("That visitor is no longer checked in. Refresh the dashboard before trying again.");
    return;
  }

  if (button.dataset.slotAction === "confirm") {
    completeTimeOut(visitor.reference);
  } else if (button.dataset.slotAction === "reject") {
    visitor.timeOutRequested = false;
    renderSlots();
    announce(`Time-out for ${visitor.name} was cancelled. The visitor remains checked in.`);
  } else {
    visitor.timeOutRequested = true;
    renderSlots();
    announce(`Confirm that ${visitor.name}'s ID has been returned, or reject to cancel time-out.`);
  }
});

document.getElementById("time-out-search").addEventListener("input", renderVisitors);
document.getElementById("logs-search").addEventListener("input", renderLogs);

renderDashboard();
