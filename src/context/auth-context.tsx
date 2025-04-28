import { auth } from "../firebase.js";
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface User {
  email: string;
  name: string;
  user_id: string;
  role: "admin" | "member";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully!",
      });
      setPendingEmail(email); // whatever you're doing next
      return true;
    } catch (error: any) {
      console.error(error.message);
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);

    // For demo, we'll accept any 6-digit OTP
    if (otp.length === 6 && /^\d+$/.test(otp) && pendingEmail) {
      const response = await axios.get(
        `http://127.0.0.1:3000/check_role/${pendingEmail}`
      );
      if (response.data.role_type === null) {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      const isAdmin = response.data.role_type.toLowerCase() === "admin";
      const user = {
        email: pendingEmail,
        user_id: response.data.user_id,
        name: isAdmin ? "Admin User" : "Team Member",
        role: isAdmin ? ("admin" as const) : ("member" as const),
      };

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      setPendingEmail(null);

      toast({
        title: "Login Successful",
        description: `Welcome, ${user.name}`,
      });

      setIsLoading(false);
      return true;
    }

    toast({
      title: "Verification Failed",
      description: "Invalid OTP. Please try again.",
      variant: "destructive",
    });

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
