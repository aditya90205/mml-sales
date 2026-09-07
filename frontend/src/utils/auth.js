const AUTH_KEY = "mml_auth";

// Dummy credentials used until a real auth API is wired up.
export const DUMMY_CREDENTIALS = {
  username: "sales@mml.com",
  password: "1234567890",
};

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login() {
  localStorage.setItem(AUTH_KEY, "true");
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
