async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  error.textContent = "";

  const res = await fetch("/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    error.textContent = data.error || "Login failed";
    return;
  }

  // 🔁 ROLE-BASED REDIRECT
  if (data.role === "ADMIN") {
    window.location.href = "/dashboards/admin.html";
  } else if (data.role === "MANAGER") {
    window.location.href = "/dashboards/manager.html";
  } else {
    window.location.href = "/dashboards/employee.html";
  }
}
