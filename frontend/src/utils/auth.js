export function saveAuth(token, role, fullName) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("fullName", fullName);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("fullName");
}

export function getRole() {
  return localStorage.getItem("role");
}

export function getName() {
  return localStorage.getItem("fullName");
}

