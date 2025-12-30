// ================= INIT =================
async function loadAdminDashboard() {
  const meRes = await fetch("/auth/me", { credentials: "include" });

  if (!meRes.ok) {
    window.location.href = "/auth/login.html";
    return;
  }

  const user = await meRes.json();

  if (user.role !== "ADMIN") {
    alert("Access denied");
    window.location.href = "/auth/login.html";
    return;
  }

  document.getElementById("welcome").textContent =
    `Logged in as ${user.username} (ADMIN)`;

  await loadUsers();
  await loadIssues();
}

// ================= TAB HANDLING =================
function showTab(tab) {
  const usersTab = document.getElementById("usersTab");
  const issuesTab = document.getElementById("issuesTab");

  const usersBtn = document.getElementById("usersTabBtn");
  const issuesBtn = document.getElementById("issuesTabBtn");

  if (tab === "users") {
    usersTab.style.display = "block";
    issuesTab.style.display = "none";

    usersBtn.className = "btn btn-primary";
    issuesBtn.className = "btn btn-secondary";
  } else {
    usersTab.style.display = "none";
    issuesTab.style.display = "block";

    usersBtn.className = "btn btn-secondary";
    issuesBtn.className = "btn btn-primary";
  }
}

// ================= USERS =================
async function loadUsers() {
  const res = await fetch("/admin/users", { credentials: "include" });
  const users = await res.json();

  const managersContainer = document.getElementById("managersList");
  const employeesContainer = document.getElementById("employeesList");

  managersContainer.innerHTML = "";
  employeesContainer.innerHTML = "";

  if (users.length === 0) {
    employeesContainer.innerHTML = "<p>No users found.</p>";
    return;
  }

  const managers = users.filter(u => u.role === "MANAGER");
  const employees = users.filter(u => u.role === "EMPLOYEE");

  // ---------- MANAGERS ----------
  if (managers.length === 0) {
    managersContainer.innerHTML =
      "<p class='text-muted'>No managers found.</p>";
  } else {
    managers.forEach(u => {
      managersContainer.appendChild(renderUserCard(u, false));
    });
  }

  // ---------- EMPLOYEES ----------
  if (employees.length === 0) {
    employeesContainer.innerHTML =
      "<p class='text-muted'>No employees found.</p>";
  } else {
    employees.forEach(u => {
      employeesContainer.appendChild(renderUserCard(u, true));
    });
  }
}

function renderUserCard(user, allowPromote) {
  const div = document.createElement("div");
  div.className = "card";

  let actions = "";

  // 🔵 Approve pending employee
  if (user.status === "PENDING" && user.role === "EMPLOYEE") {
    actions = `
      <button class="btn btn-primary"
        onclick="approveUser('${user.username}')">
        Approve
      </button>
    `;
  }

  // 🟣 Promote active employee
  if (allowPromote && user.status === "ACTIVE") {
    actions += `
      <button class="btn btn-secondary"
        onclick="promoteUser('${user.username}')">
        Promote to Manager
      </button>
    `;
  }

  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <b>${user.username}</b>
        <span class="badge ${user.role === "MANAGER" ? "badge-warning" : "badge-dark"}">
          ${user.role}
        </span>
        <span class="badge ${user.status === "ACTIVE" ? "badge-success" : "badge-warning"}">
          ${user.status}
        </span>
        <div class="text-muted" style="margin-top:4px;">
          ${user.firstName} ${user.lastName} • ${user.department}
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        ${actions}
      </div>
    </div>
  `;

  return div;
}

// ---------------- PROMOTE USER ----------------
async function promoteUser(username) {
  if (!confirm(`Promote ${username} to MANAGER?`)) return;

  const res = await fetch(
    `/admin/users/${username}/promote`,
    { method: "PUT", credentials: "include" }
  );

  if (!res.ok) {
    alert("Failed to promote user");
    return;
  }

  await loadUsers();
}

// ================= ISSUES =================
async function loadIssues() {
  const res = await fetch("/issues", { credentials: "include" });
  const issues = await res.json();

  renderIssues(issues);
}

function renderIssues(issues) {
  const container = document.getElementById("issuesList");
  container.innerHTML = "";

  if (issues.length === 0) {
    container.innerHTML = "<p class='text-muted'>No issues found.</p>";
    return;
  }

  // Group by department
  const grouped = {};
  issues.forEach(issue => {
    if (!grouped[issue.department]) {
      grouped[issue.department] = [];
    }
    grouped[issue.department].push(issue);
  });

  for (const dept in grouped) {
    const deptCard = document.createElement("div");
    deptCard.className = "card";

    deptCard.innerHTML = `<h3>${dept} Department</h3>`;

    grouped[dept].forEach(issue => {
      const statusBadge =
        issue.status === "OPEN"
          ? "badge-warning"
          : issue.status === "IN_PROGRESS"
          ? "badge-info"
          : "badge-success";

      const item = document.createElement("div");
      item.style.borderTop = "1px solid #eee";
      item.style.padding = "10px 0";

      item.innerHTML = `
        <strong>${issue.title}</strong>
        <span class="badge ${statusBadge}">${issue.status}</span>

        <div class="text-muted">
          ${issue.createdBy.username} •
          ${new Date(issue.createdAt).toLocaleString()}
        </div>
      `;

      deptCard.appendChild(item);
    });

    container.appendChild(deptCard);
  }
}

// ================= START =================
loadAdminDashboard();
