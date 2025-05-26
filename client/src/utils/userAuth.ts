import serverCall, { postRequest } from "@/lib/serverCall";
import { AuthEndpoints } from "./api-constant";
import { UserProps } from "@/types/userAuth";

export default class AuthService {
  static async login(email: string, password: string): Promise<Response> {
    const res = await postRequest(AuthEndpoints.login, { email, password });
    if (!res.ok) return res;

    const data: UserProps = await res.json();

    setTimeout(() => {
      if (data.id && data.email) {
        localStorage.setItem("user", JSON.stringify(data));
      }
    }, 500);
    return res;
  }

  static async register(
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string
  ): Promise<Response> {
    const res = await postRequest(AuthEndpoints.register, {
      fullName,
      email,
      password,
      confirmPassword,
    });
    if (!res.ok) return res;

    const data: UserProps = await res.json();

    setTimeout(() => {
      if (data.id && data.email) {
        localStorage.setItem("user", JSON.stringify(data));
      }
    }, 500);

    return res;
  }

  static async fetchCurrent(): Promise<UserProps> {
    const res = await serverCall(AuthEndpoints.me);
    if (!res.ok) {
      throw new Error("Failed to fetch current user");
    }
    const data: UserProps = await res.json();
    return data;
  }
}
