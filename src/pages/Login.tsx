import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const { login, verifyOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setShowOtpForm(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOtp(otp);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-nutmeg-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nutmeg-700">NutMeg TPPL</h1>
          <p className="text-muted-foreground mt-2">
            Enterprise Management System
          </p>
        </div>

        <Card className="border-t-4 border-t-nutmeg-600 shadow-lg">
          <CardHeader>
            <CardTitle>{showOtpForm ? "Verify OTP" : "Sign In"}</CardTitle>
            <CardDescription>
              {showOtpForm
                ? "Enter the one-time password sent to your email"
                : "Please sign in with your NutMeg official email"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {showOtpForm ? (
              <form onSubmit={handleVerifyOtp}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 bg-nutmeg-600 hover:bg-nutmeg-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="text-sm text-center mt-4">
                  <button
                    type="button"
                    className="text-nutmeg-600 hover:text-nutmeg-800 underline"
                    onClick={() => setShowOtpForm(false)}
                  >
                    Back to login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@nmsolutions.co.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="text-sm text-nutmeg-600 hover:text-nutmeg-800"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 bg-nutmeg-600 hover:bg-nutmeg-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Protected by Multi-Factor Authentication
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
