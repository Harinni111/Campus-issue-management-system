function logout() {
  document.cookie = "auth_token=; Max-Age=0; path=/";
  window.location.href = "/auth/login.html";
}
