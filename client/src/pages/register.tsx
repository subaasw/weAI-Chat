import { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthService from "@/utils/userAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const user = await AuthService.register(
        email,
        fullName,
        password,
        confirmPassword
      );

      if (user.id) {
        setTimeout(() => {
          navigate("/chat");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 animate-fadeIn">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium text-center mb-6 text-slate-800 animate-slideDown">
          Create Account
        </h1>
        <div className="animate-slideUp">
          <Card className="w-full shadow-sm bg-white border border-slate-100 animate-fadeIn">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-center">Register</CardTitle>
              <CardDescription className="text-center text-sm">
                Create a new account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full focus:animate-pulse"
                  />
                </div>
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
                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </CardFooter>
          </Card>
          <div className="text-center mt-4 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/" className="text-slate-800 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
