async function loadEmployeeDashboard() {
  const meRes = await fetch("/auth/me", { credentials: "include" });

  if (!meRes.ok) {
    window.location.href = "/auth/login.html";
    return;
  }

  const user = await meRes.json();
  document.getElementById("welcome").textContent =
    `Welcome ${user.username} (${user.department})`;

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
      "<p class='text-muted'>No issues reported yet.</p>";
    return;
  }

  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "card";

    const canEdit = ["OPEN", "IN_PROGRESS"].includes(issue.status);

    const statusClass =
      issue.status === "OPEN"
        ? "badge-warning"
        : issue.status === "IN_PROGRESS"
        ? "badge-info"
        : issue.status === "RESOLVED"
        ? "badge-success"
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
        Created: ${new Date(issue.createdAt).toLocaleString()}
      </div>

      <div style="display:flex; gap:10px; align-items:center;">
        ${
          canEdit
            ? `<button class="btn btn-primary"
                onclick="editIssue(
                  '${issue._id}',
                  '${escapeText(issue.title)}',
                  '${escapeText(issue.description)}'
                )">
                Edit
              </button>`
            : `<span class="text-muted">
                Editing disabled (Issue ${issue.status})
              </span>`
        }

        <button class="btn btn-secondary"
          onclick="toggleHistory('${issue._id}')">
          View History
        </button>
      </div>

      <div id="history-${issue._id}"
        style="display:none; margin-top:12px;">
      </div>
    `;

    container.appendChild(card);
  });
}

async function createIssue() {
  const title = document.getElementById("issueTitle").value;
  const description = document.getElementById("issueDescription").value;
  const department = document.getElementById("issueDepartment").value;

  if (!title || !description || !department) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch("/issues", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, department })
  });

  if (!res.ok) {
    alert("Failed to create issue");
    return;
  }

  document.getElementById("issueTitle").value = "";
  document.getElementById("issueDescription").value = "";
  document.getElementById("issueDepartment").value = "";

  await loadIssues();
}

// ✏️ EMPLOYEE EDIT — title & description only
async function editIssue(id, oldTitle, oldDescription) {
  const title = prompt("Edit title:", oldTitle);
  if (title === null) return;

  const description = prompt("Edit description:", oldDescription);
  if (description === null) return;

  const res = await fetch(`/issues/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description })
  });

  if (!res.ok) {
    alert("Editing not allowed");
    return;
  }

  await loadIssues();
}

// 🔁 HISTORY TOGGLE (lazy load)
function toggleHistory(issueId) {
  const el = document.getElementById(`history-${issueId}`);

  if (el.style.display === "block") {
    el.style.display = "none";
    return;
  }

  loadHistory(issueId);
}

async function loadHistory(issueId) {
  const res = await fetch(`/issues/${issueId}`, {
    credentials: "include"
  });

  const issue = await res.json();
  const el = document.getElementById(`history-${issueId}`);
  el.innerHTML = "";

  if (!issue.history || issue.history.length === 0) {
    el.innerHTML =
      "<p class='text-muted'>No history available.</p>";
  } else {
    issue.history.forEach(h => {
      const row = document.createElement("div");
      row.style.borderTop = "1px solid #eee";
      row.style.padding = "6px 0";

      let text = h.action.replace("_", " ");
      if (h.from && h.to) {
        text += `: "${h.from}" → "${h.to}"`;
      }

      row.innerHTML = `
        <b>${text}</b>
        <div class="text-muted">
          by ${h.by.username} (${h.by.role}) •
          ${new Date(h.timestamp).toLocaleString()}
        </div>
      `;

      el.appendChild(row);
    });
  }

  el.style.display = "block";
}

// 🔐 Escape text for safe inline JS
function escapeText(text) {
  return text.replace(/'/g, "\\'");
}

// ✅ Initial load
loadEmployeeDashboard();
