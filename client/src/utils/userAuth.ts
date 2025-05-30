import serverCall from "@/lib/serverCall";
import { AuthEndpoints } from "./api-constant";
import { UserProps } from "@/types/userAuth";

export default class AuthService {
  static async login(email: string, password: string): Promise<UserProps> {
    const data: UserProps = await serverCall.post(AuthEndpoints.login, {
      email,
      password,
    });

    if (data.id && data.email) {
      localStorage.setItem("user", JSON.stringify(data));
    }

    return data;
  }

  static async register(
    email: string,
    fullName: string,
    password: string,
    confirmPassword: string
  ): Promise<UserProps> {
    const user: UserProps = await serverCall.post(AuthEndpoints.register, {
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (user.id && user.email) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return user;
  }

  static async fetchCurrent(): Promise<UserProps> {
    const user: UserProps = await serverCall.get(AuthEndpoints.me);
    return user;
  }
}
