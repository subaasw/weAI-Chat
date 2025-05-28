export type userLoginProps = {
  email: string;
  password: string;
};

export type userRegisterProps = {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
};

export interface UserProps {
  id: string;
  name: string;
  email: string;
  type: "user" | "admin";
  created_at: string;
  updated_at: string;
}
