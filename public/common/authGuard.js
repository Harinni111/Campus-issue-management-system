async function authGuard(allowedRoles = []) {
  const res = await fetch("/auth/me", {
    credentials: "include"
  });

  if (!res.ok) {
    window.location.href = "/auth/login.html";
    return;
  }

  const user = await res.json();

  //  ROLE CHECK
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    alert("Access denied");
    window.location.href = "/auth/login.html";
    return;
  }

  // Optional: expose user globally
  window.currentUser = user;
}
