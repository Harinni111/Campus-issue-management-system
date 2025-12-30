async function loadManagerDashboard() {
  const meRes = await fetch("/auth/me", { credentials: "include" });

  if (!meRes.ok) {
    window.location.href = "/auth/login.html";
    return;
  }

  const user = await meRes.json();
  document.getElementById("welcome").textContent =
    `Welcome ${user.username} (Manager - ${user.department})`;

  await loadIssues();
}

async function loadIssues() {
  const res = await fetch("/issues", { credentials: "include" });
  const issues = await res.json();
  renderIssues(issues);
}

function renderIssues(issues) {
  const container = document.getElementById("issues");
  container.innerHTML = "";

  if (issues.length === 0) {
    container.innerHTML =
      "<p class='text-muted'>No issues for your department.</p>";
    return;
  }

  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "card";

    const statusClass =
      issue.status === "OPEN"
        ? "badge-warning"
        : issue.status === "IN_PROGRESS"
        ? "badge-info"
        : issue.status === "RESOLVED"
        ? "badge-success"
        : issue.status === "CLOSED"
        ? "badge-dark"
        : "badge-danger";

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>${issue.title}</h3>
        <span class="badge ${statusClass}">
          ${issue.status}
        </span>
      </div>

      <p>${issue.description}</p>

      <div class="text-muted" style="margin-bottom:10px;">
        Department: <b>${issue.department}</b><br/>
        Created by: <b>${issue.createdBy.username}</b><br/>
        Created: ${new Date(issue.createdAt).toLocaleString()}
      </div>

      <div class="text-muted" style="margin-bottom:10px;">
        Remark: ${issue.remark || "—"}
      </div>

      <div style="display:flex; gap:10px;">
        <button class="btn btn-primary"
          onclick="openEdit('${issue._id}')">
          Manage Issue
        </button>

        <button class="btn btn-secondary"
          onclick="toggleHistory('${issue._id}')">
          View History
        </button>
      </div>

      <!-- EDIT PANEL -->
      <div id="edit-${issue._id}"
        style="display:none; margin-top:15px; padding-top:15px; border-top:1px solid #eee;">

        <label>Status</label>
        <select id="status-${issue._id}">
          ${renderStatusOptions(issue.status)}
        </select>

        <label style="margin-top:10px;">Remark</label>
        <textarea id="remark-${issue._id}" rows="3"
          placeholder="Add internal remark">${issue.remark || ""}</textarea>

        <div style="margin-top:10px; display:flex; gap:10px;">
          <button class="btn btn-primary"
            onclick="saveChanges('${issue._id}')">
            Save Changes
          </button>
          <button class="btn btn-secondary"
            onclick="cancelEdit('${issue._id}')">
            Cancel
          </button>
        </div>
      </div>

      <!-- HISTORY -->
      <div id="history-${issue._id}"
        style="display:none; margin-top:15px;">
      </div>
    `;

    container.appendChild(card);
  });
}

function renderStatusOptions(current) {
  const statuses = [
    "OPEN",
    "IN_PROGRESS",
    "ON_HOLD",
    "RESOLVED",
    "CLOSED",
    "REOPENED"
  ];

  return statuses
    .map(
      s =>
        `<option value="${s}" ${
          s === current ? "selected" : ""
        }>${s}</option>`
    )
    .join("");
}

// 🔽 OPEN EDIT PANEL (one at a time)
function openEdit(issueId) {
  document
    .querySelectorAll("[id^='edit-']")
    .forEach(div => (div.style.display = "none"));

  document.getElementById(`edit-${issueId}`).style.display = "block";
}

function cancelEdit(issueId) {
  document.getElementById(`edit-${issueId}`).style.display = "none";
}

// 💾 SAVE STATUS / REMARK
async function saveChanges(issueId) {
  const status = document.getElementById(`status-${issueId}`).value;
  const remark = document.getElementById(`remark-${issueId}`).value;

  const res = await fetch(`/issues/${issueId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, remark })
  });

  if (!res.ok) {
    alert("Failed to update issue");
    return;
  }

  await loadIssues();
}

// 🔁 HISTORY TOGGLE (lazy)
async function toggleHistory(issueId) {
  const el = document.getElementById(`history-${issueId}`);

  if (el.style.display === "block") {
    el.style.display = "none";
    return;
  }

  const res = await fetch(`/issues/${issueId}`, {
    credentials: "include"
  });

  const issue = await res.json();
  el.innerHTML = renderHistory(issue.history);
  el.style.display = "block";
}

// 🧾 HISTORY RENDER
function renderHistory(history = []) {
  if (!history.length) {
    return "<p class='text-muted'>No history available.</p>";
  }

  return `
    <div class="card" style="background:#fafafa;">
      <h4>Issue History</h4>
      ${history
        .map(h => {
          let text = h.action.replace("_", " ");
          if (h.from && h.to) {
            text += `: "${h.from}" → "${h.to}"`;
          }

          return `
            <div style="margin-bottom:10px;">
              <b>${text}</b><br/>
              <span class="text-muted">
                by ${h.by.username} (${h.by.role}) •
                ${new Date(h.timestamp).toLocaleString()}
              </span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// ✅ INITIAL LOAD
loadManagerDashboard();
