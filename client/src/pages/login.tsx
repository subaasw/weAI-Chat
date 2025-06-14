import { useState } from "react";
import { useNavigate, Link } from "react-router";

import { useAppContext } from "@/context/AppContextProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const navigate = useNavigate();
  const { userLogin } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { id, type } = await userLogin(email, password);
      if (id) {
        setTimeout(() => {
          if (type === "admin") {
            navigate("/admin");
            return;
          }

          navigate("/chat");
        }, 1000);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm bg-white border border-slate-100 animate-fadeIn delay-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Login</CardTitle>
        <CardDescription className="text-center text-sm">
          Enter your credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full focus:animate-pulse"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full focus:animate-pulse"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm animate-shake">{error}</p>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 animate-fadeIn">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium text-center mb-6 text-slate-800 animate-slideDown">
          WeAI Chat
        </h1>
        <div className="animate-slideUp">
          <LoginForm />
          <div className="text-center mt-4 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-slate-800 hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
