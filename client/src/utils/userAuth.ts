import serverCall, { postRequest } from "@/utils/serverCall";
import { AUTH_URL } from "./api-constant";

async function userLogin(username: string, password: string) {
  const res = await postRequest(AUTH_URL.login, { username, password });
  const data = await res.json();

  if (data?.token) {
    localStorage.setItem("session_token", data.token);
  }

  if (data?.user_id) {
    localStorage.setItem(
      "user",
      JSON.stringify({ user_id: data.user_id, username: data.username })
    );
  }

  return res;
}

async function userRegister(
  username: string,
  password: string,
  confirm_password: string
) {
  const res = await postRequest(AUTH_URL.register, {
    username,
    password,
    confirm_password,
  });
  const data = await res.json();

  setTimeout(() => {
    if (data?.token) {
      localStorage.setItem("session_token", data.token);
    }

    if (data?.user_id) {
      localStorage.setItem(
        "user",
        JSON.stringify({ user_id: data.user_id, username: data.username })
      );
    }
  }, 500);

  return res;
}

async function currentUserInfo() {
  const res = await serverCall(AUTH_URL.me);
  const data: { id: Number; username: string } = await res.json();

  return data;
}

export { userLogin, userRegister, currentUserInfo };
