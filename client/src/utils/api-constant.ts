const BASE_URL = import.meta.env.VITE_API_URL;

const AUTH_URL = {
  login: BASE_URL + "/login",
  register: BASE_URL + "/register",
  me: BASE_URL + "/user/me",
  logout: BASE_URL + "/logout"
};

const CHAT_URL = BASE_URL + "/chat";

export { BASE_URL, AUTH_URL, CHAT_URL };
