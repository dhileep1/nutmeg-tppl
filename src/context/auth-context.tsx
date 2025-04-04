
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface User {
  email: string;
  name: string;
  role: 'admin' | 'member';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login API call
    setIsLoading(true);
    
    // Validate NutMeg email domain
    if (!email.endsWith('@nmsolutions.co.in')) {
      toast({
        title: "Login Failed",
        description: "Please use your NutMeg official email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
    
    // For demo purposes, we'll accept any password for these test accounts
    if (email === 'admin@nmsolutions.co.in' || email === 'member@nmsolutions.co.in') {
      // Simulate OTP being sent
      toast({
        title: "OTP Sent",
        description: "A one-time password has been sent to your email",
      });
      setPendingEmail(email);
      setIsLoading(false);
      return true;
    }
    
    toast({
      title: "Login Failed",
      description: "Invalid credentials",
      variant: "destructive",
    });
    setIsLoading(false);
    return false;
  };

  const verifyOtp = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    
    // For demo, we'll accept any 6-digit OTP
    if (otp.length === 6 && /^\d+$/.test(otp) && pendingEmail) {
      const isAdmin = pendingEmail === 'admin@nmsolutions.co.in';
      const user = {
        email: pendingEmail,
        name: isAdmin ? 'Admin User' : 'Team Member',
        role: isAdmin ? 'admin' as const : 'member' as const
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
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
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user, 
      login,
      verifyOtp,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
