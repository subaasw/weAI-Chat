const BASE_URL = import.meta.env.VITE_API_URL;

const getFullURL = (path: string) => BASE_URL + path;

const AuthEndpoints = {
  login: getFullURL("/login"),
  register: getFullURL("/register"),
  me: getFullURL("/user/me"),
  logout: getFullURL("/user/logout"),
};

const ChatEndpoints = {
  base: getFullURL("/chat"),
  conversation: {
    all: getFullURL("/chat/conversations"),
    single: (id: string) => getFullURL(`/chat/${id}`),
  },
};

const FileUploadEndpoint = {
  chunk: getFullURL("/upload/files"),
};

export { BASE_URL, AuthEndpoints, ChatEndpoints, FileUploadEndpoint };
